import VendorDashboardHeader from "../components/VendorDashboardHeader";

const VendorPage = ({ children }) => (
	<div className="min-h-screen bg-gray-100">
		<VendorDashboardHeader />
		{children}
	</div>
);

export default VendorPage;
