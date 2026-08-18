"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

interface Order {
  orderId: string;
  processedAt: number;
  estimatedFrom: string;
  estimatedTo: string;
  status: string;
  printfulOrderId: number | null;
  items: { variantId: string; quantity: number }[];
}

function OrderStatusContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [tokenError, setTokenError] = useState("");
  const [tokenLoading, setTokenLoading] = useState(!!token);
  const [error, setError] = useState("");

  // If token in URL, validate it immediately
  useEffect(() => {
    if (!token) return;
    setTokenLoading(true);
    fetch(`/api/order-status?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setTokenError(data.error);
        else setOrders(data.orders ?? []);
        setTokenLoading(false);
      })
      .catch(() => { setTokenError("Something went wrong."); setTokenLoading(false); });
  }, [token]);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); setLoading(false); return; }
      setSent(true);
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  }

  // Token in URL — loading
  if (token && tokenLoading) {
    return <p className="text-gray-400 text-sm">Verifying your link...</p>;
  }

  // Token in URL — error
  if (token && tokenError) {
    return (
      <div>
        <p className="text-red-500 font-bold mb-2">{tokenError}</p>
        <a href="/order-status" className="text-sm underline text-gray-600 hover:text-black">
          Request a new link
        </a>
      </div>
    );
  }

  // Token in URL — orders loaded
  if (token && orders) {
    if (orders.length === 0) {
      return (
        <div className="bg-gray-50 rounded-2xl p-6 text-center">
          <p className="text-gray-600 font-bold mb-1">No orders found</p>
          <p className="text-gray-400 text-sm mb-4">
            If you think this is wrong, contact us and we&apos;ll look it up manually.
          </p>
          <Link href="/support" className="text-sm font-bold underline text-gray-700 hover:text-black">
            Contact support
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => {
          const isRecent = Date.now() - order.processedAt < 10 * 24 * 60 * 60 * 1000;
          const orderDate = new Date(order.processedAt).toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric",
          });
          const failed = order.status === "printful_failed" || order.status === "printful_confirm_failed";

          return (
            <div key={order.orderId} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Ordered {orderDate}</p>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase px-2.5 py-1 rounded-full ${
                    failed ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                  }`}>
                    {failed ? "Needs attention" : "In production"}
                  </span>
                </div>
                {order.printfulOrderId && (
                  <p className="text-xs text-gray-400 text-right shrink-0">
                    Fulfillment #{order.printfulOrderId}
                  </p>
                )}
              </div>

              {isRecent && !failed && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-3">
                  <p className="text-sm font-bold text-yellow-900 mb-0.5">Estimated delivery</p>
                  <p className="text-sm text-yellow-800">{order.estimatedFrom} – {order.estimatedTo}</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Tracking info is emailed directly by our printer (Printful) when your order ships.
                  </p>
                </div>
              )}

              {order.items.length > 0 && (
                <p className="text-xs text-gray-400">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
              )}

              {failed && (
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
    );
  }

  // No token — email request form
  if (sent) {
    return (
      <div className="bg-gray-50 rounded-2xl p-8 text-center">
        <p className="text-2xl mb-2">📬</p>
        <p className="font-black text-lg mb-1">Check your inbox</p>
        <p className="text-gray-500 text-sm">
          If <strong>{email}</strong> has an order with us, we sent a link to view it. Check your spam folder if you don&apos;t see it in a minute.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleRequest} className="flex flex-col gap-4">
      <input
        type="email"
        required
        placeholder="Email you used at checkout"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-white text-gray-900"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white font-black px-6 py-3 rounded-xl hover:bg-yellow-400 hover:text-black transition-colors text-sm uppercase disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send me a link"}
      </button>
      <p className="text-xs text-gray-400">
        We&apos;ll email you a secure link. It expires in 1 hour.
      </p>
    </form>
  );
}

export default function OrderStatusPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Order Status</h1>
      <p className="text-gray-500 text-sm mb-8">
        Enter your checkout email and we&apos;ll send you a secure link to view your orders.
      </p>
      <Suspense fallback={<p className="text-gray-400 text-sm">Loading...</p>}>
        <OrderStatusContent />
      </Suspense>
    </div>
  );
}
