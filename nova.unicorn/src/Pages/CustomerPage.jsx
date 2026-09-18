import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { getAllProducts } from "../Store/thunk";
import { addToCart } from "../Store/cart/CartSlice";
import { Link, useNavigate } from "react-router-dom";
import { FiHeadphones, FiSearch, FiSettings, FiShoppingCart, FiUser } from "react-icons/fi";
import { BsBuildings, BsShop } from "react-icons/bs";
import { FaCarSide, FaCapsules } from "react-icons/fa";
import { GiPlantRoots } from "react-icons/gi";
import ComingSoonBanner from "../components/ComingSoonBanner";

const categoryCards = [
  { key: "shopvendor", label: "Shop Vendor", icon: BsShop, path: "/category/shopvendor" },
  { key: "cardealer", label: "Car Dealer", icon: FaCarSide, path: "/category/cardealer" },
  { key: "realestate", label: "Real Estate", icon: BsBuildings, path: "/category/realestate" },
  { key: "pharmacy", label: "Pharmacy", icon: FaCapsules, path: "/category/pharmacy" },
  { key: "agrovet", label: "Agrovet", icon: GiPlantRoots, path: "/category/agrovet" },
  { key: "blackmarket", label: "Black Market", icon: FiShoppingCart, path: "/category/blackmarket" },
];

const CustomerPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { products, status, error } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);
  const [search, setSearch] = useState("");
  const [savedItems, setSavedItems] = useState([]);

  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setSavedItems(JSON.parse(localStorage.getItem(`nova_saved_${user.uid}`) || "[]"));
    }
  }, [user]);

  const requireCustomerLogin = () => {
    if (!user) {
      navigate("/login");
      return false;
    }
    return user.role === "customer";
  };

  const handleSave = (productId) => {
    if (!requireCustomerLogin()) return;
    const nextSavedItems = savedItems.includes(productId)
      ? savedItems.filter((id) => id !== productId)
      : [...savedItems, productId];
    setSavedItems(nextSavedItems);
    localStorage.setItem(`nova_saved_${user.uid}`, JSON.stringify(nextSavedItems));
  };

  const handleAddToCart = (product) => {
    if (!requireCustomerLogin()) return;
    dispatch(addToCart({ product: { ...product, id: product._id || product.id, price: product.salePrice ?? product.price }, quantity: 1 }));
  };

  const visibleProducts = products.filter((product) => product.vendorId).filter((product) => {
    const query = search.toLowerCase().trim();
    return !query || [product.title, product.brand, product.category].some((value) => value?.toLowerCase().includes(query));
  });

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto grid max-w-7xl items-center gap-4 px-4 py-4 lg:grid-cols-[180px_minmax(260px,1fr)_360px]">
          <Link to="/" className="flex items-center gap-2 text-xl font-black uppercase tracking-[0.16em] text-gray-900">Nova Unicorn</Link>
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, brands, or categories" aria-label="Search products, brands, or categories" className="w-full rounded-md border border-gray-300 bg-gray-50 p-3 pl-11 outline-none focus:border-primary focus:bg-white" />
          </div>
          <nav className="flex items-center justify-between gap-2 text-sm text-gray-700" aria-label="Customer navigation">
            <Link to={user ? "/account" : "/login"} className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-gray-100"><FiUser /><span>{user?.username || "My account"}</span></Link>
            <button type="button" onClick={() => window.alert("Our assistance team is available to help you with your order.")} className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-gray-100"><FiHeadphones /><span>Assistance</span></button>
            <Link to="/cart" className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-gray-100"><FiShoppingCart /><span>Cart</span></Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[190px_minmax(0,1fr)]">
        <aside className="h-fit rounded-md bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-2 border-b border-gray-200 pb-4 text-sm font-semibold uppercase tracking-wider"><FiSettings /> Settings</h2>
          <div className="space-y-2 pt-4 text-sm text-gray-600">
            <Link to={user ? "/account" : "/login"} className="block rounded-md px-3 py-2 hover:bg-gray-100 hover:text-primary">Account settings</Link>
            <Link to="/orders" className="block rounded-md px-3 py-2 hover:bg-gray-100 hover:text-primary">Orders</Link>
            <Link to={user ? "/saved-items" : "/login"} className="block rounded-md px-3 py-2 hover:bg-gray-100 hover:text-primary">Saved items</Link>
          </div>
        </aside>

        <section>
          <div className="mb-6"><p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Customer marketplace</p><h1 className="mt-2 text-3xl font-bold">Products from our vendors</h1><p className="mt-2 text-gray-600">Browse, search, and shop vendor listings.</p></div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {categoryCards.map(({ key, label, icon: Icon, path }) => (
              <Link key={key} to={path} className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-slate-900">{label}</h2>
                  <span className="text-sm font-medium text-primary">Explore</span>
                </div>
              </Link>
            ))}
          </div>

          {status === "loading" && <p>Loading products...</p>}
          {error && error !== "nil" && <p className="text-red-600">{error}</p>}
          {status !== "loading" && !visibleProducts.length && <ComingSoonBanner label="Vendor marketplace" />}
          {visibleProducts.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => (
                <article key={product._id || product.id} className="overflow-hidden rounded-md bg-white shadow-sm">
                  <img src={product.images?.[0]} alt={product.title} className="h-48 w-full object-cover" />
                  <div className="p-4"><p className="text-xs uppercase text-gray-500">{product.brand} · {product.category}</p><h2 className="mt-2 text-lg font-semibold capitalize">{product.title}</h2><p className="mt-2 line-clamp-2 text-sm text-gray-600">{product.description}</p><p className="mt-3 text-xl font-bold">₦{Number(product.salePrice ?? product.price).toLocaleString()}</p><div className="mt-4 flex gap-2"><button onClick={() => handleSave(product._id || product.id)} className="flex-1 rounded-md border border-primary px-3 py-3 text-sm font-medium text-primary hover:bg-gray-50">{savedItems.includes(product._id || product.id) ? "Saved" : "Save item"}</button><button onClick={() => handleAddToCart(product)} className="flex-1 rounded-md bg-primary px-3 py-3 text-sm font-medium text-white hover:bg-primary100">Add to cart</button></div></div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default CustomerPage;
