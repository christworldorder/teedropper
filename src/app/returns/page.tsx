export default function Returns() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Return Policy</h1>
      <p className="text-gray-400 text-sm mb-10">Last updated: August 2026</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mb-3">Print-on-Demand Items</h2>
          <p>Every item in our store is printed on demand specifically for you. Because of this, <strong>we do not accept returns or exchanges for sizing, color preference, or buyer&apos;s remorse.</strong> Please double-check your size selection before purchasing.</p>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mb-3">Defective or Damaged Items</h2>
          <p>If your item arrives defective, damaged, or with a printing error, we will replace it at no charge. Email us within <strong>14 days of delivery</strong> at <a href="mailto:support@teedropper.com" className="underline hover:text-yellow-500">support@teedropper.com</a> with your order number and a photo of the issue. We&apos;ll get it sorted fast.</p>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mb-3">Wrong Item Received</h2>
          <p>If we sent you the wrong item, contact us within 14 days and we will send the correct item immediately at no cost to you.</p>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mb-3">Shipping Issues</h2>
          <p>If your order is lost in transit, contact us and we will work with our fulfillment partner to resolve it or send a replacement.</p>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mb-3">Contact</h2>
          <p>Email <a href="mailto:support@teedropper.com" className="underline hover:text-yellow-500">support@teedropper.com</a> with your order number and we will respond within 1-2 business days.</p>
        </section>
      </div>
    </div>
  );
}
