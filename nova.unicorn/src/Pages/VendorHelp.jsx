import { FiHeadphones } from "react-icons/fi";
import { BsBook, BsChatLeftDots } from "react-icons/bs";

const VendorHelp = () => (
  <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
    <div className="mb-8">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Vendor assistance</p>
      <h2 className="mt-1 text-2xl font-bold text-gray-900">Help and product upload manual</h2>
      <p className="mt-2 text-sm text-gray-600">Use this guide whenever you need a reminder about listing products or preparing orders.</p>
    </div>
    <div className="space-y-4">
      <article className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <BsBook className="mt-1 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h3 className="font-semibold text-gray-900">How to upload a product</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-gray-600">
              <li>Open Uploaded Products and select Upload new product.</li>
              <li>Enter the product title, brand, category, description, price, and available stock.</li>
              <li>Add image URLs separated by commas and include shipping information.</li>
              <li>Check the details, then select Upload product. Your listing will appear in your product history.</li>
            </ol>
          </div>
        </div>
      </article>
      <article id="assistance" className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <FiHeadphones className="mt-1 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h3 className="font-semibold text-gray-900">Assistance</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">Need help with a listing or fulfillment order? Keep your order ID or product title ready when contacting the Nova Unicorn support team.</p>
            <button type="button" onClick={() => window.alert("Nova Unicorn assistance is available through your support team.")} className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary100">
              <BsChatLeftDots className="h-4 w-4" /> Contact assistance
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
);

export default VendorHelp;
