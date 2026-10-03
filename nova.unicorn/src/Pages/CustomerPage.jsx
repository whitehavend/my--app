import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { getAllProducts } from "../Store/thunk";
import { addToCart } from "../Store/cart/CartSlice";
import { Link, useNavigate } from "react-router-dom";
import { FiHeadphones, FiSearch, FiSettings, FiShoppingCart, FiUser, FiArrowRight, FiShoppingBag, FiHeart } from "react-icons/fi";
import { BsBuildings, BsShop } from "react-icons/bs";
import { FaCarSide, FaCapsules, FaUber } from "react-icons/fa";
import { GiPlantRoots } from "react-icons/gi";
import ComingSoonBanner from "../components/ComingSoonBanner";
import { detectVisitorCurrency, formatCurrency } from "../utils/currency";
import { getUserDashboardPath } from "../utils/userRoutes";

const getDailyShuffleKey = (product, daySeed) => {
  const productId = product._id || product.id || product.title || "";
  const value = `${productId}:${daySeed}`;
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  }

  return hash >>> 0;
};

const CustomerPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { products, error } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);
  const { carts } = useAppSelector((state) => state.carts);
  const [search, setSearch] = useState("");
  const [savedItems, setSavedItems] = useState([]);
  const [actionMessage, setActionMessage] = useState("");
  const [visitorCurrency, setVisitorCurrency] = useState("NGN");
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

  useEffect(() => {
    let ignore = false;

    const resolveVisitorCurrency = async () => {
      try {
        const detectedCurrency = await detectVisitorCurrency(user);
        if (!ignore) setVisitorCurrency(detectedCurrency);
      } catch (error) {
        if (!ignore) setVisitorCurrency("NGN");
      }
    };

    resolveVisitorCurrency();
    return () => { ignore = true; };
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
    setActionMessage(savedItems.includes(productId) ? "Item removed from saved items" : "Item saved successfully");
  };

  const handleAddToCart = (product, priceType = "retail") => {
    if (!requireCustomerLogin()) return;
    const selectedPrice = priceType === "wholesale" ? product.wholesalePrice : product.price;
    dispatch(addToCart({ product: { ...product, id: product._id || product.id, price: selectedPrice, priceType }, quantity: 1 }));
    setActionMessage(`${product.title} added to cart at ${priceType} price`);
  };

  const dailyShuffleSeed = Math.floor(now / 86400000);
  const visibleProducts = useMemo(() => {
    const query = search.toLowerCase().trim();
    return products
      .filter((product) => product.vendorId)
      .filter((product) => {
        const searchableFields = [product.brand, product.description, product.category, product.subcategory];
        return !query || searchableFields.some((value) => String(value || "").toLowerCase().includes(query));
      })
      .sort((first, second) => getDailyShuffleKey(first, dailyShuffleSeed) - getDailyShuffleKey(second, dailyShuffleSeed));
  }, [products, search, dailyShuffleSeed]);
  const displayedProducts = search.trim() ? visibleProducts : visibleProducts.slice(0, 24);

  const heroSlides = useMemo(() => {
    const featuredProductSlides = [...products]
      .filter((product) => product?.images?.length)
      .filter((product) => {
        const label = String(product.vendorType || product.category || "").toLowerCase();
        return label.includes("cardealer") || label.includes("realestate");
      })
      .map((product) => ({
        id: `hero-${product._id || product.id}`,
        type: "product",
        title: product.title || product.brand || "Featured listing",
        subtitle: product.vendorType === "realestate" ? "Luxury homes and investment property" : "Fresh vehicle deals and trusted listings",
        image: product.images?.[0] || "",
        accent: product.vendorType === "realestate" ? "from-emerald-500/80 via-cyan-500/70 to-sky-900/80" : "from-amber-500/80 via-red-500/70 to-slate-900/80",
        link: product.vendorType === "realestate" ? "/category/realestate" : "/category/cardealer",
      }))
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    const welcomeSlide = {
      id: "welcome-slide",
      type: "welcome",
      title: "Welcome to NovaUnicorn",
      subtitle: "Discover better finds. Shop confidently. Sell boldly.",
      image: "/images/unicorn-banner-black.svg",
      accent: "from-[#071c1a] via-[#102b26] to-[#1c3027]",
      link: "/category/shopvendor",
    };

    const fallbackSlides = [
      { id: "fallback-1", type: "promo", title: "Car Dealer Picks", subtitle: "Premium rides and trusted listings", accent: "from-amber-500/80 via-orange-500/70 to-slate-900/80", link: "/category/cardealer" },
      { id: "fallback-2", type: "promo", title: "Real Estate Homes", subtitle: "Luxury spaces and lifestyle living", accent: "from-emerald-500/80 via-cyan-500/70 to-slate-900/80", link: "/category/realestate" },
      { id: "fallback-3", type: "promo", title: "Daily Deals", subtitle: "Fresh finds for every part of life", accent: "from-violet-500/80 via-fuchsia-500/70 to-slate-900/80", link: "/category/shopvendor" },
      { id: "fallback-4", type: "promo", title: "Smart Shopping", subtitle: "Discover the next perfect fit", accent: "from-sky-500/80 via-cyan-500/70 to-slate-900/80", link: "/category/shopvendor" },
      { id: "fallback-5", type: "promo", title: "New Arrivals", subtitle: "Fresh inventory across the marketplace", accent: "from-rose-500/80 via-pink-500/70 to-slate-900/80", link: "/category/shopvendor" },
      { id: "fallback-6", type: "promo", title: "Trending Vendors", subtitle: "Curated stores and verified sellers", accent: "from-teal-500/80 via-emerald-500/70 to-slate-900/80", link: "/category/shopvendor" },
    ];

    const mixedSlides = [welcomeSlide, ...featuredProductSlides, ...fallbackSlides]
      .slice(0, 7);

    return mixedSlides.length >= 7 ? mixedSlides : [...mixedSlides, ...fallbackSlides].slice(0, 7);
  }, [products]);

  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (!heroSlides.length) return undefined;
    const heroTimer = setInterval(() => {
      setHeroIndex((currentIndex) => (currentIndex + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(heroTimer);
  }, [heroSlides.length]);

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
    <main className="min-h-screen bg-[#02070d] text-[#f3f5f7]">
      <header className="bg-[#0b0c0d] shadow-[0_4px_0_rgba(196,200,204,0.22)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-white sm:px-6 lg:px-8">
          <Link to="/customer" className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c4c8cc] text-2xl text-[#202225]"><FiShoppingBag /></span><span className="text-2xl font-black uppercase leading-[0.8] tracking-[-0.06em]">Nova<br />unicorn</span></Link>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/saved-items" className="inline-flex items-center gap-2 border border-white/20 px-3 py-2 text-sm font-bold text-[#f3f5f7] hover:border-[#c4c8cc]" aria-label={`Saved items and cart: ${savedItems.length} saved, ${carts.length} in cart`}><FiHeart /><span>Saved &amp; Cart</span><span className="text-[#c4c8cc]">{savedItems.length} · {carts.length}</span></Link>
            {user?.role === "vendor" && <Link to={getUserDashboardPath(user)} className="inline-flex items-center gap-2 border border-[#c4c8cc] bg-[#c4c8cc] px-3 py-2 text-sm font-bold text-[#202225] hover:bg-[#e3e5e7]"><FiArrowRight /><span>Vendor dashboard</span></Link>}
            <Link to={user ? "/account" : "/login"} className="flex items-center gap-3 text-sm font-black uppercase text-[#f3f5f7]"><FiUser className="text-2xl" /><span>{user?.username || "My account"}</span></Link>
          </div>
          <div className="relative w-full"><FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a8b0bb]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." aria-label="Search products" className="w-full border-2 border-white/10 bg-[#17191c] px-12 py-3 text-sm text-[#f3f5f7] outline-none placeholder:text-[#9aa5b1] focus:border-[#c4c8cc]" /></div>
        </div>
        <nav className="border-t border-white/10" aria-label="Store navigation"><div className="mx-auto grid max-w-7xl grid-cols-4 gap-1 px-4 py-2 sm:grid-cols-8 sm:px-6 lg:px-8">
          <Link to="/account" aria-label="Settings" title="Settings" className="store-nav-item"><FiSettings /><span className="sr-only">Settings</span></Link>
          <Link to="/category/shopvendor" aria-label="Shopvendor" title="Shopvendor" className="store-nav-item"><BsShop /><span className="sr-only">Shopvendor</span></Link>
          <Link to="/category/cardealer" aria-label="Car dealer" title="Car dealer" className="store-nav-item"><FaCarSide /><span className="sr-only">Car dealer</span></Link>
          <Link to="/category/realestate" aria-label="Realestate" title="Realestate" className="store-nav-item"><BsBuildings /><span className="sr-only">Realestate</span></Link>
          <Link to="/category/pharmacy" aria-label="Pharmacy" title="Pharmacy" className="store-nav-item"><FaCapsules /><span className="sr-only">Pharmacy</span></Link>
          <Link to="/category/agrovet" aria-label="Agrovet" title="Agrovet" className="store-nav-item"><GiPlantRoots /><span className="sr-only">Agrovet</span></Link>
          <Link to="/uber" aria-label="Uber" title="Uber" className="store-nav-item"><FaUber /><span className="sr-only">Uber</span></Link>
          <button type="button" aria-label="Assistance" title="Assistance" onClick={() => window.alert("Our assistance team is available to help you with your order.")} className="store-nav-item assistance-nav-item"><FiHeadphones /></button>
          <Link to="/category/blackmarket" className="store-nav-item"><FiShoppingCart /><span>Blackmarket</span></Link>
        </div></nav>
      </header>
      {actionMessage && <div role="status" className="fixed right-4 top-4 z-50 rounded-md bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">{actionMessage}</div>}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#111315] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="relative h-[350px] overflow-hidden sm:h-[420px]">
            <div className="flex h-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${heroIndex * 100}%)` }}>
              {heroSlides.map((slide) => (
                <div key={slide.id} className={`relative min-w-full h-full overflow-hidden ${slide.type === "welcome" ? "bg-[#0b1715]" : "bg-slate-900"}`}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${slide.accent}`} />
                  {slide.image && (
                    <img src={slide.image} alt={slide.title} className={slide.type === "welcome" ? "absolute right-0 top-0 h-full w-[72%] object-contain object-right opacity-95 mix-blend-screen sm:w-[62%]" : "absolute inset-0 h-full w-full object-cover opacity-55"} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#02070d]/80 via-[#02070d]/45 to-transparent" />
                  <div className={`relative z-10 flex h-full items-center px-6 py-8 sm:px-12 sm:py-12 ${slide.type === "welcome" ? "max-w-2xl" : "max-w-3xl"}`}>
                    <div className={slide.type === "welcome" ? "max-w-[22rem] sm:max-w-[27rem]" : ""}>
                      <p className={slide.type === "welcome" ? "text-xs font-black uppercase tracking-[0.24em] text-[#a7f3d0] sm:text-sm" : "font-serif text-2xl italic text-[#dfe7ee] sm:text-4xl"}>{slide.type === "welcome" ? "Your next great find starts here" : slide.title}</p>
                      <h1 className={`mt-3 max-w-xl font-black uppercase leading-[0.95] text-white ${slide.type === "welcome" ? "text-4xl sm:text-6xl lg:text-7xl" : "text-3xl tracking-tight sm:text-5xl lg:text-6xl"}`}>
                        {slide.type === "welcome" ? "Nova Unicorn" : slide.title}
                      </h1>
                      <p className="mt-4 max-w-xl text-sm text-slate-200 sm:text-base">{slide.subtitle}</p>
                      <Link to={slide.link} className={`mt-7 inline-flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] transition ${slide.type === "welcome" ? "bg-[#a7f3d0] text-[#10231f] hover:bg-white" : "bg-[#c4c8cc] text-[#202225] hover:bg-white"}`}>
                        Explore now <FiArrowRight />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={() => setHeroIndex((current) => (current === 0 ? heroSlides.length - 1 : current - 1))} className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/20 p-3 text-lg text-white backdrop-blur-sm transition hover:bg-black/40" aria-label="Previous banner">
              ‹
            </button>
            <button type="button" onClick={() => setHeroIndex((current) => (current + 1) % heroSlides.length)} className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/20 p-3 text-lg text-white backdrop-blur-sm transition hover:bg-black/40" aria-label="Next banner">
              ›
            </button>

            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 backdrop-blur-sm">
              {heroSlides.map((slide, index) => (
                <button
                  key={`${slide.id}-dot`}
                  type="button"
                  onClick={() => setHeroIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition ${index === heroIndex ? "bg-white" : "bg-white/40"}`}
                />
              ))}
            </div>
          </div>
        </section>
        <div className="mt-5 grid gap-4 md:grid-cols-3"><Link to="/category/shopvendor" className="promo-tile bg-[#111315]">Shop vendor <span>Everyday finds</span><FiArrowRight /></Link><Link to="/category/cardealer" className="promo-tile bg-[#191b1e]">Car dealer <span>Drive something great</span><FiArrowRight /></Link><Link to="/category/blackmarket" className="promo-tile bg-[#222528]">Blackmarket <span>Unique offers</span><FiArrowRight /></Link></div>
        <section className="mt-10"><div className="flex flex-col justify-between gap-3 border-b-2 border-white/10 pb-3 sm:flex-row sm:items-end"><div><p className="text-xs font-black uppercase tracking-[0.25em] text-[#c4c8cc]">Vendor marketplace</p><h2 className="mt-1 text-3xl font-black uppercase text-[#f3f5f7]">Latest arrivals</h2></div><span className="text-sm font-semibold text-[#c4c8cc]">{displayedProducts.length < visibleProducts.length ? `Showing ${displayedProducts.length} of ${visibleProducts.length} products` : `${visibleProducts.length} products available`}</span></div>
          {error && error !== "nil" && <p className="mt-4 text-red-600">{error}</p>}
          {!visibleProducts.length && <div className="mt-6"><ComingSoonBanner label="Vendor marketplace" /></div>}
          {displayedProducts.length > 0 && <div className="store-product-grid-viewport mt-6"><div className="store-product-grid" style={{ "--product-grid-columns": Math.min(displayedProducts.length, 11) }}>{displayedProducts.map((product) => {
            const flashSale = getFlashSaleState(product);
            const productId = product._id || product.id;
            const displayProduct = flashSale ? { ...product, price: flashSale.price } : product;
            const shopLabel = product.vendorType === "blackmarket" ? "Visit black market" : "Visit vendor shop";
            const mainPrice = formatCurrency(displayProduct.price, product.currency, { convert: true, localCurrency: visitorCurrency });
            const originalPrice = formatCurrency(displayProduct.price, product.currency);
            return <article key={productId} role="button" tabIndex="0" onClick={() => navigate(`/${encodeURIComponent(product.title)}`, { state: { product } })} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") navigate(`/${encodeURIComponent(product.title)}`, { state: { product } }); }} className="store-product-card cursor-pointer">
              <div className="relative bg-[#f0eee7] p-3"><img src={product.images?.[0] || "images/phones.png"} alt={product.title} className="h-56 w-full object-contain mix-blend-multiply" />{(product.isFragile || product.isHighValue) && <div className="absolute left-5 top-5 flex flex-wrap gap-1">{product.isFragile && <span className="bg-black px-2 py-1 text-[10px] font-black uppercase text-white">Fragile</span>}{product.isHighValue && <span className="bg-lime-200 px-2 py-1 text-[10px] font-black uppercase text-[#102f2c]">High value</span>}</div>}</div>
              <div className="p-4"><p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#2f5d50]">{product.brand} · {product.category}</p><h3 className="mt-2 text-lg font-black capitalize">{product.title}</h3><p className="mt-2 line-clamp-2 text-sm text-gray-600">{product.description}</p>{flashSale && <p className="mt-3 bg-red-50 p-2 text-xs font-bold text-red-700">Flash sale: {formatCurrency(flashSale.price, product.currency, { convert: true, localCurrency: visitorCurrency })} · {flashSale.time}</p>}<div className="mt-4 flex items-end justify-between border-t border-gray-200 pt-3"><div className="flex flex-col"><strong className="text-xl">{mainPrice}</strong>{visitorCurrency && visitorCurrency !== product.currency && <span className="text-[10px] text-gray-500">Original: {originalPrice}</span>}</div><span className="text-xs font-semibold capitalize text-gray-500">{product.itemCondition || "generic"}</span></div>
                <p className="mt-2 text-xs text-gray-500">From {product.vendorName || "Verified vendor"}</p>
                {product.vendorId && <Link to={`/shop/${encodeURIComponent(product.vendorId)}`} state={{ vendor: product }} onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()} className="mt-2 inline-flex items-center gap-1 text-xs font-bold uppercase text-[#2f5d50] underline">{shopLabel}<FiArrowRight /></Link>}
                <div className="mt-4 flex gap-2"><button onClick={(event) => { event.stopPropagation(); handleSave(productId); }} className="flex-1 border border-[#102f2c] px-3 py-2 text-xs font-black uppercase hover:bg-gray-100">{savedItems.includes(productId) ? "Saved" : "Save"}</button>{(product.sellingMode === "retail" || product.sellingMode === "both" || !product.sellingMode) && <button onClick={(event) => { event.stopPropagation(); handleAddToCart(displayProduct, "retail"); }} className="flex-1 bg-[#102f2c] px-3 py-2 text-xs font-black uppercase text-white hover:bg-[#2f5d50]">Add to cart</button>}</div>
              </div>
            </article>;
          })}</div></div>}
          {!search.trim() && visibleProducts.length > displayedProducts.length && <p className="mt-4 text-sm text-[#c4c8cc]">Search to find more products in the marketplace.</p>}
        </section>
      </div>
    </main>
  );
};

export default CustomerPage;
