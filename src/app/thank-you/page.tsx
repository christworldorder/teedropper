"use client";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function ThankYouPage() {
  const { clearCart } = useCart();

  // Clear cart once we land here — payment is confirmed
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-4xl font-black mb-4">Order Confirmed!</h1>
      <p className="text-gray-600 text-lg mb-2">
        Your gear is being printed and will ship in 3–7 business days.
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
