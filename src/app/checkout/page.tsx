"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function CheckoutRedirect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const productsParam = searchParams.get("products");
    if (!productsParam) {
      window.location.href = "/";
      return;
    }

    // Meta sends: products=ITEM_ID:QTY,ITEM_ID2:QTY2
    // Our item IDs are: {20-char-firestoreId}_{size_with_underscores}
    const pairs = productsParam.split(",");
    const items = pairs
      .map((pair) => {
        const colonIdx = pair.lastIndexOf(":");
        if (colonIdx === -1) return null;
        const itemId = pair.substring(0, colonIdx);
        const qty = parseInt(pair.substring(colonIdx + 1)) || 1;
        // Firestore auto IDs are exactly 20 chars
        const productId = itemId.substring(0, 20);
        const sizeRaw = itemId.substring(21); // skip underscore separator
        const size = sizeRaw.replace(/_/g, " ");
        if (!productId || !size) return null;
        return { productId, size, quantity: qty };
      })
      .filter(Boolean);

    if (items.length === 0) {
      window.location.href = "/";
      return;
    }

    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.url) window.location.href = data.url;
        else window.location.href = "/";
      })
      .catch(() => {
        window.location.href = "/";
      });
  }, [searchParams]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <p>Loading your cart...</p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: "#000",
            color: "#fff",
            fontFamily: "sans-serif",
          }}
        >
          <p>Loading your cart...</p>
        </div>
      }
    >
      <CheckoutRedirect />
    </Suspense>
  );
}
