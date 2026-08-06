"use client";
import { useState, useRef } from "react";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "teedropper2024";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stripeLink, setStripeLink] = useState("");
  const [tag, setTag] = useState("Trending");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleLogin() {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
    } else {
      setPwError(true);
    }
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price || !stripeLink) {
      setError("Name, price, and Stripe link are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let imageUrl = "";
      if (imageFile) {
        const storageRef = ref(storage, `teedropper/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, "teedropper_products"), {
        name,
        description,
        price: parseFloat(price),
        stripeLink,
        tag,
        image: imageUrl,
        createdAt: Date.now(),
      });
      setSuccess(true);
      setName("");
      setDescription("");
      setPrice("");
      setStripeLink("");
      setTag("Trending");
      setImageFile(null);
      setImagePreview(null);
      if (fileRef.current) fileRef.current.value = "";
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError("Something went wrong. Try again.");
      console.error(err);
    }
    setLoading(false);
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl">
          <h1 className="text-2xl font-black uppercase mb-6 text-center">Admin Login</h1>
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setPwError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg mb-3 focus:outline-none focus:border-black"
          />
          {pwError && <p className="text-red-500 text-sm mb-3">Wrong password.</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-black text-white font-black py-3 rounded-xl hover:bg-yellow-400 hover:text-black transition-colors uppercase"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Add New Drop</h1>
        <p className="text-gray-500 mb-8">Fill in the details and hit publish. It goes live instantly.</p>

        {success && (
          <div className="bg-green-100 border border-green-300 text-green-800 font-bold px-4 py-3 rounded-xl mb-6">
            Drop published! It&apos;s live on the site.
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 font-bold px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Shirt Image</label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-black transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" />
              ) : (
                <div className="text-gray-400">
                  <div className="text-4xl mb-2">👕</div>
                  <div className="text-sm">Click to upload image</div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Shirt Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. That Moment Tee"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's the story behind this drop?"
              rows={3}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black resize-none"
            />
          </div>

          {/* Price + Tag */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Price *</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="29.99"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Tag</label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black bg-white"
              >
                <option>Trending</option>
                <option>Hot</option>
                <option>New Drop</option>
                <option>Limited</option>
                <option>Viral</option>
              </select>
            </div>
          </div>

          {/* Stripe Link */}
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Stripe Payment Link *</label>
            <input
              type="url"
              value={stripeLink}
              onChange={(e) => setStripeLink(e.target.value)}
              placeholder="https://buy.stripe.com/..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-black text-lg py-4 rounded-xl hover:bg-yellow-400 hover:text-black transition-colors uppercase disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Drop"}
          </button>
        </form>
      </div>
    </div>
  );
}
