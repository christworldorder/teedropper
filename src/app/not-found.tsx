import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-black text-yellow-400 mb-2">404</p>
      <h1 className="text-2xl font-black uppercase tracking-tight mb-3">Page Not Found</h1>
      <p className="text-gray-500 text-sm mb-8 max-w-xs">
        That page doesn&apos;t exist. The product may have sold out or the link may be wrong.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="bg-black text-white font-black px-6 py-3 rounded-full hover:bg-yellow-400 hover:text-black transition-colors uppercase tracking-wide text-sm"
        >
          Shop All
        </Link>
        <Link
          href="/support"
          className="bg-white text-gray-900 border-2 border-gray-300 font-black px-6 py-3 rounded-full hover:border-black transition-colors uppercase tracking-wide text-sm"
        >
          Get Help
        </Link>
      </div>
    </div>
  );
}
