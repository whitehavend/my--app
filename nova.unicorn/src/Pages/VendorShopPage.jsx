import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiHeart, FiShoppingBag, FiShoppingCart } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { addToCart } from "../Store/cart/CartSlice";
import { getAllProducts } from "../Store/thunk";
import { formatCurrency } from "../utils/currency";

const readSavedList = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const getSavedVendorId = (vendor) => String(typeof vendor === "string" ? vendor : vendor.vendorId);

const VendorShopPage = () => {
  const { vendorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { products, status, error } = useAppSelector((state) => state.products);
  const [savedProductIds, setSavedProductIds] = useState([]);
  const [savedVendors, setSavedVendors] = useState([]);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  useEffect(() => {
    setSavedProductIds(user?.uid ? readSavedList(`nova_saved_${user.uid}`) : []);
    setSavedVendors(user?.uid ? readSavedList(`nova_saved_vendors_${user.uid}`) : []);
  }, [user]);

  const vendorProducts = products.filter((product) => String(product.vendorId) === String(vendorId));
  const savedVendor = location.state?.vendor;
  const vendorName = vendorProducts[0]?.vendorName || savedVendor?.vendorName || savedVendor?.name || "Vendor shop";
  const vendorType = vendorProducts[0]?.vendorType || savedVendor?.vendorType || "";
  const isBlackMarket = vendorType === "blackmarket";
  const isVendorSaved = savedVendors.some((vendor) => getSavedVendorId(vendor) === String(vendorId));

  const requireCustomer = () => {
    if (!user || user.role !== "customer") {
      navigate("/login");
      return false;
    }
    return true;
  };

  const handleSaveProduct = (productId) => {
    if (!requireCustomer()) return;

    const key = `nova_saved_${user.uid}`;
    const nextSavedIds = savedProductIds.includes(productId)
      ? savedProductIds.filter((id) => id !== productId)
      : [...savedProductIds, productId];
    setSavedProductIds(nextSavedIds);
    localStorage.setItem(key, JSON.stringify(nextSavedIds));
    setActionMessage(nextSavedIds.includes(productId) ? "Item saved" : "Item removed from saved items");
  };

  const handleAddToCart = (product, priceType = "retail") => {
    if (!requireCustomer()) return;

    const selectedPrice = priceType === "wholesale" ? product.wholesalePrice : product.price;
    dispatch(addToCart({ product: { ...product, id: product._id || product.id, price: selectedPrice, priceType }, quantity: 1 }));
    setActionMessage(`${product.title} added to cart`);
  };

  const handleSaveVendor = () => {
    if (!requireCustomer()) return;

    const key = `nova_saved_vendors_${user.uid}`;
    const nextSavedVendors = isVendorSaved
      ? savedVendors.filter((vendor) => getSavedVendorId(vendor) !== String(vendorId))
      : [...savedVendors, { vendorId: String(vendorId), vendorName, vendorType }];
    setSavedVendors(nextSavedVendors);
    localStorage.setItem(key, JSON.stringify(nextSavedVendors));
    setActionMessage(isVendorSaved ? "Vendor removed from saved vendors" : "Vendor saved");
  };

  return (
    <main className="min-h-screen bg-[#02070d] px-4 py-6 text-[#f3f5f7] sm:px-6 lg:px-8">
      {actionMessage && <div role="status" className="fixed right-4 top-4 z-50 rounded-md bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-lg">{actionMessage}</div>}
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-white/10 pb-5">
          <Link to="/customer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#c4c8cc] hover:text-white"><FiArrowLeft />Back to marketplace</Link>
          <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c4c8cc]">{isBlackMarket ? "Black market" : "Vendor shop"}</p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">{vendorName}</h1>
              <p className="mt-2 text-sm text-[#c4c8cc]">{vendorProducts.length} items available</p>
            </div>
            <button type="button" onClick={handleSaveVendor} aria-pressed={isVendorSaved} className="inline-flex items-center justify-center gap-2 border border-[#c4c8cc] px-4 py-3 text-sm font-bold text-[#f3f5f7] hover:bg-white/10">
              <FiHeart />{isVendorSaved ? "Saved vendor" : "Save vendor"}
            </button>
          </div>
        </header>

        {status === "loading" && <p className="py-8 text-[#c4c8cc]">Loading shop items...</p>}
        {error && error !== "nil" && <p role="alert" className="py-8 text-red-400">{error}</p>}
        {!vendorProducts.length && status !== "loading" && <p className="mt-6 bg-[#111315] p-6 text-[#c4c8cc]">This shop has no items available right now.</p>}

        <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label={`${vendorName} items`}>
          {vendorProducts.map((product) => {
            const productId = product._id || product.id;
            const flashSaleEndsAt = product.retailPricingType === "flash_sale" ? new Date(product.flashSaleEndsAt).getTime() : 0;
            const flashSaleActive = product.flashSalePrice !== null && product.flashSalePrice !== undefined && flashSaleEndsAt > Date.now();
            const retailPrice = flashSaleActive ? product.flashSalePrice : product.price;
            const cartProduct = { ...product, price: retailPrice };

            return <article key={productId} className="overflow-hidden bg-white text-gray-900 shadow-sm">
              <img src={product.images?.[0] || "images/phones.png"} alt={product.title} className="h-56 w-full bg-[#f0eee7] object-contain p-4" />
              <div className="p-4">
                <p className="text-xs font-bold uppercase text-[#2f5d50]">{product.brand} · {product.category}</p>
                <h2 className="mt-2 text-lg font-bold capitalize">{product.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-gray-600">{product.description}</p>
                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
                  <strong className="text-lg">{formatCurrency(retailPrice, product.currency)}</strong>
                  <span className="text-xs text-gray-500">{product.availabilityStatus || "In stock"}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(product.sellingMode === "retail" || product.sellingMode === "both" || !product.sellingMode) && <button type="button" onClick={() => handleAddToCart(cartProduct)} className="inline-flex flex-1 items-center justify-center gap-2 bg-[#102f2c] px-3 py-2.5 text-sm font-bold text-white hover:bg-[#2f5d50]"><FiShoppingCart />Add to cart</button>}
                  {(product.sellingMode === "wholesale" || product.sellingMode === "both") && product.wholesalePrice !== null && product.wholesalePrice !== undefined && <button type="button" onClick={() => handleAddToCart(product, "wholesale")} className="inline-flex flex-1 items-center justify-center gap-2 bg-gray-800 px-3 py-2.5 text-sm font-bold text-white hover:bg-gray-700"><FiShoppingBag />Wholesale</button>}
                  <button type="button" onClick={() => handleSaveProduct(productId)} aria-pressed={savedProductIds.includes(productId)} className="inline-flex flex-1 items-center justify-center gap-2 border border-[#102f2c] px-3 py-2.5 text-sm font-bold text-[#102f2c] hover:bg-gray-100"><FiHeart />{savedProductIds.includes(productId) ? "Saved" : "Save item"}</button>
                </div>
              </div>
            </article>;
          })}
        </section>
      </div>
    </main>
  );
};

export default VendorShopPage;