"use client";
import { useEffect, useState } from "react";
import { Product, getColors, getSizesForColor, isColorVariant, SIZES } from "@/lib/products";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function ProductPageClient({ id }: { id: string }) {
  const router = useRouter();
  const { addToCart, openDrawer } = useCart();
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

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: Product | null) => {
        setProduct(data);
        setLoading(false);
        // Auto-select color if only one option
        if (data) {
          const cols = getColors(data.variants || {});
          if (cols.length === 1) setSelectedColor(cols[0]);
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

    setBuying(true);
    setCheckoutError(false);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, color: selectedColor || undefined, size: selectedSize }),
      });
      const data = await res.json();
      if (data.url) {
        router.push(data.url);
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
  const availableSizes = hasColors
    ? (selectedColor ? getSizesForColor(product.variants, selectedColor) : [])
    : SIZES.filter((s) => product.variants?.[s]);

  const displayImage = (selectedColor && product.colorImages?.[selectedColor]) || product.image;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link href="/shop" className="text-sm font-bold text-gray-500 hover:text-black mb-8 inline-block">
        &larr; Back to Shop
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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
          {product.name.toUpperCase().includes("IGBBMN") && (
            <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm font-bold px-4 py-2 rounded-full mb-6">
              Print is on the back of the shirt
            </div>
          )}
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
                    onClick={() => { setSelectedColor(color); setSelectedSize(""); setColorError(false); }}
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

          {(availableSizes.length > 0) && (
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
            className="block w-full border-2 border-black text-black text-center font-black text-lg py-4 rounded-full hover:bg-black hover:text-white transition-colors uppercase tracking-wide mb-3"
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

          {/* View Cart link (only when items in cart — opens drawer) */}
          <button
            onClick={handleOpenCart}
            className="block w-full text-center text-sm font-bold text-gray-500 hover:text-black py-2 transition-colors underline underline-offset-2 mb-2"
          >
            Add to cart and view cart
          </button>

          {checkoutError && (
            <p className="text-red-500 text-sm text-center mb-3">Something went wrong. Please try again or email teedropper@proton.me</p>
          )}

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mt-1">
            <span>🔒 Secure checkout</span>
            <span>·</span>
            <span>Ships in 3-7 days</span>
            <span>·</span>
            <Link href="/returns" className="underline hover:text-black">Returns policy</Link>
          </div>
        </div>
      </div>

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
                  {["XS","S","M","L","XL","2XL","3XL"].map((size, i) => {
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
