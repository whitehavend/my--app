import VendorDashboardHeader from "../components/VendorDashboardHeader";
import VendorTypeBanner from "../components/VendorTypeBanner";
import VendorProductUpload from "./VendorProductUpload";

const VendorTypePage = ({ vendorType }) => (
  <div className="min-h-screen bg-gray-100">
    <VendorDashboardHeader />
    <VendorTypeBanner vendorType={vendorType} />
    <VendorProductUpload vendorType={vendorType} />
  </div>
);

export default VendorTypePage;
