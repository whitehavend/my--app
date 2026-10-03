import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiChevronRight } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { getAllProducts } from "../Store/thunk";
import { addToCart } from "../Store/cart/CartSlice";
import { formatCurrency } from "../utils/currency";
import { categoryTaxonomy, toCategorySlug } from "../data/categoryTaxonomy";

const categoryConfig = {
  shopvendor: {
    label: "Shop Vendor",
    title: "Shop Vendor marketplace",
    description: "Browse a curated mix of everyday essentials, lifestyle finds, and must-have gadgets.",
    subcategories: categoryTaxonomy.shopvendor,
    products: [
      { title: "Premium Wireless Earbuds", price: "₦45,000", tag: "Electronics and Gadgets", image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80" },
      { title: "Modern Smart Speaker", price: "₦68,000", tag: "Home and Lifestyle", image: "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=900&q=80" },
      { title: "Classic Fashion Pack", price: "₦28,500", tag: "Fashion", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80" },
      { title: "Fresh Groceries Box", price: "₦19,200", tag: "Groceries", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80" },
    ],
  },
  cardealer: {
    label: "Car Dealer",
    title: "Car Dealer marketplace",
    description: "Find vehicles built for everyday use, business operations, and heavy-duty work.",
    subcategories: categoryTaxonomy.cardealer,
    products: [
      { title: "2024 Toyota Corolla", price: "₦19,500,000", tag: "Passenger and Light Vehicles", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80" },
      { title: "Mercedes GLE SUV", price: "₦34,000,000", tag: "Passenger and Light Vehicles", image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=900&q=80" },
      { title: "Heavy Duty Truck", price: "₦52,000,000", tag: "Heavy Vehicles", image: "https://images.unsplash.com/photo-1605559424843-9e4c9488dec0?auto=format&fit=crop&w=900&q=80" },
    ],
  },
  realestate: {
    label: "Real Estate",
    title: "Real Estate marketplace",
    description: "Explore property opportunities across land, homes, commercial spaces, and industrial facilities.",
    subcategories: categoryTaxonomy.realestate,
    products: [
      { title: "Prime City Plot", price: "₦16,500,000", tag: "Land", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80" },
      { title: "Luxury 3-Bedroom Home", price: "₦42,000,000", tag: "Residential", image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80" },
      { title: "Business Plaza Space", price: "₦29,000,000", tag: "Commercial", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80" },
    ],
  },
  pharmacy: {
    label: "Pharmacy",
    title: "Pharmacy marketplace",
    description: "Shop essential health and wellness products that support everyday care and treatment.",
    subcategories: categoryTaxonomy.pharmacy,
    products: [
      { title: "Daily Wellness Pack", price: "₦18,500", tag: "OTC", image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80" },
      { title: "Prescription Care Kit", price: "₦27,000", tag: "POM", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80" },
      { title: "Therapeutic Recovery Blend", price: "₦22,400", tag: "Therapeutic", image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=900&q=80" },
    ],
  },
  agrovet: {
    label: "Agrovet",
    title: "Agrovet marketplace",
    description: "Protect animals, improve crop performance, and strengthen agricultural productivity.",
    subcategories: categoryTaxonomy.agrovet,
    products: [
      { title: "Animal Feed Pro Mix", price: "₦16,000", tag: "Animals", image: "https://images.unsplash.com/photo-1545243424-0ce743321e11?auto=format&fit=crop&w=900&q=80" },
      { title: "Crop Protection Bundle", price: "₦25,800", tag: "Crops", image: "https://images.unsplash.com/photo-1464226184884-fa52acb6a66a?auto=format&fit=crop&w=900&q=80" },
      { title: "Farm Nutrition Pack", price: "₦11,300", tag: "Crops", image: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80" },
    ],
  },
  blackmarket: {
    label: "Black Market",
    title: "Black market marketplace",
    description: "Discover exclusive finds, hidden bargains, and rare collections in our curated marketplace.",
    subcategories: categoryTaxonomy.blackmarket,
    products: [
      { title: "Rare Collector Watch", price: "₦120,000", tag: "Featured finds", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80" },
      { title: "Luxury Leather Set", price: "₦90,500", tag: "Special access", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80" },
      { title: "Exclusive Tech Drop", price: "₦74,000", tag: "Featured finds", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80" },
    ],
  },
};

const CategoryShowcasePage = () => {
  const { category = "shopvendor", subcategory: routeSubcategory = "" } = useParams();
  const navigate = useNavigate();
  const details = categoryConfig[category] || categoryConfig.shopvendor;
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);
  const [selectedSubcategory, setSelectedSubcategory] = useState(routeSubcategory);
  const [savedProductIds, setSavedProductIds] = useState([]);
  const isPropertyOrVehicleCategory = category === "realestate" || category === "cardealer";

  useEffect(() => {
    const refreshProducts = () => dispatch(getAllProducts());
    refreshProducts();
    setSelectedSubcategory(routeSubcategory);
    const refreshTimer = setInterval(refreshProducts, 5000);

    return () => clearInterval(refreshTimer);
  }, [category, dispatch, routeSubcategory]);

  useEffect(() => {
    if (!user?.uid) {
      setSavedProductIds([]);
      return;
    }

    setSavedProductIds(JSON.parse(localStorage.getItem(`nova_saved_${user.uid}`) || "[]"));
  }, [user]);

  const categorySlugs = useMemo(() => details.subcategories.flatMap((group) => [
    toCategorySlug(group.title),
    ...group.items.map(toCategorySlug),
  ]), [details]);

  const matchingProducts = useMemo(() => {
    const selectedSlug = toCategorySlug(selectedSubcategory);
    const allowedSlugs = selectedSlug ? [selectedSlug] : categorySlugs;
    const selectedGroup = details.subcategories.find((group) => toCategorySlug(group.title) === selectedSlug);
    const selectedGroupSlugs = selectedGroup
      ? [toCategorySlug(selectedGroup.title), ...selectedGroup.items.map(toCategorySlug)]
      : [];

    return products.filter((product) => {
      const productSlug = toCategorySlug(product.category);
      const productSubcategorySlug = toCategorySlug(product.subcategory);
      const belongsToParentCategory = categorySlugs.includes(productSlug);
      if (!product.vendorId || !belongsToParentCategory) return false;
      if (!selectedSlug) return allowedSlugs.includes(productSlug);
      if (selectedGroup) return selectedGroupSlugs.includes(productSlug) || selectedGroupSlugs.includes(productSubcategorySlug);
      return productSubcategorySlug === selectedSlug || productSlug === selectedSlug;
    });
  }, [categorySlugs, details, products, selectedSubcategory]);

  const displayedProducts = matchingProducts;
  const isShowingVendorProducts = matchingProducts.length > 0;
  const selectedLabel = details.subcategories.flatMap((group) => [group.title, ...group.items]).find((item) => toCategorySlug(item) === toCategorySlug(selectedSubcategory)) || selectedSubcategory;

  const addProductToCart = (product) => {
    if (!user || user.role !== "customer") {
      window.location.assign("/login");
      return;
    }
    dispatch(addToCart({ product: { ...product, id: product._id || product.id, price: product.price, priceType: "retail" }, quantity: 1 }));
  };

  const toggleSavedProduct = (event, product) => {
    event.stopPropagation();
    if (!user || user.role !== "customer") {
      navigate("/login");
      return;
    }

    const savedKey = `nova_saved_${user.uid}`;
    const productId = product._id || product.id;
    const nextSavedProductIds = savedProductIds.includes(productId)
      ? savedProductIds.filter((id) => id !== productId)
      : [...savedProductIds, productId];
    localStorage.setItem(savedKey, JSON.stringify(nextSavedProductIds));
    setSavedProductIds(nextSavedProductIds);
  };

  const openProduct = (product) => {
    const detailProduct = isShowingVendorProducts ? product : {
      ...product,
      _id: `category-${category}-${product.title}`,
      images: product.image ? [product.image] : [],
      description: product.description || product.tag || details.description,
      brand: product.brand || details.label,
      category: product.category || product.tag,
      currency: "NGN",
      price: Number(String(product.price).replace(/[^0-9.]/g, "")) || 0,
      rating: product.rating || 0,
      reviews: product.reviews || [],
    };

    navigate(`/${encodeURIComponent(product.title)}`, { state: { product: detailProduct } });
  };

  return (
    <main className="min-h-screen bg-[#02070d] px-4 py-6 text-[#f3f5f7] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0b1118] shadow-[0_0_30px_rgba(124,230,212,0.12)]">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#101822] px-4 py-4 sm:px-6">
            <Link to="/customer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#7ce6d4] transition hover:text-[#60e0c4]">
              <FiArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <div className="rounded-full border border-[#7ce6d4]/30 bg-[#7ce6d4]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#dfe7ee]">
              {details.label}
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#02070d] via-[#101922] to-[#111b26] px-5 py-8 text-white sm:px-8 sm:py-10">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#dfe7ee]">Category showcase</p>
            <h1 className="mt-3 text-3xl font-black sm:text-5xl">{details.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#dfe7ee] sm:text-base">{details.description}</p>
          </div>
        </header>

        <section className="mb-8 grid gap-5 md:grid-cols-2">
          {details.subcategories.map((group) => (
            <article key={group.title} className="rounded-2xl border border-white/10 bg-[#101822] p-5 shadow-[0_12px_28px_rgba(2,6,23,0.45)]">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-[#f3f5f7]">{group.title}</h2>
                <Link to={`/category/${category}/subcategory/${toCategorySlug(group.title)}`} aria-label={`Show all ${group.title}`} className="rounded-full p-1 text-[#7ce6d4] transition hover:bg-[#7ce6d4]/10 hover:text-[#f3f5f7]">
                  <FiChevronRight className="h-5 w-5" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <Link
                    key={item}
                    to={`/category/${category}/subcategory/${toCategorySlug(item)}`}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${toCategorySlug(selectedSubcategory) === toCategorySlug(item) ? "border-[#7ce6d4] bg-[#7ce6d4] text-[#071118]" : "border-white/10 bg-[#0b1118] text-[#dfe7ee] hover:border-[#7ce6d4] hover:text-[#f3f5f7]"}`}
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="mb-4">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-sky-50">{selectedLabel || "Featured products"}</h2>
              {selectedSubcategory && <button type="button" onClick={() => setSelectedSubcategory("")} className="mt-1 text-sm font-medium text-sky-300 hover:text-sky-200 hover:underline">Show all {details.label.toLowerCase()} products</button>}
            </div>
            <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">{details.label}</span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {displayedProducts.map((product) => (
              <article key={product._id || product.title} role="link" tabIndex={0} aria-label={`View ${product.title}`} onClick={() => openProduct(product)} onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); openProduct(product); } }} className="cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#101822] shadow-[0_12px_28px_rgba(2,6,23,0.45)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(124,230,212,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7ce6d4]">
                <img src={isShowingVendorProducts ? product.images?.[0] || "images/phones.png" : product.image} alt={product.title} className="h-44 w-full object-cover" onError={(event) => { event.currentTarget.src = "images/phones.png"; }} />
                <div className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#7ce6d4]">{isShowingVendorProducts ? product.subcategory || product.category : product.tag}</p>
                  <h3 className="mt-2 text-lg font-bold text-[#f3f5f7]">{product.title}</h3>
                  <p className="mt-3 text-2xl font-black text-[#f3f5f7]">{isShowingVendorProducts ? formatCurrency(product.price, product.currency) : product.price}</p>
                  {isPropertyOrVehicleCategory && (
                    <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-xs text-[#c4c8cc]">
                      <p>Phone: {product.vendorContactInfo || product.vendorPhoneNumber || product.contactInfo || "Not provided"}</p>
                      <p>Email: {product.vendorEmail || product.email || "Not provided"}</p>
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={(event) => toggleSavedProduct(event, product)} className="flex-1 rounded-lg border border-white/10 bg-[#0b1118] px-3 py-2.5 text-sm font-semibold text-[#dfe7ee] transition hover:bg-[#111b26]">
                      {savedProductIds.includes(product._id || product.id) ? "Saved" : "Save"}
                    </button>
                    {!isPropertyOrVehicleCategory && <button type="button" onClick={(event) => { event.stopPropagation(); if (isShowingVendorProducts) addProductToCart(product); }} className="flex-1 rounded-lg bg-[#7ce6d4] px-3 py-2.5 text-sm font-semibold text-[#071118] transition hover:bg-[#60e0c4]">Add to cart</button>}
                  </div>
                </div>
              </article>
            ))}
          </div>
          {selectedSubcategory && !displayedProducts.length && (
            <p className="rounded-2xl border border-dashed border-sky-700 bg-[#0d182c] p-8 text-center text-sm text-sky-100/80">
              No vendor products are available in {selectedSubcategory} yet.
            </p>
          )}
        </section>
      </div>
    </main>
  );
};

export default CategoryShowcasePage;
