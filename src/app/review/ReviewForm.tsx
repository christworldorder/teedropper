"use client";
import { useState, useRef } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

const FIT_OPTIONS = [
  { value: "runs_small", label: "Runs small" },
  { value: "true_to_size", label: "True to size" },
  { value: "runs_large", label: "Runs large" },
];

export default function ReviewForm({
  token,
  productName,
}: {
  token: string;
  productName: string;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [fit, setFit] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!rating) { setError("Please select a star rating."); return; }
    if (!title.trim()) { setError("Please add a review title."); return; }
    if (body.trim().length < 20) { setError("Review must be at least 20 characters."); return; }
    if (!authorName.trim()) { setError("Please enter your name."); return; }

    setUploading(true);

    let photoUrl = "";
    if (photoFile) {
      try {
        const storageRef = ref(storage, `review-photos/${token}_${Date.now()}_${photoFile.name}`);
        await uploadBytes(storageRef, photoFile);
        photoUrl = await getDownloadURL(storageRef);
      } catch {
        setError("Photo upload failed. Try removing the photo and submitting again.");
        setUploading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/review/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          rating,
          title: title.trim(),
          reviewBody: body.trim(),
          fit: fit || undefined,
          photoUrl: photoUrl || undefined,
          authorName: authorName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Try again.");
        setUploading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Try again.");
      setUploading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🙏</div>
        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Thanks for your review!</h2>
        <p className="text-gray-500 max-w-sm mx-auto">
          Your review is pending moderation and will appear on the product page once approved. We appreciate you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 font-bold px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Star rating */}
      <div>
        <label className="block text-sm font-black uppercase tracking-wide mb-2">
          Overall Rating *
        </label>
        <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              className="text-4xl transition-transform hover:scale-110 leading-none"
            >
              <span className={(hovered || rating) >= star ? "text-yellow-400" : "text-gray-300"}>
                ★
              </span>
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
          </p>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-black uppercase tracking-wide mb-2">
          Review Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum it up in a few words"
          maxLength={100}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black text-sm"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-black uppercase tracking-wide mb-2">
          Your Review *
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="What did you think? How does it fit, feel, hold up?"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black text-sm resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">{body.trim().length} / 20 min characters</p>
      </div>

      {/* Fit */}
      <div>
        <label className="block text-sm font-black uppercase tracking-wide mb-2">
          How did it fit?
        </label>
        <div className="flex flex-wrap gap-2">
          {FIT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFit(fit === opt.value ? "" : opt.value)}
              className={`px-4 py-2 rounded-full border-2 text-sm font-bold transition-colors ${
                fit === opt.value
                  ? "bg-black text-white border-black"
                  : "border-gray-200 text-gray-700 hover:border-black"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Photo */}
      <div>
        <label className="block text-sm font-black uppercase tracking-wide mb-2">
          Photo (optional)
        </label>
        {photoPreview ? (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="preview" className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200" />
            <button
              type="button"
              onClick={() => { setPhotoFile(null); setPhotoPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="text-sm font-bold text-red-500 hover:text-red-700"
            >
              Remove photo
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl px-6 py-4 text-sm text-gray-400 hover:border-black hover:text-black transition-colors w-full text-left"
          >
            + Add a photo of your shirt
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
        {photoFile && (
          <p className="text-xs text-gray-400 mt-1">
            *Disclosure: This review includes a customer photo.
          </p>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-black uppercase tracking-wide mb-2">
          Your Name *
        </label>
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="First name or nickname"
          maxLength={50}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-black text-white font-black text-lg py-4 rounded-xl hover:bg-yellow-400 hover:text-black transition-colors uppercase disabled:opacity-50"
      >
        {uploading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
