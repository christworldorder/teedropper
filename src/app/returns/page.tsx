export default function Returns() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Return Policy</h1>
      <p className="text-gray-400 text-sm mb-10">Last updated: August 2026</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mb-3">All Sales Final</h2>
          <p>Every item is printed on demand just for you. We do not accept returns or exchanges for any reason — including sizing, color, or change of mind. Please choose your size carefully before ordering.</p>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mb-3">We Made a Mistake?</h2>
          <p>If your item arrives defective, damaged, misprinted, or is the wrong item entirely, we will make it right. Email us at <a href="mailto:support@teedropper.com" className="underline hover:text-yellow-500">support@teedropper.com</a> within 14 days of delivery with your order number and a photo. We will send a replacement at no cost to you.</p>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mb-3">Questions</h2>
          <p>Email <a href="mailto:support@teedropper.com" className="underline hover:text-yellow-500">support@teedropper.com</a> and we will get back to you within 1-2 business days.</p>
        </section>
      </div>
    </div>
  );
}
