/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useRef } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { SIZES } from "@/lib/products";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [tag, setTag] = useState("Trending");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Color groups: [{ color: "Black", sizes: { XS: "id", ... } }]
  const [colorGroups, setColorGroups] = useState([{ color: "", sizes: {} as Record<string, string> }]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleLogin() {
    if (pw.trim()) { setAuthed(true); } else { setPwError(true); }
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function updateColorName(i: number, value: string) {
    setColorGroups((prev) => prev.map((g, idx) => idx === i ? { ...g, color: value } : g));
  }

  function updateVariant(colorIdx: number, size: string, value: string) {
    setColorGroups((prev) => prev.map((g, idx) => {
      if (idx !== colorIdx) return g;
      const sizes = { ...g.sizes };
      if (value.trim()) sizes[size] = value.trim();
      else delete sizes[size];
      return { ...g, sizes };
    }));
  }

  function addColor() {
    setColorGroups((prev) => [...prev, { color: "", sizes: {} }]);
  }

  function removeColor(i: number) {
    setColorGroups((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price) { setError("Name and price are required."); return; }

    // Build flat variants map
    const hasMultipleColors = colorGroups.length > 1 || (colorGroups[0]?.color.trim() !== "");
    const variants: Record<string, string> = {};
    for (const group of colorGroups) {
      for (const [size, id] of Object.entries(group.sizes)) {
        const key = hasMultipleColors ? `${group.color.trim()}-${size}` : size;
        if (id) variants[key] = id;
      }
    }

    if (Object.keys(variants).length === 0) { setError("Add at least one variant ID."); return; }

    setLoading(true);
    setError("");
    try {
      let imageUrl = "";
      if (imageFile) {
        const storageRef = ref(storage, `teedropper/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const res = await fetch("/api/admin/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: pw,
          product: { name, description, price, tag, image: imageUrl, variants },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) { setAuthed(false); setPwError(true); setError("Wrong password."); }
        else { setError(data.error || "Something went wrong."); }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setName(""); setDescription(""); setPrice(""); setTag("Trending");
      setColorGroups([{ color: "", sizes: {} }]);
      setImageFile(null); setImagePreview(null);
      if (fileRef.current) fileRef.current.value = "";
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl">
          <h1 className="text-2xl font-black uppercase mb-6 text-center">Admin Login</h1>
          <input type="password" placeholder="Password" value={pw}
            onChange={(e) => { setPw(e.target.value); setPwError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg mb-3 focus:outline-none focus:border-black"
          />
          {pwError && <p className="text-red-500 text-sm mb-3">Wrong password.</p>}
          <button onClick={handleLogin} className="w-full bg-black text-white font-black py-3 rounded-xl hover:bg-yellow-400 hover:text-black transition-colors uppercase">Enter</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Add New Drop</h1>
        <p className="text-gray-500 mb-8">Fill in the details and hit publish.</p>

        {success && <div className="bg-green-100 border border-green-300 text-green-800 font-bold px-4 py-3 rounded-xl mb-6">Drop published!</div>}
        {error && <div className="bg-red-100 border border-red-300 text-red-800 font-bold px-4 py-3 rounded-xl mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
          {/* Image */}
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Shirt Image</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-black transition-colors" onClick={() => fileRef.current?.click()}>
              {imagePreview
                ? <img src={imagePreview} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                : <div className="text-gray-400"><div className="text-4xl mb-2">👕</div><div className="text-sm">Click to upload image</div></div>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Shirt Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Barbie Jitsu"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              placeholder="What's the story?" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black resize-none" />
          </div>

          {/* Price + Tag */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Price *</label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="29.99"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Tag</label>
              <select value={tag} onChange={(e) => setTag(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black bg-white">
                <option>Trending</option><option>Hot</option><option>New Drop</option><option>Limited</option><option>Viral</option>
              </select>
            </div>
          </div>

          {/* Color Groups */}
          <div>
            <label className="block text-sm font-bold mb-1 uppercase tracking-wide">Printful Variant IDs *</label>
            <p className="text-xs text-gray-400 mb-3">One color per group. Leave color name blank if the shirt has only one color.</p>
            <div className="space-y-4">
              {colorGroups.map((group, ci) => (
                <div key={ci} className="border-2 border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Color name (e.g. Black)"
                      value={group.color}
                      onChange={(e) => updateColorName(ci, e.target.value)}
                      className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black font-bold"
                    />
                    {colorGroups.length > 1 && (
                      <button type="button" onClick={() => removeColor(ci)} className="text-red-400 hover:text-red-600 text-sm font-bold px-2">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {SIZES.map((size) => (
                      <div key={size} className="flex items-center gap-2">
                        <span className="w-10 text-sm font-black text-gray-600 shrink-0">{size}</span>
                        <input type="text" value={group.sizes[size] || ""} onChange={(e) => updateVariant(ci, size, e.target.value)}
                          placeholder="ID" className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black font-mono" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addColor} className="mt-3 text-sm font-bold text-gray-500 hover:text-black underline underline-offset-2">
              + Add another color
            </button>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-black text-white font-black text-lg py-4 rounded-xl hover:bg-yellow-400 hover:text-black transition-colors uppercase disabled:opacity-50">
            {loading ? "Publishing..." : "Publish Drop"}
          </button>
        </form>
      </div>
    </div>
  );
}
