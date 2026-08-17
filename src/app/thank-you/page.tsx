"use client";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function ThankYouPage() {
  const { clearCart, items } = useCart();

  useEffect(() => {
    // Fire Purchase before clearing cart so Meta gets item IDs
    if (typeof window !== "undefined" && (window as unknown as {fbq?: Function}).fbq && items.length > 0) {
      const contentIds = items.map((i) =>
        i.color ? `${i.productId}_${i.color}-${i.size}` : `${i.productId}_${i.size}`
      );
      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      (window as unknown as {fbq: Function}).fbq("track", "Purchase", {
        content_ids: contentIds,
        content_type: "product",
        value: total,
        currency: "USD",
        num_items: items.reduce((sum, i) => sum + i.quantity, 0),
      });
    }

    try { localStorage.removeItem("teedropper_cart"); } catch {}
    clearCart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-4xl font-black mb-4">Order Confirmed!</h1>
      <p className="text-gray-600 text-lg mb-2">
        Your gear is being printed and will arrive in 5–10 days.
      </p>
      <p className="text-gray-500 text-sm mb-10">
        Check your email for a receipt and tracking info once it ships.
      </p>
      <Link
        href="/"
        className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition"
      >
        Shop More Drops
      </Link>
    </div>
  );
}
