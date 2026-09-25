import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer";
import Product from "./Pages/Product";
import Cart from "./Pages/Cart";
import LoginPage from "./Pages/Authentication/Login";
import Orders from "./Pages/Orders";
import AdminVendors from "./Pages/AdminVendors";
import VendorProductUpload from "./Pages/VendorProductUpload";
import Account from "./Pages/Account";
import { useAppDispatch } from "./Store/hooks";
import { getCurrentUser } from "./Store/thunk";
import ProtectedRoleRoute from "./components/ProtectedRoleRoute";
import CustomerPage from "./Pages/CustomerPage";
import VendorPage from "./Pages/VendorPage";
import VendorOrders from "./Pages/VendorOrders";
import VendorProducts from "./Pages/VendorProducts";
import VendorHelp from "./Pages/VendorHelp";
import VendorTypePage from "./Pages/VendorTypePage";
import VendorVerificationStatus from "./Pages/VendorVerificationStatus";
import BlackMarketPage from "./Pages/BlackMarketPage";
import AdvertPage from "./Pages/AdvertPage";
import LogisticPage from "./Pages/LogisticPage";
import LogisticDropOffPage from "./Pages/LogisticDropOffPage";
import SavedItems from "./Pages/SavedItems";
import CategoryShowcasePage from "./Pages/CategoryShowcasePage";
import CollectionOfficerPage from "./Pages/CollectionOfficerPage";
import VendorPreRegistrationPage from "./Pages/VendorPreRegistrationPage";
import UberDriversPage from "./Pages/UberDriversPage";
import UberDriverDashboardPage from "./Pages/UberDriverDashboardPage";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (localStorage.getItem("unicorn_token")) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<VendorPreRegistrationPage />} />
        <Route path="/customer" element={<CustomerPage />} />
        <Route path="/uber" element={<UberDriversPage />} />
        <Route path="/uber-driver" element={<ProtectedRoleRoute role="uberdriver"><UberDriverDashboardPage /></ProtectedRoleRoute>} />
        <Route path="/vendor/uberdriver" element={<ProtectedRoleRoute role="uberdriver"><UberDriverDashboardPage /></ProtectedRoleRoute>} />
        <Route path="/blackmarket" element={<ProtectedRoleRoute role="blackmarket"><BlackMarketPage /></ProtectedRoleRoute>} />
        <Route path="/blackmarket/products/new" element={<ProtectedRoleRoute role="blackmarket"><VendorProductUpload vendorType="blackmarket" /></ProtectedRoleRoute>} />
        <Route path="/category/:category" element={<CategoryShowcasePage />} />
        <Route path="/category/:category/subcategory/:subcategory" element={<CategoryShowcasePage />} />
        <Route path="/saved-items" element={<ProtectedRoleRoute role="customer"><SavedItems /></ProtectedRoleRoute>} />
        <Route path="/vendor" element={<ProtectedRoleRoute role="vendor"><VendorPage><VendorProductUpload /></VendorPage></ProtectedRoleRoute>} />
        <Route path="/vendor/retailshopvendor" element={<ProtectedRoleRoute role="vendor" vendorType="retailshopvendor"><VendorPage><VendorProductUpload /></VendorPage></ProtectedRoleRoute>} />
        <Route path="/vendor/cardealer" element={<ProtectedRoleRoute role="vendor" vendorType="cardealer"><VendorTypePage vendorType="cardealer" /></ProtectedRoleRoute>} />
        <Route path="/vendor/realestate" element={<ProtectedRoleRoute role="vendor" vendorType="realestate"><VendorTypePage vendorType="realestate" /></ProtectedRoleRoute>} />
        <Route path="/vendor/pharmacy" element={<ProtectedRoleRoute role="vendor" vendorType="pharmacy"><VendorTypePage vendorType="pharmacy" /></ProtectedRoleRoute>} />
        <Route path="/vendor/agrovet" element={<ProtectedRoleRoute role="vendor" vendorType="agrovet"><VendorTypePage vendorType="agrovet" /></ProtectedRoleRoute>} />
        <Route path="/vendor/orders" element={<ProtectedRoleRoute role="vendor"><VendorPage><VendorOrders /></VendorPage></ProtectedRoleRoute>} />
        <Route path="/vendor/products" element={<ProtectedRoleRoute role="vendor"><VendorPage><VendorProducts /></VendorPage></ProtectedRoleRoute>} />
        <Route path="/vendor/products/new" element={<ProtectedRoleRoute role="vendor"><VendorPage><VendorProductUpload /></VendorPage></ProtectedRoleRoute>} />
        <Route path="/vendor/status" element={<VendorVerificationStatus />} />
        <Route path="/vendor/help" element={<ProtectedRoleRoute role="vendor"><VendorPage><VendorHelp /></VendorPage></ProtectedRoleRoute>} />
        <Route path="/advert" element={<ProtectedRoleRoute role="advert"><AdvertPage /></ProtectedRoleRoute>} />
        <Route path="/logistic" element={<ProtectedRoleRoute role="logistic"><LogisticPage /></ProtectedRoleRoute>} />
        <Route path="/logistic/drop-offs" element={<ProtectedRoleRoute role="logistic"><LogisticDropOffPage /></ProtectedRoleRoute>} />
        <Route path="/collection-officer" element={<ProtectedRoleRoute role="admin"><AdminVendors /></ProtectedRoleRoute>} />
        <Route path="/:productName" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/account" element={<Account />} />
        <Route path="/admin/vendors" element={<ProtectedRoleRoute role="collectionOfficer"><CollectionOfficerPage /></ProtectedRoleRoute>} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;