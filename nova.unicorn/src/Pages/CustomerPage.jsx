import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { getAllProducts } from "../Store/thunk";
import { addToCart } from "../Store/cart/CartSlice";
import { Link, useNavigate } from "react-router-dom";
import { FiHeadphones, FiSearch, FiSettings, FiShoppingCart, FiUser, FiArrowRight, FiShoppingBag } from "react-icons/fi";
import { BsBuildings, BsShop } from "react-icons/bs";
import { FaCarSide, FaCapsules } from "react-icons/fa";
import { GiPlantRoots } from "react-icons/gi";
import ComingSoonBanner from "../components/ComingSoonBanner";
import { formatCurrency } from "../utils/currency";

const CustomerPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { products, error } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);
  const [search, setSearch] = useState("");
  const [savedItems, setSavedItems] = useState([]);
  const [actionMessage, setActionMessage] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const refreshProducts = () => dispatch(getAllProducts());
    refreshProducts();
    const refreshTimer = setInterval(refreshProducts, 5000);

    return () => clearInterval(refreshTimer);
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setSavedItems(JSON.parse(localStorage.getItem(`nova_saved_${user.uid}`) || "[]"));
    }
  }, [user]);

  useEffect(() => {
    if (!actionMessage) return undefined;
    const messageTimer = setTimeout(() => setActionMessage(""), 2500);
    return () => clearTimeout(messageTimer);
  }, [actionMessage]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

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
    setActionMessage(savedItems.includes(productId) ? "Item removed from saved items" : "Item saved successfully");
  };

  const handleAddToCart = (product, priceType = "retail") => {
    if (!requireCustomerLogin()) return;
    const selectedPrice = priceType === "wholesale" ? product.wholesalePrice : product.price;
    dispatch(addToCart({ product: { ...product, id: product._id || product.id, price: selectedPrice, priceType }, quantity: 1 }));
    setActionMessage(`${product.title} added to cart at ${priceType} price`);
  };

  const visibleProducts = products.filter((product) => product.vendorId).filter((product) => {
    const query = search.toLowerCase().trim();
    const searchableFields = [product.brand, product.description, product.category, product.subcategory];
    return !query || searchableFields.some((value) => String(value || "").toLowerCase().includes(query));
  });

  const getFlashSaleState = (product) => {
    const endsAt = product.retailPricingType === "flash_sale" ? new Date(product.flashSaleEndsAt).getTime() : 0;
    const remaining = endsAt - now;
    if (!product.flashSalePrice || !Number.isFinite(remaining) || remaining <= 0) return null;
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return { price: product.flashSalePrice, time: `${hours}h ${minutes}m ${seconds}s` };
  };

  return (
    <main className="min-h-screen bg-[#f6f3ea] text-[#171717]">
      <header className="bg-[#102f2c] shadow-[0_4px_0_rgba(0,0,0,0.12)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-white sm:px-6 lg:px-8">
          <Link to="/customer" className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-200 text-2xl text-[#102f2c]"><FiShoppingBag /></span><span className="text-2xl font-black uppercase leading-[0.8] tracking-[-0.06em]">Nova<br />unicorn</span></Link>
          <div className="flex justify-end"><Link to={user ? "/account" : "/login"} className="flex items-center gap-3 text-sm font-black uppercase"><FiUser className="text-2xl" /><span>{user?.username || "My account"}</span></Link></div>
          <div className="relative w-full"><FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." aria-label="Search products" className="w-full border-2 border-black/10 bg-white px-12 py-3 text-sm outline-none focus:border-black" /></div>
        </div>
        <nav className="border-t border-black/15" aria-label="Store navigation"><div className="mx-auto grid max-w-7xl grid-cols-4 gap-1 px-4 py-2 sm:grid-cols-8 sm:px-6 lg:px-8">
          <Link to="/account" aria-label="Settings" title="Settings" className="store-nav-item"><FiSettings /><span className="sr-only">Settings</span></Link>
          <Link to="/category/shopvendor" aria-label="Shopvendor" title="Shopvendor" className="store-nav-item"><BsShop /><span className="sr-only">Shopvendor</span></Link>
          <Link to="/category/cardealer" aria-label="Car dealer" title="Car dealer" className="store-nav-item"><FaCarSide /><span className="sr-only">Car dealer</span></Link>
          <Link to="/category/realestate" aria-label="Realestate" title="Realestate" className="store-nav-item"><BsBuildings /><span className="sr-only">Realestate</span></Link>
          <Link to="/category/pharmacy" aria-label="Pharmacy" title="Pharmacy" className="store-nav-item"><FaCapsules /><span className="sr-only">Pharmacy</span></Link>
          <Link to="/category/agrovet" aria-label="Agrovet" title="Agrovet" className="store-nav-item"><GiPlantRoots /><span className="sr-only">Agrovet</span></Link>
          <button type="button" aria-label="Assistance" title="Assistance" onClick={() => window.alert("Our assistance team is available to help you with your order.")} className="store-nav-item assistance-nav-item"><FiHeadphones /><span className="sr-only">Assistance</span></button>
          <Link to="/category/blackmarket" className="store-nav-item"><FiShoppingCart /><span>Blackmarket</span></Link>
        </div></nav>
      </header>
      {actionMessage && <div role="status" className="fixed right-4 top-4 z-50 rounded-md bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">{actionMessage}</div>}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="store-hero relative overflow-hidden bg-[#102f2c] px-6 py-10 text-white sm:px-12 sm:py-16"><div className="relative z-10 max-w-3xl"><p className="font-serif text-3xl italic text-lime-200/80 sm:text-5xl">Welcome to NovaUnicorn</p><h1 className="mt-3 text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl">A market filled with unlimited opportunities</h1><p className="mt-5 max-w-2xl text-sm font-medium leading-6 text-emerald-50/75 sm:text-base">Discover trusted vendors, explore new categories, and find something made for your everyday life.</p><Link to="/category/shopvendor" className="mt-7 inline-flex items-center gap-2 bg-lime-200 px-6 py-3 text-sm font-black uppercase text-[#102f2c] hover:bg-lime-100">Start exploring <FiArrowRight /></Link></div><div className="absolute -right-10 bottom-[-5rem] h-72 w-72 rounded-full bg-lime-200/10 sm:right-12 sm:h-96 sm:w-96" /><div className="absolute right-16 top-12 h-28 w-28 rounded-full border-[18px] border-lime-200/20 sm:right-40 sm:h-44 sm:w-44" /></section>
        <div className="mt-5 grid gap-4 md:grid-cols-3"><Link to="/category/shopvendor" className="promo-tile bg-[#102f2c]">Shop vendor <span>Everyday finds</span><FiArrowRight /></Link><Link to="/category/cardealer" className="promo-tile bg-[#2f5d50]">Car dealer <span>Drive something great</span><FiArrowRight /></Link><Link to="/category/blackmarket" className="promo-tile bg-[#243746]">Blackmarket <span>Unique offers</span><FiArrowRight /></Link></div>
        <section className="mt-10"><div className="flex flex-col justify-between gap-3 border-b-2 border-[#102f2c] pb-3 sm:flex-row sm:items-end"><div><p className="text-xs font-black uppercase tracking-[0.25em] text-[#2f5d50]">Vendor marketplace</p><h2 className="mt-1 text-3xl font-black uppercase">Latest arrivals</h2></div><span className="text-sm font-semibold text-gray-600">{visibleProducts.length} products available</span></div>
          {error && error !== "nil" && <p className="mt-4 text-red-600">{error}</p>}{!visibleProducts.length && <div className="mt-6"><ComingSoonBanner label="Vendor marketplace" /></div>}{visibleProducts.length > 0 && <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{visibleProducts.map((product) => { const flashSale = getFlashSaleState(product); const displayProduct = flashSale ? { ...product, price: flashSale.price } : product; return <article key={product._id || product.id} role="button" tabIndex="0" onClick={() => navigate(`/${encodeURIComponent(product.title)}`, { state: { product } })} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") navigate(`/${encodeURIComponent(product.title)}`, { state: { product } }); }} className="store-product-card cursor-pointer"><div className="relative bg-[#f0eee7] p-3"><img src={product.images?.[0] || "images/phones.png"} alt={product.title} className="h-56 w-full object-contain mix-blend-multiply" />{(product.isFragile || product.isHighValue) && <div className="absolute left-5 top-5 flex flex-wrap gap-1">{product.isFragile && <span className="bg-black px-2 py-1 text-[10px] font-black uppercase text-white">Fragile</span>}{product.isHighValue && <span className="bg-lime-200 px-2 py-1 text-[10px] font-black uppercase text-[#102f2c]">High value</span>}</div>}</div><div className="p-4"><p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#2f5d50]">{product.brand} · {product.category}</p><h3 className="mt-2 text-lg font-black capitalize">{product.title}</h3><p className="mt-2 line-clamp-2 text-sm text-gray-600">{product.description}</p>{flashSale && <p className="mt-3 bg-red-50 p-2 text-xs font-bold text-red-700">Flash sale: {formatCurrency(flashSale.price, product.currency)} · {flashSale.time}</p>}<div className="mt-4 flex items-end justify-between border-t border-gray-200 pt-3"><strong className="text-xl">{formatCurrency(displayProduct.price, product.currency)}</strong><span className="text-xs font-semibold capitalize text-gray-500">{product.itemCondition || "generic"}</span></div><p className="mt-2 text-xs text-gray-500">From {product.vendorName || "Verified vendor"}</p><div className="mt-4 flex gap-2"><button onClick={(event) => { event.stopPropagation(); handleSave(product._id || product.id); }} className="flex-1 border border-[#102f2c] px-3 py-2 text-xs font-black uppercase hover:bg-gray-100">{savedItems.includes(product._id || product.id) ? "Saved" : "Save"}</button>{(product.sellingMode === "retail" || product.sellingMode === "both" || !product.sellingMode) && <button onClick={(event) => { event.stopPropagation(); handleAddToCart(displayProduct, "retail"); }} className="flex-1 bg-[#102f2c] px-3 py-2 text-xs font-black uppercase text-white hover:bg-[#2f5d50]">Add to cart</button>}</div></div></article>; })}</div>}
        </section>
      </div>
    </main>
  );
};

export default CustomerPage;
