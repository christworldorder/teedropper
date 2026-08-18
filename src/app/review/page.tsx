import { getAdminDb } from "@/lib/firebase-admin";
import ReviewForm from "./ReviewForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Leave a Review — TeeDropper",
  robots: { index: false },
};

async function validateToken(token: string) {
  try {
    const db = getAdminDb();
    const tokenDoc = await db.collection("review_tokens").doc(token).get();
    if (!tokenDoc.exists) return null;
    const data = tokenDoc.data()!;
    if (data.used) return null;

    const productDoc = await db.collection("teedropper_products").doc(data.productId).get();
    const productName = productDoc.exists ? (productDoc.data()?.name ?? "your order") : "your order";

    return { productId: data.productId, productName, orderId: data.orderId };
  } catch {
    return null;
  }
}

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Invalid review link. Check your email for the correct link.</p>
      </div>
    );
  }

  const info = await validateToken(token);

  if (!info) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-black uppercase tracking-tight mb-3">Link Not Valid</h1>
        <p className="text-gray-500">
          This review link is either expired or has already been used. Each link works once.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-yellow-600 mb-1">Verified Purchase</p>
        <h1 className="text-3xl font-black uppercase tracking-tight mb-1">Leave a Review</h1>
        <p className="text-gray-500 text-sm">{info.productName}</p>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <ReviewForm token={token} productName={info.productName} />
      </div>
    </div>
  );
}
