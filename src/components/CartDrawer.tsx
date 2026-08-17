"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { items, removeFromCart, updateQuantity, cartTotal, drawerOpen, closeDrawer } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    if (drawerOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  async function handleCheckout() {
    if (items.length === 0) return;
    setCheckingOut(true);
    setCheckoutError(false);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            color: i.color,
            size: i.size,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (data.url) {
        // Don't clear cart here — clear it on the thank-you page after confirmed payment
        window.location.replace(data.url);
      } else if (data.error?.includes("Variant not available") || data.error?.includes("not found")) {
        setCheckoutError(true);
        setCheckingOut(false);
      } else {
        setCheckoutError(true);
        setCheckingOut(false);
      }
    } catch {
      setCheckoutError(true);
      setCheckingOut(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping cart"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-black text-white">
          <h2 className="text-lg font-black uppercase tracking-widest">Your Cart</h2>
          <button
            onClick={closeDrawer}
            aria-label="Close cart"
            className="w-11 h-11 flex items-center justify-center text-white/70 hover:text-yellow-400 transition-colors text-2xl font-black leading-none"
          >
            &times;
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-20">
              <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="font-bold text-lg text-gray-300 mb-1">Your cart is empty</p>
              <p className="text-sm">Add some gear to get started.</p>
              <button
                onClick={closeDrawer}
                className="mt-6 bg-yellow-400 text-black font-black uppercase tracking-wide px-6 py-2 rounded-full hover:bg-yellow-300 transition-colors text-sm"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => {
              const lineKey = `${item.productId}|${item.color ?? ""}|${item.size}`;
              const label = item.color ? `${item.color} / ${item.size}` : item.size;
              return (
                <div key={lineKey} className="flex gap-3 items-start border-b border-gray-100 pb-4">
                  {/* Image */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="80px" className="object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">👕</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-black text-sm leading-tight truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                    <p className="text-sm font-black text-black mt-1">${(item.price * item.quantity).toFixed(2)}</p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="w-11 h-11 rounded-full border-2 border-gray-200 flex items-center justify-center font-black text-gray-600 hover:border-black hover:text-black transition-colors text-base leading-none"
                      >
                        &minus;
                      </button>
                      <span className="text-sm font-black w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="w-11 h-11 rounded-full border-2 border-gray-200 flex items-center justify-center font-black text-gray-600 hover:border-black hover:text-black transition-colors text-base leading-none"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.productId, item.color, item.size)}
                    aria-label={`Remove ${item.name}`}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors shrink-0 self-start"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer (only when cart has items) */}
        {items.length > 0 && (() => {
          const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
          const bundleDiscount = totalQty >= 2;
          const discountAmount = bundleDiscount ? cartTotal * 0.1 : 0;
          const discountedTotal = cartTotal - discountAmount;
          const shipping = discountedTotal >= 100 ? 0 : 7.99;
          const grandTotal = discountedTotal + shipping;

          return (
            <div className="border-t border-gray-100 px-5 py-5 bg-white">
              {/* Bundle discount badge */}
              {bundleDiscount && shipping === 0 && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-bold text-center rounded-full px-3 py-1.5 mb-3">
                  10% bundle discount + free shipping!
                </div>
              )}
              {bundleDiscount && shipping > 0 && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-bold text-center rounded-full px-3 py-1.5 mb-3">
                  10% bundle discount applied! &nbsp;·&nbsp; Spend ${(100 - discountedTotal).toFixed(0)} more for free shipping
                </div>
              )}
              {!bundleDiscount && shipping === 0 && (
                <p className="text-xs text-center text-green-600 font-bold mb-3">Free shipping unlocked!</p>
              )}
              {!bundleDiscount && shipping > 0 && (
                <p className="text-xs text-center text-gray-400 mb-3">
                  Add 1 more item to unlock 10% off
                </p>
              )}

              {/* Price breakdown */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                {bundleDiscount && (
                  <div className="flex justify-between text-sm text-green-600 font-bold">
                    <span>Bundle Discount (10%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600 font-bold">Free</span> : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-base font-black text-black pt-1 border-t border-gray-100">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {checkoutError && (
                <p className="text-red-500 text-xs text-center mb-3">
                  Something went wrong. If an item is no longer available, remove it and try again.
                </p>
              )}

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="block w-full bg-yellow-400 text-black text-center font-black text-base py-3.5 rounded-full hover:bg-yellow-300 transition-colors uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed mb-3"
              >
                {checkingOut ? "Redirecting..." : "Checkout"}
              </button>

              <button
                onClick={closeDrawer}
                className="block w-full border-2 border-gray-200 text-gray-600 text-center font-bold text-sm py-2.5 rounded-full hover:border-black hover:text-black transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          );
        })()}
      </div>
    </>
  );
}
