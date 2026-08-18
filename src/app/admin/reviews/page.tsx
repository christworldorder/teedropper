/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";

interface Review {
  id: string;
  productId: string;
  productName: string;
  rating: number;
  title: string;
  body: string;
  fit?: string;
  photoUrl?: string;
  authorName: string;
  verifiedPurchase: boolean;
  incentivized: boolean;
  createdAt: number;
}

const FIT_LABELS: Record<string, string> = {
  runs_small: "Runs small",
  true_to_size: "True to size",
  runs_large: "Runs large",
};

function Stars({ rating }: { rating: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? "text-yellow-400" : "text-gray-300"}>★</span>
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actioning, setActioning] = useState<string | null>(null);

  async function handleLoad() {
    if (!pw.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/reviews?password=${encodeURIComponent(pw)}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to load");
      setLoading(false);
      return;
    }
    setReviews(data.reviews ?? []);
    setAuthed(true);
    setLoading(false);
  }

  async function handleAction(id: string, action: "approve" | "reject") {
    setActioning(id);
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, password: pw }),
    });
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
    setActioning(null);
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl">
          <h1 className="text-2xl font-black uppercase mb-6 text-center">Reviews Queue</h1>
          <input
            type="password"
            placeholder="Admin password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLoad()}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg mb-3 focus:outline-none focus:border-black"
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button
            onClick={handleLoad}
            disabled={loading}
            className="w-full bg-black text-white font-black py-3 rounded-xl hover:bg-yellow-400 hover:text-black transition-colors uppercase disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load Reviews"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Reviews Queue</h1>
            <p className="text-gray-500 mt-1">{reviews.length} pending review{reviews.length !== 1 ? "s" : ""}</p>
          </div>
          <a href="/admin" className="text-sm font-bold underline text-gray-500 hover:text-black">
            Back to Admin
          </a>
        </div>

        {reviews.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm">
            All caught up — no pending reviews.
          </div>
        )}

        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">{review.productName}</p>
                  <Stars rating={review.rating} />
                  <h2 className="font-black text-lg mt-0.5">{review.title}</h2>
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-gray-700 text-sm leading-relaxed mb-3">{review.body}</p>

              {review.photoUrl && (
                <img
                  src={review.photoUrl}
                  alt="Customer photo"
                  className="w-28 h-28 object-cover rounded-xl mb-3 border border-gray-100"
                />
              )}

              <div className="flex flex-wrap gap-2 text-xs mb-4">
                <span className="font-bold text-gray-700">{review.authorName}</span>
                {review.verifiedPurchase && (
                  <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold">
                    Verified Purchase
                  </span>
                )}
                {review.fit && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {FIT_LABELS[review.fit] ?? review.fit}
                  </span>
                )}
                {review.incentivized && (
                  <span className="text-orange-500 font-bold">Incentivized — received free/discounted product (FTC disclosure will show)</span>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(review.id, "approve")}
                  disabled={actioning === review.id}
                  className="flex-1 bg-green-600 text-white font-black py-2.5 rounded-xl hover:bg-green-500 transition-colors uppercase text-sm disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(review.id, "reject")}
                  disabled={actioning === review.id}
                  className="flex-1 bg-gray-200 text-gray-700 font-black py-2.5 rounded-xl hover:bg-gray-300 transition-colors uppercase text-sm disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
              <p className="text-xs text-gray-300 mt-2 text-center">
                Note: you can reject but not delete — FTC compliance
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
