import VendorDashboardHeader from "../components/VendorDashboardHeader";
import VendorTypeBanner from "../components/VendorTypeBanner";
import VendorLogisticPanel from "../components/VendorLogisticPanel";

const VendorPage = ({ children, vendorType = "retailshopvendor" }) => (
	<div className="min-h-screen bg-gray-100">
		<VendorDashboardHeader />
		<VendorTypeBanner vendorType={vendorType} />
		<VendorLogisticPanel />
		{children}
	</div>
);

export default VendorPage;
