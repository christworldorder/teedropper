"use client";
import { useEffect, useState } from "react";
import { Product, getColors, getSizesForColor, isColorVariant, SIZES } from "@/lib/products";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import ReviewsSection from "@/components/ReviewsSection";

function slugId(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function ProductPageClient({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart, openDrawer, items } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [beltSiblings, setBeltSiblings] = useState<Product[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [buying, setBuying] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);
  const [checkoutError, setCheckoutError] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [sizeChart, setSizeChart] = useState(false);
  const [measurements, setMeasurements] = useState<{ type_label: string; values: { size: string; value?: string; min_value?: string; max_value?: string }[] }[] | null>(null);
  const [addedToast, setAddedToast] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: Product | null) => {
        setProduct(data);
        setLoading(false);
        // ViewContent — group level since no size selected yet
        if (data && typeof window !== "undefined" && (window as unknown as {fbq?: Function}).fbq) {
          (window as unknown as {fbq: Function}).fbq("track", "ViewContent", {
            content_ids: [id],
            content_type: "product_group",
            content_name: data.name,
            value: data.price,
            currency: "USD",
          });
        }
        // Auto-select from URL params (?color=Black&size=L) or fall back to single-option logic
        if (data) {
          const paramColor = searchParams.get("color");
          const paramSize = searchParams.get("size");
          const cols = getColors(data.variants || {});
          const colorToSet = paramColor && cols.includes(paramColor) ? paramColor
            : cols.length === 1 ? cols[0] : "";
          if (colorToSet) setSelectedColor(colorToSet);

          const singleKeys = Object.keys(data.variants || {}).filter(k => !k.includes("-"));
          const sizeToSet = paramSize && data.variants?.[`${colorToSet}-${paramSize}`] ? paramSize
            : paramSize && data.variants?.[paramSize] ? paramSize
            : singleKeys.length === 1 ? singleKeys[0] : "";
          if (sizeToSet) setSelectedSize(sizeToSet);
        }
        if (data?.name.toUpperCase().includes("IGBBMN")) {
          fetch("/api/products")
            .then((r) => r.json())
            .then((all: Product[]) =>
              setBeltSiblings(all.filter((p) => p.name.toUpperCase().includes("IGBBMN") && p.id !== data.id))
            );
        }
      })
      .catch(() => setLoading(false));
  }, [id]);

  function validate(): boolean {
    const hasColors = product && isColorVariant(product.variants);
    if (hasColors && !selectedColor) { setColorError(true); return false; }
    if (!selectedSize) { setSizeError(true); return false; }
    setColorError(false);
    setSizeError(false);
    return true;
  }

  function getVariantId(): string | null {
    if (!product) return null;
    const variantKey = selectedColor ? `${selectedColor}-${selectedSize}` : selectedSize;
    return product.variants?.[variantKey] ?? null;
  }

  function handleAddToCart() {
    if (!product) return;
    if (!validate()) return;

    const variantId = getVariantId();
    if (!variantId) return;

    const image = (selectedColor && product.colorImages?.[selectedColor]) || product.image || "";

    addToCart({
      productId: id,
      name: product.name,
      image,
      price: product.price,
      color: selectedColor || undefined,
      size: selectedSize,
      variantId,
    });

    // AddToCart pixel event — ID matches feed format: docId-color-size
    const feedItemId = `${id}-${slugId(selectedColor || "black")}-${slugId(selectedSize)}`;
    if (typeof window !== "undefined" && (window as unknown as {fbq?: Function}).fbq) {
      (window as unknown as {fbq: Function}).fbq("track", "AddToCart", {
        content_ids: [feedItemId],
        content_type: "product",
        content_name: product.name,
        value: product.price,
        currency: "USD",
      });
    }

    // Show brief "Added!" toast
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  }

  function handleOpenCart() {
    if (!product) return;
    if (!validate()) return;

    const variantId = getVariantId();
    if (!variantId) return;

    const image = (selectedColor && product.colorImages?.[selectedColor]) || product.image || "";

    addToCart({
      productId: id,
      name: product.name,
      image,
      price: product.price,
      color: selectedColor || undefined,
      size: selectedSize,
      variantId,
    });

    openDrawer();
  }

  async function handleBuyNow() {
    if (!product) return;
    if (!validate()) return;

    const variantId = getVariantId();
    if (!variantId) return;

    const image = (selectedColor && product.colorImages?.[selectedColor]) || product.image || "";

    setBuying(true);
    setCheckoutError(false);

    try {
      // If cart already has items, add this item and checkout everything together
      const lineKey = `${id}|${selectedColor ?? ""}|${selectedSize}`;
      const alreadyInCart = items.find((i) => `${i.productId}|${i.color ?? ""}|${i.size}` === lineKey);

      let checkoutBody: object;

      if (items.length > 0) {
        // Only add to cart if not already in cart
        if (!alreadyInCart) {
          addToCart({ productId: id, name: product.name, image, price: product.price, color: selectedColor || undefined, size: selectedSize, variantId });
        }
        // Build merged items list for checkout (don't double-count already-carted items)
        const cartItems = alreadyInCart
          ? items.map((i) => ({ productId: i.productId, color: i.color, size: i.size, quantity: i.quantity }))
          : [...items.map((i) => ({ productId: i.productId, color: i.color, size: i.size, quantity: i.quantity })),
             { productId: id, color: selectedColor || undefined, size: selectedSize, quantity: 1 }];
        checkoutBody = { items: cartItems };
      } else {
        checkoutBody = { productId: id, color: selectedColor || undefined, size: selectedSize };
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutBody),
      });
      const data = await res.json();
      if (data.url) {
        window.location.replace(data.url);
      } else {
        setCheckoutError(true);
        setBuying(false);
      }
    } catch {
      setCheckoutError(true);
      setBuying(false);
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
  if (!product) return notFound();

  const hasColors = isColorVariant(product.variants);
  const colors = hasColors ? getColors(product.variants) : [];
  const SIZES_SET = new Set(SIZES as readonly string[]);
  const singleKeys = Object.keys(product.variants || {}).filter((k) => !k.includes("-"));
  const availableSizes = hasColors
    ? (selectedColor ? getSizesForColor(product.variants, selectedColor) : [])
    : [
        ...SIZES.filter((s) => product.variants?.[s]),
        ...singleKeys.filter((k) => !SIZES_SET.has(k)),
      ];

  const colorImage = (selectedColor && product.colorImages?.[selectedColor]) || product.image;
  const displayImage = activeImage ?? colorImage;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <a
        href="/"
        className="text-sm font-bold text-gray-800 underline underline-offset-2 mb-8 inline-block"
      >
        &larr; Back
      </a>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="flex flex-col gap-3">
          <div
            className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-square cursor-zoom-in"
            onClick={() => displayImage && setLightbox(true)}
          >
            {displayImage ? (
              <Image src={displayImage} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl text-gray-300">👕</div>
            )}
            <span className="absolute top-4 left-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {product.tag}
            </span>
            {displayImage && (
              <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                Tap to zoom
              </span>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.additionalImages && product.additionalImages.length > 0 && (() => {
            const thumbs = [colorImage, ...product.additionalImages!].filter(Boolean) as string[];
            return (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {thumbs.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(src === colorImage && i === 0 ? null : src)}
                    className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      displayImage === src ? "border-black" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Image src={src} alt={`${product.name} view ${i + 1}`} fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            );
          })()}
        </div>

        {lightbox && displayImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <button
              className="absolute top-4 right-4 text-white text-4xl font-black leading-none hover:text-yellow-400"
              onClick={() => setLightbox(false)}
            >
              &times;
            </button>
            <div className="relative w-full max-w-2xl aspect-square" onClick={(e) => e.stopPropagation()}>
              <Image src={displayImage} alt={product.name} fill sizes="100vw" className="object-contain" />
            </div>
          </div>
        )}

        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-4">{product.name}</h1>
          <p className="text-gray-600 text-lg mb-6">{product.description}</p>
          {beltSiblings.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-wide mb-3">Also available in</p>
              <div className="flex flex-wrap gap-3">
                {beltSiblings.map((p) => {
                  const match = p.name.match(/\b(White|Blue|Purple|Brown|Black)\s+Belt\b/i);
                  const label = match ? `${match[1]} Belt` : p.name;
                  return (
                    <Link
                      key={p.id}
                      href={`/shop/${p.id}`}
                      className="flex items-center gap-2 border-2 border-gray-200 hover:border-black rounded-full px-4 py-2 text-sm font-bold transition-colors"
                    >
                      {p.image && (
                        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-100 shrink-0">
                          <Image src={p.image} alt={label} fill className="object-cover" sizes="24px" />
                        </div>
                      )}
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          <div className="text-4xl font-black mb-6">${product.price.toFixed(2)}</div>

          {hasColors && colors.length > 1 && (
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-wide mb-3">
                Select Color {colorError && <span className="text-red-500 normal-case font-normal ml-2">— Please pick a color</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => { setSelectedColor(color); setSelectedSize(""); setColorError(false); setActiveImage(null); }}
                    className={`px-4 py-2 rounded-full border-2 font-bold text-sm transition-colors ${
                      selectedColor === color ? "bg-black text-white border-black" : "border-gray-300 text-gray-700 hover:border-black"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.category === "flags" && (
            <div className="mb-6 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700">
              <p className="font-black uppercase tracking-wide text-black mb-1">Flag Dimensions</p>
              <p>3 × 5 ft &nbsp;(90 × 150 cm)</p>
              <p className="text-gray-500 text-xs mt-1">Printed on durable polyester. Grommets included.</p>
            </div>
          )}

          {(availableSizes.length > 1) && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold uppercase tracking-wide">
                  Select Size {sizeError && <span className="text-red-500 normal-case font-normal ml-2">— Please pick a size</span>}
                </p>

                <button
                  onClick={() => {
                    setSizeChart(true);
                    if (!measurements) {
                      fetch(`/api/sizes/${id}`).then(r => r.json()).then(d => setMeasurements(d.measurements || null));
                    }
                  }}
                  className="text-xs font-bold bg-yellow-400 hover:bg-yellow-300 text-black px-3 py-1 rounded-full transition-colors"
                >
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setSizeError(false); }}
                    className={`px-4 py-2 rounded-full border-2 font-bold text-sm transition-colors ${
                      selectedSize === size ? "bg-black text-white border-black" : "border-gray-300 text-gray-700 hover:border-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">True to size. Size up for an oversized fit.</p>
            </div>
          )}

          {hasColors && !selectedColor && availableSizes.length === 0 && (
            <p className="text-sm text-gray-400 mb-6">Pick a color to see available sizes.</p>
          )}

          {/* Added toast */}
          {addedToast && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-300 text-green-700 text-sm font-bold px-4 py-2 rounded-full mb-4 animate-pulse">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Added to cart!
            </div>
          )}

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            className="block w-full bg-black text-white text-center font-black text-lg py-4 rounded-full hover:bg-gray-800 transition-colors uppercase tracking-wide mb-3"
          >
            Add to Cart
          </button>

          {/* Buy Now button */}
          <button
            onClick={handleBuyNow}
            disabled={buying}
            className="block w-full bg-yellow-400 text-black text-center font-black text-lg py-4 rounded-full hover:bg-yellow-300 transition-colors uppercase tracking-wide mb-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {buying ? "Redirecting to checkout..." : "Buy Now"}
          </button>

          {/* View Cart link */}
          <button
            onClick={handleOpenCart}
            className="block w-full text-center text-sm font-bold text-gray-700 hover:text-black py-2 transition-colors underline underline-offset-2 mb-2"
          >
            Add to cart &amp; view cart
          </button>

          {checkoutError && (
            <p className="text-red-500 text-sm text-center mb-3">Something went wrong. Please try again or email teedropper@proton.me</p>
          )}

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-1">
            <span>🔒 Secure checkout</span>
            <span>·</span>
            <span>
              <svg display="inline" width="14" height="11" viewBox="0 0 28 20" style={{display:"inline",verticalAlign:"middle",marginRight:"3px"}} aria-hidden="true">
                <rect width="28" height="20" fill="#B22234"/>
                <rect y="2.86" width="28" height="1.54" fill="#fff"/>
                <rect y="5.71" width="28" height="1.54" fill="#B22234"/>
                <rect y="8.57" width="28" height="1.54" fill="#fff"/>
                <rect y="11.43" width="28" height="1.54" fill="#B22234"/>
                <rect y="14.29" width="28" height="1.54" fill="#fff"/>
                <rect y="17.14" width="28" height="2.86" fill="#B22234"/>
                <rect width="11.2" height="10.77" fill="#3C3B6E"/>
              </svg>
              Printed &amp; shipped from the US
            </span>
            <span>·</span>
            <span>Ships in 5–10 days</span>
            <span>·</span>
            <Link href="/returns" className="underline hover:text-black">Returns policy</Link>
          </div>
        </div>
      </div>

      <ReviewsSection productId={id} />

      {/* Size Chart Modal */}
      {sizeChart && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setSizeChart(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-2xl font-black hover:text-yellow-500" onClick={() => setSizeChart(false)}>&times;</button>
            <h2 className="text-xl font-black uppercase tracking-tight mb-4 text-black">Size Guide (inches)</h2>
            {!measurements ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="px-3 py-2 text-left font-bold">Size</th>
                    {measurements.map(m => (
                      <th key={m.type_label} className="px-3 py-2 text-left font-bold">{m.type_label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {availableSizes.map((size, i) => {
                    const hasSize = measurements[0]?.values.some(v => v.size === size);
                    if (!hasSize) return null;
                    return (
                      <tr key={size} className={i % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                        <td className="px-3 py-2 font-black text-black">{size}</td>
                        {measurements.map(m => {
                          const v = m.values.find(v => v.size === size);
                          const val = v ? (v.value || (v.min_value && v.max_value ? `${v.min_value}–${v.max_value}` : v.min_value || "")) : "—";
                          return <td key={m.type_label} className="px-3 py-2 text-gray-800">{val}</td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            <p className="text-xs text-gray-500 mt-4">Measurements may vary by up to 2 inches.</p>
          </div>
        </div>
      )}
    </div>
  );
}
