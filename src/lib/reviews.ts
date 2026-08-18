export type ReviewStatus = "pending" | "approved" | "rejected";
export type FitFeedback = "runs_small" | "true_to_size" | "runs_large";

export interface Review {
  id?: string;
  productId: string;
  orderId: string;
  rating: number; // 1-5
  title: string;
  body: string;
  fit?: FitFeedback;
  photoUrl?: string;
  authorName: string;
  verifiedPurchase: boolean;
  incentivized: boolean; // true when photo included — FTC disclosure
  status: ReviewStatus;
  createdAt: number;
}

export interface ReviewToken {
  orderId: string;
  productId: string;
  used: boolean;
  createdAt: number;
}
