import VendorDashboardHeader from "../components/VendorDashboardHeader";
import VendorTypeBanner from "../components/VendorTypeBanner";

const VendorPage = ({ children, vendorType = "retailshopvendor" }) => (
	<div className="min-h-screen bg-gray-100">
		<VendorDashboardHeader />
		<VendorTypeBanner vendorType={vendorType} />
		{children}
	</div>
);

export default VendorPage;
