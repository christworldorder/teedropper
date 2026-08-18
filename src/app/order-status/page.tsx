"use client";
import { useState } from "react";
import Link from "next/link";

interface Order {
  orderId: string;
  processedAt: number;
  estimatedFrom: string;
  estimatedTo: string;
  status: string;
  printfulOrderId: number | null;
  items: { variantId: string; quantity: number }[];
}

export default function OrderStatusPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setOrders(null);
    setNotFound(false);
    setError("");

    try {
      const res = await fetch(`/api/order-status?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      if (data.orders.length === 0) {
        setNotFound(true);
      } else {
        setOrders(data.orders);
      }
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Order Status</h1>
      <p className="text-gray-500 text-sm mb-8">
        Enter the email address you used at checkout.
      </p>

      <form onSubmit={handleLookup} className="flex gap-2 mb-8">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white font-black px-5 py-3 rounded-xl hover:bg-yellow-400 hover:text-black transition-colors text-sm uppercase disabled:opacity-50"
        >
          {loading ? "..." : "Look up"}
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      {notFound && (
        <div className="bg-gray-50 rounded-2xl p-6 text-center">
          <p className="text-gray-600 font-bold mb-1">No orders found</p>
          <p className="text-gray-400 text-sm mb-4">
            Double-check the email address — it must match exactly what you entered at checkout.
          </p>
          <Link href="/support" className="text-sm font-bold underline text-gray-700 hover:text-black">
            Contact support
          </Link>
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const isRecent = Date.now() - order.processedAt < 10 * 24 * 60 * 60 * 1000;
            const orderDate = new Date(order.processedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div key={order.orderId} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Ordered {orderDate}</p>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase px-2.5 py-1 rounded-full ${
                      order.status === "printful_failed" || order.status === "printful_confirm_failed"
                        ? "bg-red-50 text-red-700"
                        : "bg-green-50 text-green-700"
                    }`}>
                      {order.status === "printful_failed" || order.status === "printful_confirm_failed"
                        ? "Needs attention"
                        : "In production"}
                    </span>
                  </div>
                  {order.printfulOrderId && (
                    <p className="text-xs text-gray-400 text-right shrink-0">
                      Fulfillment #{order.printfulOrderId}
                    </p>
                  )}
                </div>

                {isRecent && order.status !== "printful_failed" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-3">
                    <p className="text-sm font-bold text-yellow-900 mb-0.5">Estimated delivery</p>
                    <p className="text-sm text-yellow-800">
                      {order.estimatedFrom} – {order.estimatedTo}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Tracking info is emailed directly by our printer (Printful) when your order ships.
                    </p>
                  </div>
                )}

                {order.items.length > 0 && (
                  <p className="text-xs text-gray-400">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                )}

                {(order.status === "printful_failed" || order.status === "printful_confirm_failed") && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-red-600 mb-2">There was an issue processing this order. Please contact us.</p>
                    <Link href="/support" className="text-sm font-bold underline text-gray-700 hover:text-black">
                      Contact support
                    </Link>
                  </div>
                )}
              </div>
            );
          })}

          <p className="text-xs text-gray-400 text-center pt-2">
            Don&apos;t see what you need?{" "}
            <Link href="/support" className="underline hover:text-black">Contact support</Link>
          </p>
        </div>
      )}
    </div>
  );
}
