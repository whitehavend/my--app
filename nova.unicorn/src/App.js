import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import AdvertPage from "./Pages/AdvertPage";
import LogisticPage from "./Pages/LogisticPage";

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
        <Route path="/" element={<CustomerPage />} />
        <Route path="/customer" element={<CustomerPage />} />
        <Route path="/vendor" element={<ProtectedRoleRoute role="vendor"><VendorPage /></ProtectedRoleRoute>} />
        <Route path="/advert" element={<ProtectedRoleRoute role="advert"><AdvertPage /></ProtectedRoleRoute>} />
        <Route path="/logistic" element={<ProtectedRoleRoute role="logistic"><LogisticPage /></ProtectedRoleRoute>} />
        <Route path="/:productName" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/account" element={<Account />} />
        <Route path="/admin/vendors" element={<AdminVendors />} />
        <Route path="/vendor/products/new" element={<VendorProductUpload />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;