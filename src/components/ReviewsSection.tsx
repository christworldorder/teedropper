"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

interface Review {
  id: string;
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

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "text-xl" : "text-sm";
  return (
    <span className={cls}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? "text-yellow-400" : "text-gray-300"}>★</span>
      ))}
    </span>
  );
}

export default function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reviews/${productId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  if (loading) return null;

  if (reviews.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 border-t border-gray-200 mt-8">
        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Reviews</h2>
        <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
      </div>
    );
  }

  // Star breakdown
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 border-t border-gray-200 mt-8">
      <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
        Reviews ({reviews.length})
      </h2>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-8 mb-8">
        <div className="flex flex-col items-center justify-center shrink-0">
          <span className="text-5xl font-black">{avgRating.toFixed(1)}</span>
          <Stars rating={Math.round(avgRating)} size="lg" />
          <span className="text-xs text-gray-400 mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex-1 space-y-1.5">
          {breakdown.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-4 text-right font-bold text-gray-700">{star}</span>
              <span className="text-yellow-400 text-xs">★</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-yellow-400 h-full rounded-full transition-all"
                  style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : "0%" }}
                />
              </div>
              <span className="w-6 text-xs text-gray-400">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review list */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <Stars rating={review.rating} />
                <h3 className="font-black text-gray-900 mt-0.5">{review.title}</h3>
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
            </div>

            <p className="text-gray-700 text-sm leading-relaxed mb-3">{review.body}</p>

            {review.photoUrl && (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden mb-3">
                <Image
                  src={review.photoUrl}
                  alt="Customer photo"
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs">
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
                <span className="text-gray-400 italic">Includes customer photo</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
