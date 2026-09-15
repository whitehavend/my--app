import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
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
        <Route path="/" element={<LandingPage />} />
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