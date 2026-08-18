export default function TrustStrip() {
  return (
    <div className="border-t border-b border-gray-200 bg-white py-6 mt-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
          <div className="flex flex-col items-center gap-1.5">
            <svg width="32" height="22" viewBox="0 0 28 20" aria-hidden="true">
              <rect width="28" height="20" fill="#B22234"/>
              <rect y="2.86" width="28" height="1.54" fill="#fff"/>
              <rect y="5.71" width="28" height="1.54" fill="#B22234"/>
              <rect y="8.57" width="28" height="1.54" fill="#fff"/>
              <rect y="11.43" width="28" height="1.54" fill="#B22234"/>
              <rect y="14.29" width="28" height="1.54" fill="#fff"/>
              <rect y="17.14" width="28" height="2.86" fill="#B22234"/>
              <rect width="11.2" height="10.77" fill="#3C3B6E"/>
            </svg>
            <p className="text-xs font-black uppercase tracking-wide text-gray-900">Printed in the US</p>
            <p className="text-xs text-gray-500">Not overseas, not a warehouse — Printful US facilities</p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-2xl">🔄</span>
            <p className="text-xs font-black uppercase tracking-wide text-gray-900">Defects Replaced Free</p>
            <p className="text-xs text-gray-500">Print error or damage? We send a replacement, no questions</p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-2xl">📏</span>
            <p className="text-xs font-black uppercase tracking-wide text-gray-900">Real Measurements</p>
            <p className="text-xs text-gray-500">Every product page has an exact size guide with actual inches</p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-2xl">🔒</span>
            <p className="text-xs font-black uppercase tracking-wide text-gray-900">Secure Checkout</p>
            <p className="text-xs text-gray-500">Stripe-powered — your card details never touch our servers</p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-2xl">📦</span>
            <p className="text-xs font-black uppercase tracking-wide text-gray-900">Ships in 5–10 Days</p>
            <p className="text-xs text-gray-500">Fulfilled by Printful — tracking email sent when it ships</p>
          </div>
        </div>
      </div>
    </div>
  );
}
