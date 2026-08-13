"use client";
import * as Sentry from "@sentry/nextjs";

export default function SentryTestPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-black mb-4">Sentry Test</h1>
      <p className="text-gray-500 text-sm mb-8">Click to throw a test error and confirm Sentry is capturing it.</p>
      <button
        className="bg-red-500 text-white font-black px-6 py-3 rounded-full hover:bg-red-600 transition-colors"
        onClick={() => {
          Sentry.captureException(new Error("TeeDropper Sentry test error — if you see this in Sentry, it's working."));
          throw new Error("TeeDropper Sentry test error — if you see this in Sentry, it's working.");
        }}
      >
        Throw Test Error
      </button>
    </div>
  );
}
