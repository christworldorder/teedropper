export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Terms of Service</h1>
      <p className="text-gray-400 text-sm mb-10">Last updated: August 2026</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mb-3">Overview</h2>
          <p>By placing an order on TeeDropper you agree to these terms. TeeDropper is an online store selling print-on-demand apparel.</p>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mb-3">Orders</h2>
          <p>All orders are final once payment is confirmed. Items are printed specifically for you and cannot be cancelled after the order is submitted to our fulfillment partner. See our <a href="/returns" className="underline hover:text-yellow-500">Return Policy</a> for defective or damaged items.</p>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mb-3">Pricing</h2>
          <p>All prices are in USD. We reserve the right to change prices at any time. Orders are charged at the price shown at the time of purchase.</p>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mb-3">Shipping</h2>
          <p>Orders typically ship within 3-7 business days after production. Shipping times vary by location. We are not responsible for delays caused by carriers or customs.</p>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mb-3">Intellectual Property</h2>
          <p>All designs on TeeDropper are owned by TeeDropper or used with permission. You may not reproduce, copy, or sell any designs without written permission.</p>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mb-3">Limitation of Liability</h2>
          <p>TeeDropper is not liable for any indirect, incidental, or consequential damages arising from the use of our site or products. Our maximum liability is limited to the amount paid for your order.</p>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mb-3">Contact</h2>
          <p>Questions? Email <a href="mailto:support@teedropper.com" className="underline hover:text-yellow-500">support@teedropper.com</a>.</p>
        </section>
      </div>
    </div>
  );
}
