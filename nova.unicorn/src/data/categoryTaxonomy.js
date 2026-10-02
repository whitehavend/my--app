export const categoryTaxonomy = {
  shopvendor: [
    { title: "Electronics and Gadgets", items: ["Smartphones", "Laptops", "Audio devices", "Accessories", "Smart home gear"] },
    { title: "Home and Lifestyle", items: ["Kitchen essentials", "Home décor", "Storage solutions", "Cleaning tools", "Wellness items"] },
    { title: "Fashion", items: ["Men's wear", "Women's wear", "Footwear", "Accessories", "Caps and hats"] },
    { title: "Groceries", items: ["Staples", "Snacks", "Beverages", "Healthy foods", "Household grocery"] },
    { title: "Beauty", items: ["Skincare", "Haircare", "Makeup", "Personal care", "Fragrances"] },
    { title: "Automobile Parts", items: ["Engine parts", "Accessories", "Tires", "Lighting", "Maintenance tools"] },
    { title: "Books and Games", items: ["Novels", "Children's books", "Board games", "Puzzles", "Educational games"] },
    { title: "Baby Products", items: ["Diapers", "Feeding essentials", "Skin care", "Nursery items", "Travel gear"] },
  ],
  cardealer: [
    { title: "Passenger and Light Vehicles", items: ["Sedans", "SUVs", "Hatchbacks", "Crossovers", "Luxury cars"] },
    { title: "Heavy Vehicles", items: ["Trucks", "Buses", "Trailers", "Commercial vans", "Utility vehicles"] },
  ],
  realestate: [
    { title: "Land", items: ["Plots", "Rural land", "Urban lots", "Agricultural land", "Development sites"] },
    { title: "Residential", items: ["Apartments", "Townhouses", "Family homes", "Luxury homes", "Studio units"] },
    { title: "Commercial", items: ["Office spaces", "Shops", "Retail outlets", "Business centers", "Mixed-use buildings"] },
    { title: "Industry", items: ["Warehouses", "Factories", "Industrial plots", "Logistics hubs", "Production facilities"] },
  ],
  pharmacy: [
    { title: "POM", items: ["Prescription medicines", "Doctor-prescribed treatments", "Specialized care products", "Therapy packs"] },
    { title: "OTC", items: ["Pain relievers", "Cold medicine", "Antacids", "Vitamins", "Daily wellness essentials"] },
    { title: "Therapeutic", items: ["Antibiotics", "Antihistamines", "Anti-inflammatory medication", "Care support", "Recovery products"] },
  ],
  agrovet: [
    { title: "Animals", items: ["De-wormers", "Antibiotics", "Ectoparasite control", "Vaccines", "Nutritional supplements", "Animal feeds"] },
    { title: "Crops", items: ["Pesticides", "Fungicides", "Herbicides", "Plant nutrition", "Seeds", "Farm tools"] },
  ],
  blackmarket: [
    { title: "Featured finds", items: ["Limited edition goods", "Rare collectibles", "Luxury items", "Hidden deals", "Exclusive drops"] },
    { title: "Special access", items: ["Members-only picks", "One-off listings", "Premium collections", "Curated deals", "Private sales"] },
  ],
};

export const toCategorySlug = (value) => String(value || "")
  .toLowerCase()
  .replace(/&/g, "and")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");