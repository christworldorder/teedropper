import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — TeeDropper",
  description: "TeeDropper makes premium tees, rash guards, and hoodies for fighters, believers, and anyone who trains hard and stands for something.",
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black uppercase tracking-tight mb-6">About TeeDropper</h1>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>
          TeeDropper was built for people who train hard and stand for something. Our gear is made for the BJJ mat,
          the MMA cage, the weight room, and everyday life. Wherever you carry yourself with purpose.
        </p>

        <p>
          Every design is created in-house and printed on demand. That means no warehouse full of unsold inventory,
          no waste, and no compromises on quality. When you order, it gets made for you.
        </p>

        <p>
          We carry men&apos;s and women&apos;s tees, rash guards, hoodies, kids gear, and flags. Combat sports,
          faith, fitness. If it matters to the people we make it for, we make it.
        </p>

        <p>
          Ships in 3-7 business days. Every order is backed by our satisfaction guarantee. If something arrives
          defective or wrong, we make it right.
        </p>
      </div>

      <div className="mt-12 p-6 bg-[#1e2a14] text-white rounded-xl">
        <h2 className="font-black uppercase tracking-wide text-lg mb-2">Questions?</h2>
        <p className="text-white/70 text-sm mb-4">We respond within 1-2 business days.</p>
        <p className="text-white font-bold mb-4">teedropper@proton.me</p>
        <a
          href="/support"
          className="inline-block bg-yellow-400 text-black font-black uppercase text-sm tracking-wide px-5 py-2.5 rounded hover:bg-yellow-300 transition-colors"
        >
          Submit a Support Request
        </a>
      </div>
    </div>
  );
}
