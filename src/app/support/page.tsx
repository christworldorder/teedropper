"use client";
import { useState } from "react";

const ISSUES = [
  "Where is my order?",
  "Item not delivered",
  "Item arrived defective or damaged",
  "Wrong item received",
  "Item was misprinted",
  "Size exchange request",
  "Other question",
];

export default function SupportPage() {
  const [form, setForm] = useState({
    email: "",
    orderEmail: "",
    issue: "",
    description: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const data = new FormData();
    data.append("email", form.email);
    data.append("orderEmail", form.orderEmail);
    data.append("issue", form.issue);
    data.append("description", form.description);
    if (photo) data.append("photo", photo);

    const res = await fetch("/api/support", { method: "POST", body: data });
    setStatus(res.ok ? "sent" : "error");
  }

  if (status === "sent") {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tight mb-4">Got it.</h1>
        <p className="text-gray-600">
          We received your message and will follow up at <strong>{form.email}</strong> within 1–2 business days.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Get Help</h1>
      <p className="text-gray-500 text-sm mb-2">
        Questions about your order, delivery, or anything else — fill this out and we&apos;ll get back to you.
      </p>
      <p className="text-gray-400 text-xs mb-8">
        Checking on a shipment? You can also use{" "}
        <a href="/order-status" className="underline text-gray-600 hover:text-black">order status</a>{" "}
        for a quick look.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold uppercase tracking-wide mb-1">Your email *</label>
          <input
            type="email"
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-bold uppercase tracking-wide mb-1">Email used at checkout *</label>
          <input
            type="email"
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={form.orderEmail}
            onChange={e => setForm(f => ({ ...f, orderEmail: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-bold uppercase tracking-wide mb-2">What can we help with? *</label>
          <div className="flex flex-wrap gap-2">
            {ISSUES.map(i => (
              <button
                key={i}
                type="button"
                onClick={() => setForm(f => ({ ...f, issue: i }))}
                className={`px-4 py-2 rounded-full border-2 text-sm font-bold transition-colors ${
                  form.issue === i
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-900 border-gray-300 hover:border-black"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
          {/* Hidden input so form validation still works */}
          <input type="text" required value={form.issue} readOnly className="sr-only" tabIndex={-1} />
        </div>

        <div>
          <label className="block text-sm font-bold uppercase tracking-wide mb-1">Tell us more *</label>
          <textarea
            required
            rows={4}
            placeholder="As much detail as you can — helps us resolve this faster"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-bold uppercase tracking-wide mb-1">
            Photo <span className="text-gray-400 font-normal">(optional — helpful for defects, damage, or wrong items)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full text-sm text-gray-600"
            onChange={e => setPhoto(e.target.files?.[0] || null)}
          />
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase tracking-wide py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          {status === "sending" ? "Sending..." : "Send Message"}
        </button>

        {status === "error" && (
          <p className="text-red-500 text-sm text-center">
            Something went wrong. Email us directly at{" "}
            <a href="mailto:teedropper@proton.me" className="underline">teedropper@proton.me</a>
          </p>
        )}
      </form>
    </div>
  );
}
