"use client";
import { useState } from "react";

export default function SupportPage() {
  const [form, setForm] = useState({ email: "", orderEmail: "", issue: "", description: "" });
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const issues = [
    "Item arrived defective",
    "Wrong item received",
    "Item was misprinted",
    "Item arrived damaged",
    "Other",
  ];

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

    if (res.ok) {
      setStatus("sent");
    } else {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tight mb-4">Got it.</h1>
        <p className="text-gray-600">We received your report and will follow up at <strong>{form.email}</strong> within 1-2 business days.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Report an Issue</h1>
      <p className="text-gray-500 text-sm mb-10">For defective, damaged, misprinted, or wrong items only. All sales are final.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold uppercase tracking-wide mb-1">Your email</label>
          <input
            type="email"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-bold uppercase tracking-wide mb-1">Email used at checkout</label>
          <input
            type="email"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={form.orderEmail}
            onChange={e => setForm(f => ({ ...f, orderEmail: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-bold uppercase tracking-wide mb-1">What is the issue?</label>
          <select
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={form.issue}
            onChange={e => setForm(f => ({ ...f, issue: e.target.value }))}
          >
            <option value="">Select one</option>
            {issues.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold uppercase tracking-wide mb-1">Describe the problem</label>
          <textarea
            required
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-bold uppercase tracking-wide mb-1">Photo of the item <span className="text-gray-400 font-normal">(required)</span></label>
          <input
            type="file"
            accept="image/*"
            required
            className="w-full text-sm text-gray-600"
            onChange={e => setPhoto(e.target.files?.[0] || null)}
          />
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase tracking-wide py-3 rounded transition-colors disabled:opacity-50"
        >
          {status === "sending" ? "Sending..." : "Submit Report"}
        </button>

        {status === "error" && (
          <p className="text-red-500 text-sm text-center">Something went wrong. Email us directly at teedropper@proton.me</p>
        )}
      </form>
    </div>
  );
}
