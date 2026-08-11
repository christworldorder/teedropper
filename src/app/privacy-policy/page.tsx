export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-gray-400 text-sm mb-10">Last updated: August 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mb-3">What We Collect</h2>
          <p>When you place an order, we collect your name, email address, and shipping address. Payment information is processed directly by Stripe and is never stored on our servers.</p>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mb-3">How We Use It</h2>
          <p>Your information is used solely to fulfill your order. We send your name, email, and shipping address to Printful (our print and fulfillment partner) to produce and ship your item. We do not sell, rent, or share your personal information with any third party for marketing purposes.</p>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mb-3">Third-Party Services</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Stripe</strong> — processes payments securely. See stripe.com/privacy.</li>
            <li><strong>Printful</strong> — fulfills and ships orders. See printful.com/policies/privacy.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mb-3">Cookies</h2>
          <p>We do not use tracking cookies or analytics. Stripe may set cookies during checkout for fraud prevention purposes.</p>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mb-3">Contact</h2>
          <p>Questions? Email us at <a href="mailto:support@teedropper.com" className="underline hover:text-yellow-500">support@teedropper.com</a>.</p>
        </section>
      </div>
    </div>
  );
}
