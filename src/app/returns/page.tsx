export const dynamic = "force-dynamic";

export default function Returns() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Our Guarantee</h1>
      <p className="text-gray-500 text-sm mb-10">Last updated: August 2026</p>

      <div className="space-y-8 text-gray-300 leading-relaxed">
        <section>
          <p className="text-lg">
            Every item is printed for you when you order. Nothing sits in a warehouse. That&apos;s how we keep quality up and waste at zero, and it&apos;s why we handle problems a little differently.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-yellow-400 mb-3">Defective, Damaged, or Wrong Item</h2>
          <p>Free replacement, no return needed. Email <a href="mailto:teedropper@proton.me" className="underline hover:text-yellow-500">teedropper@proton.me</a> within 14 days of delivery with your order number and a photo. We will send a replacement at no cost to you.</p>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-yellow-400 mb-3">Wrong Size</h2>
          <p>We will reprint in your size at our cost, and you keep the original. No return shipping needed. Email us within 14 days of delivery with your order number and the size you need and we will send you a payment link. Check the measurements on each product page before ordering and you probably won&apos;t need this.</p>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-yellow-400 mb-3">Change of Mind</h2>
          <p>We can&apos;t take these back. Your item was made specifically for you and can&apos;t go back on a shelf. If you are unsure about a product, email us before you order and we will help you decide.</p>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-yellow-400 mb-3">Questions</h2>
          <p>Email <a href="mailto:teedropper@proton.me" className="underline hover:text-yellow-500">teedropper@proton.me</a> and we will get back to you within 1-2 business days.</p>
        </section>
      </div>
    </div>
  );
}
