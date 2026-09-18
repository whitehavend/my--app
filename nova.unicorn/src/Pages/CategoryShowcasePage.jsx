import { Link } from "react-router-dom";
import { FiArrowLeft, FiChevronRight } from "react-icons/fi";

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
  },
  cardealer: {
    label: "Car Dealer",
    title: "Car Dealer marketplace",
    description: "Find vehicles built for everyday use, business operations, and heavy-duty work.",
    subcategories: [
      { title: "Passenger and Light Vehicles", items: ["Sedans", "SUVs", "Hatchbacks", "Crossovers", "Luxury cars"] },
      { title: "Heavy Vehicles", items: ["Trucks", "Buses", "Trailers", "Commercial vans", "Utility vehicles"] },
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
  },
  agrovet: {
    label: "Agrovet",
    title: "Agrovet marketplace",
    description: "Protect animals, improve crop performance, and strengthen agricultural productivity.",
    subcategories: [
      { title: "Animals", items: ["De-wormers", "Antibiotics", "Ectoparasite control", "Vaccines", "Nutritional supplements", "Animal feeds"] },
      { title: "Crops", items: ["Pesticides", "Fungicides", "Herbicides", "Plant nutrition", "Seeds", "Farm tools"] },
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
  },
};

const CategoryShowcasePage = ({ category = "shopvendor" }) => {
  const details = categoryConfig[category] || categoryConfig.shopvendor;

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

        <section className="grid gap-5 md:grid-cols-2">
          {details.subcategories.map((group) => (
            <article key={group.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-slate-900">{group.title}</h2>
                <FiChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
};

export default CategoryShowcasePage;
