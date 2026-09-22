import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiChevronRight } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { getAllProducts } from "../Store/thunk";
import { formatCurrency } from "../utils/currency";

const categoryConfig = {
  shopvendor: {
    label: "Shop Vendor",
    title: "Shop Vendor marketplace",
    description: "Browse a curated mix of everyday essentials, lifestyle finds, and must-have gadgets.",
    subcategories: [
      { title: "Electronics and Gadgets", items: ["Smartphones", "Laptops", "Audio devices", "Accessories", "Smart home gear"] },
      { title: "Home and Lifestyle", items: ["Kitchen essentials", "Home décor", "Storage solutions", "Cleaning tools", "Wellness items"] },
      { title: "Fashion", items: ["Men's wear", "Women's wear", "Footwear", "Accessories", "Caps and hats"] },
      { title: "Groceries", items: ["Staples", "Snacks", "Beverages", "Healthy foods", "Household grocery"] },
      { title: "Beauty", items: ["Skincare", "Haircare", "Makeup", "Personal care", "Fragrances"] },
      { title: "Automobile Parts", items: ["Engine parts", "Accessories", "Tires", "Lighting", "Maintenance tools"] },
      { title: "Books and Games", items: ["Novels", "Children's books", "Board games", "Puzzles", "Educational games"] },
      { title: "Baby Products", items: ["Diapers", "Feeding essentials", "Skin care", "Nursery items", "Travel gear"] },
    ],
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
    subcategories: [
      { title: "Passenger and Light Vehicles", items: ["Sedans", "SUVs", "Hatchbacks", "Crossovers", "Luxury cars"] },
      { title: "Heavy Vehicles", items: ["Trucks", "Buses", "Trailers", "Commercial vans", "Utility vehicles"] },
    ],
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
    subcategories: [
      { title: "Land", items: ["Plots", "Rural land", "Urban lots", "Agricultural land", "Development sites"] },
      { title: "Residential", items: ["Apartments", "Townhouses", "Family homes", "Luxury homes", "Studio units"] },
      { title: "Commercial", items: ["Office spaces", "Shops", "Retail outlets", "Business centers", "Mixed-use buildings"] },
      { title: "Industry", items: ["Warehouses", "Factories", "Industrial plots", "Logistics hubs", "Production facilities"] },
    ],
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
    subcategories: [
      { title: "POM", items: ["Prescription medicines", "Doctor-prescribed treatments", "Specialized care products", "Therapy packs"] },
      { title: "OTC", items: ["Pain relievers", "Cold medicine", "Antacids", "Vitamins", "Daily wellness essentials"] },
      { title: "Therapeutic", items: ["Antibiotics", "Antihistamines", "Anti-inflammatory medication", "Care support", "Recovery products"] },
    ],
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
    subcategories: [
      { title: "Animals", items: ["De-wormers", "Antibiotics", "Ectoparasite control", "Vaccines", "Nutritional supplements", "Animal feeds"] },
      { title: "Crops", items: ["Pesticides", "Fungicides", "Herbicides", "Plant nutrition", "Seeds", "Farm tools"] },
    ],
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
    subcategories: [
      { title: "Featured finds", items: ["Limited edition goods", "Rare collectibles", "Luxury items", "Hidden deals", "Exclusive drops"] },
      { title: "Special access", items: ["Members-only picks", "One-off listings", "Premium collections", "Curated deals", "Private sales"] },
    ],
    products: [
      { title: "Rare Collector Watch", price: "₦120,000", tag: "Featured finds", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80" },
      { title: "Luxury Leather Set", price: "₦90,500", tag: "Special access", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80" },
      { title: "Exclusive Tech Drop", price: "₦74,000", tag: "Featured finds", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80" },
    ],
  },
};

const toCategorySlug = (value) => String(value || "")
  .toLowerCase()
  .replace(/&/g, "and")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const CategoryShowcasePage = () => {
  const { category = "shopvendor" } = useParams();
  const details = categoryConfig[category] || categoryConfig.shopvendor;
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.products);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  useEffect(() => {
    const refreshProducts = () => dispatch(getAllProducts());
    refreshProducts();
    setSelectedSubcategory("");
    const refreshTimer = setInterval(refreshProducts, 5000);

    return () => clearInterval(refreshTimer);
  }, [category, dispatch]);

  const categorySlugs = useMemo(() => details.subcategories.flatMap((group) => [
    toCategorySlug(group.title),
    ...group.items.map(toCategorySlug),
  ]), [details]);

  const matchingProducts = useMemo(() => {
    const selectedSlug = toCategorySlug(selectedSubcategory);
    const allowedSlugs = selectedSlug ? [selectedSlug] : categorySlugs;

    return products.filter((product) => {
      const productSlug = toCategorySlug(product.category);
      const productSubcategorySlug = toCategorySlug(product.subcategory);
      const belongsToParentCategory = categorySlugs.includes(productSlug);
      return product.vendorId && belongsToParentCategory && (
        selectedSlug ? productSubcategorySlug === selectedSlug : allowedSlugs.includes(productSlug)
      );
    });
  }, [categorySlugs, products, selectedSubcategory]);

  const displayedProducts = matchingProducts;
  const isShowingVendorProducts = matchingProducts.length > 0;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary100">
              <FiArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <div className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {details.label}
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary via-primary100 to-[#1d4ed8] px-5 py-8 text-white sm:px-8 sm:py-10">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/80">Category showcase</p>
            <h1 className="mt-3 text-3xl font-black sm:text-5xl">{details.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">{details.description}</p>
          </div>
        </header>

        <section className="mb-8 grid gap-5 md:grid-cols-2">
          {details.subcategories.map((group) => (
            <article key={group.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-slate-900">{group.title}</h2>
                <FiChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSelectedSubcategory(item)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${selectedSubcategory === item ? "border-primary bg-primary text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-primary hover:text-primary"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="mb-4">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-900">{selectedSubcategory || "Featured products"}</h2>
              {selectedSubcategory && <button type="button" onClick={() => setSelectedSubcategory("")} className="mt-1 text-sm font-medium text-primary hover:underline">Show all {details.label.toLowerCase()} products</button>}
            </div>
            <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{details.label}</span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {displayedProducts.map((product) => (
              <article key={product._id || product.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <img src={isShowingVendorProducts ? product.images?.[0] || "images/phones.png" : product.image} alt={product.title} className="h-44 w-full object-cover" onError={(event) => { event.currentTarget.src = "images/phones.png"; }} />
                <div className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">{isShowingVendorProducts ? product.subcategory || product.category : product.tag}</p>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">{product.title}</h3>
                  <p className="mt-3 text-2xl font-black text-gray-900">{isShowingVendorProducts ? formatCurrency(product.price, product.currency) : product.price}</p>
                  <div className="mt-4 flex gap-2">
                    <button type="button" className="flex-1 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10">
                      Save
                    </button>
                    <button type="button" className="flex-1 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-primary100">
                      Add to cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {selectedSubcategory && !displayedProducts.length && (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
              No vendor products are available in {selectedSubcategory} yet.
            </p>
          )}
        </section>
      </div>
    </main>
  );
};

export default CategoryShowcasePage;
