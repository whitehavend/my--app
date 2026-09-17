import VendorDashboardHeader from "../components/VendorDashboardHeader";
import VendorTypeBanner from "../components/VendorTypeBanner";

const VendorTypePage = ({ vendorType }) => (
  <div className="min-h-screen bg-gray-100">
    <VendorDashboardHeader />
    <VendorTypeBanner vendorType={vendorType} />
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="rounded-md border border-gray-200 bg-white p-6 text-gray-700 shadow-sm">
        This workspace is being prepared for your vendor type.
      </div>
    </main>
  </div>
);

export default VendorTypePage;
