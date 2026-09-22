import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { createProduct } from "../Store/thunk";
import { getCountries } from "libphonenumber-js";
import { getCurrencyForCountry } from "../utils/currency";

const countryNameDisplay = new Intl.DisplayNames(["en"], { type: "region" });
const countryOptions = getCountries()
  .map((code) => ({ code, name: countryNameDisplay.of(code) || code }))
  .sort((first, second) => first.name.localeCompare(second.name));

const vendorCategoryOptions = {
  shopvendor: [
    { value: "electronics-and-gadgets", label: "Electronics and gadgets" },
    { value: "home-and-lifestyle", label: "Home and lifestyle" },
    { value: "fashion", label: "Fashion" },
    { value: "groceries", label: "Groceries" },
    { value: "beauty", label: "Beauty" },
    { value: "automobile-parts", label: "Automobile parts" },
    { value: "books-and-games", label: "Books and games" },
    { value: "baby-products", label: "Baby products" },
  ],
  cardealer: [
    { value: "passenger-and-light-vehicles", label: "Passenger and light vehicles" },
    { value: "heavy-vehicles", label: "Heavy vehicles" },
  ],
  realestate: [
    { value: "land", label: "Land" },
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "industry", label: "Industry" },
  ],
  pharmacy: [
    { value: "pom", label: "POM" },
    { value: "otc", label: "OTC" },
    { value: "therapeutic", label: "Therapeutic" },
  ],
  agrovet: [
    { value: "animals", label: "Animals" },
    { value: "crops", label: "Crops" },
  ],
  blackmarket: [
    { value: "featured-finds", label: "Featured finds" },
    { value: "special-access", label: "Special access" },
    { value: "exclusive-drops", label: "Exclusive drops" },
  ],
};

const subcategoryOptions = {
  smartphones: ["Android phones", "iPhones", "Feature phones", "Refurbished phones"],
  laptops: ["Business laptops", "Gaming laptops", "MacBooks", "Chromebooks"],
  gaming: ["Consoles", "Gaming PCs", "Games", "Gaming accessories"],
  accessories: ["Phone accessories", "Computer accessories", "Audio devices", "Smart home gear"],
  "electronics-and-gadgets": ["Smartphones", "Laptops", "Audio devices", "Accessories", "Smart home gear"],
  "home-and-lifestyle": ["Kitchen essentials", "Home decor", "Storage solutions", "Cleaning tools", "Wellness items"],
  fashion: ["Men's wear", "Women's wear", "Footwear", "Fashion accessories", "Caps and hats"],
  groceries: ["Staples", "Snacks", "Beverages", "Healthy foods", "Household grocery"],
  beauty: ["Skincare", "Haircare", "Makeup", "Personal care", "Fragrances"],
  "automobile-parts": ["Engine parts", "Tires", "Lighting", "Maintenance tools", "Car accessories"],
  "books-and-games": ["Novels", "Children's books", "Board games", "Puzzles", "Educational games"],
  "baby-products": ["Diapers", "Feeding essentials", "Skin care", "Nursery items", "Travel gear"],
  "passenger-and-light-vehicles": ["Sedans", "SUVs", "Hatchbacks", "Crossovers", "Luxury cars"],
  "heavy-vehicles": ["Trucks", "Buses", "Trailers", "Commercial vans", "Utility vehicles"],
  land: ["Plots", "Rural land", "Urban lots", "Agricultural land", "Development sites"],
  residential: ["Apartments", "Townhouses", "Family homes", "Luxury homes", "Studio units"],
  commercial: ["Office spaces", "Shops", "Retail outlets", "Business centers", "Mixed-use buildings"],
  industry: ["Warehouses", "Factories", "Industrial plots", "Logistics hubs", "Production facilities"],
  pom: ["Prescription medicines", "Doctor-prescribed treatments", "Specialized care products", "Therapy packs"],
  otc: ["Pain relievers", "Cold medicine", "Antacids", "Vitamins", "Daily wellness essentials"],
  therapeutic: ["Antibiotics", "Antihistamines", "Anti-inflammatory medication", "Care support", "Recovery products"],
  animals: ["De-wormers", "Antibiotics", "Ectoparasite control", "Vaccines", "Animal feeds"],
  crops: ["Pesticides", "Fungicides", "Herbicides", "Plant nutrition", "Seeds", "Farm tools"],
  "featured-finds": ["Limited edition goods", "Rare collectibles", "Luxury items", "Hidden deals", "Exclusive drops"],
  "special-access": ["Members-only picks", "One-off listings", "Premium collections", "Curated deals", "Private sales"],
  "exclusive-drops": ["Limited releases", "Rare products", "Collector items", "Premium drops"],
  other: ["Other"],
};

const getDefaultForm = (selectedVendorType = "retailshopvendor") => ({
  title: "",
  brand: "",
  category: vendorCategoryOptions[selectedVendorType]?.[0]?.value || "smartphones",
    subcategory: "",
  description: "",
  price: "",
  sellingMode: "retail",
  itemCondition: "generic",
  retailPricingType: "regular",
  flashSalePrice: "",
  flashSaleDuration: "",
  salePrice: "",
  compareAtPrice: "",
  priceDetails: "",
  stock: "",
  shippingInformation: "",
  weight: "",
  images: "",
  stockVolume: "",
  wholeSalePrice: "",
  wholeSaleVolume: "",
  wholesalePrice: "",
  basePrice: "",
  prescription: "",
  country: "",
  location: "",
  contactInfo: "",
  massVolume: "",
});

const VendorProductUpload = ({ vendorType = "retailshopvendor" }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { productStatus, productError } = useAppSelector((state) => state.products);
  const [formData, setFormData] = useState(() => getDefaultForm(vendorType));
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [localValidationError, setLocalValidationError] = useState("");
  const categoryOptions = vendorCategoryOptions[vendorType] || vendorCategoryOptions.shopvendor;
  const isHealthOrAgrovet = vendorType === "pharmacy" || vendorType === "agrovet";
  const titlePlaceholder = vendorType === "pharmacy"
    ? "Example: Amoxicillin 500mg Capsules"
    : vendorType === "agrovet"
      ? "Example: Premium Poultry Feed 25kg"
      : "Example: Nova Pro Smartphone";
  const brandPlaceholder = vendorType === "pharmacy"
    ? "Example: Pfizer"
    : vendorType === "agrovet"
      ? "Example: NutriFarm"
      : "Nova";

  const handleImageFiles = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploadedFiles((prev) => [...prev, ...files]);
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-10">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">Vendor access required</h1>
          <p className="text-gray-600">Please sign in to upload a product listing.</p>
        </div>
      </div>
    );
  }

  if (!['vendor', 'blackmarket'].includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-10">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">Vendor access required</h1>
          <p className="text-gray-600">Only approved seller accounts can upload new products.</p>
        </div>
      </div>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value, ...(name === "category" ? { subcategory: "" } : {}) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalValidationError("");

    const normalizedImages = (formData.images || "")
      .split(",")
      .map((image) => image.trim())
      .filter(Boolean);

    const basePriceValue = Number(formData.basePrice || formData.price || 0);
    const wholeSalePriceValue = formData.wholeSalePrice !== "" ? formData.wholeSalePrice : formData.wholesalePrice;
    const wholeSaleVolumeValue = formData.wholeSaleVolume !== "" ? formData.wholeSaleVolume : formData.stockVolume;
    const flashSaleEndsAt = formData.flashSaleDuration ? new Date(Date.now() + Number(formData.flashSaleDuration) * 60 * 60 * 1000).toISOString() : "";

    if ((formData.sellingMode === "wholesale" || formData.sellingMode === "both") && !wholeSalePriceValue) {
      setLocalValidationError("Enter a wholesale price for the selected selling mode.");
      return;
    }

    if (wholeSaleVolumeValue !== undefined && wholeSaleVolumeValue !== "" && Number(wholeSaleVolumeValue) <= 5) {
      setLocalValidationError("Wholesale volume must be greater than 5.");
      return;
    }

    const payload = {
      ...formData,
      title: formData.title || formData.brand || "Vendor listing",
      price: basePriceValue,
      sellingMode: formData.sellingMode,
      itemCondition: isHealthOrAgrovet ? "original" : formData.itemCondition,
      retailPricingType: vendorType === "retailshopvendor" ? formData.retailPricingType : "regular",
      flashSalePrice: vendorType === "retailshopvendor" && formData.retailPricingType === "flash_sale" ? Number(formData.flashSalePrice) : null,
      flashSaleEndsAt: vendorType === "retailshopvendor" && formData.retailPricingType === "flash_sale" ? flashSaleEndsAt : null,
      salePrice: null,
      wholesalePrice: wholeSalePriceValue ? Number(wholeSalePriceValue) : null,
      compareAtPrice: formData.compareAtPrice === "" ? null : Number(formData.compareAtPrice),
      stock: Number(formData.stock || 0),
      stockVolume: null,
      wholesaleVolume: wholeSaleVolumeValue ? Number(wholeSaleVolumeValue) : null,
      weight: formData.massVolume === "" ? 0 : Number(formData.massVolume),
      images: normalizedImages,
      country: formData.country,
      location: formData.location,
      contactInfo: formData.contactInfo,
      vendorName: user.shopName || user.displayName || user.username || "Vendor",
      vendorContactInfo: formData.contactInfo,
      vendorDescription: formData.description,
      vendorType,
      subcategory: formData.subcategory,
      currency: getCurrencyForCountry(formData.country),
    };

    const formPayload = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== undefined && item !== null && item !== "") {
            formPayload.append(key, String(item));
          }
        });
        return;
      }

      formPayload.append(key, String(value));
    });

    uploadedFiles.forEach((file) => {
      formPayload.append("images", file);
    });

    const resultAction = await dispatch(createProduct(formPayload));

    if (createProduct.fulfilled.match(resultAction)) {
      setFormData(getDefaultForm(vendorType));
      setUploadedFiles([]);
      navigate(user.role === "blackmarket" ? "/blackmarket" : `/vendor/${user.vendorType || vendorType}`);
    }
  };

  return (
    <div className="min-h-[60vh] bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">{user.role === "blackmarket" ? "Black market dashboard" : "Vendor dashboard"}</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Upload a new product</h1>
          {user.role === "blackmarket" && <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Reminder: deliver blackmarket items to the Nova warehouse before fulfilling a customer order.</p>}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Product title</label>
            <input name="title" value={formData.title} onChange={handleChange} required className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder={titlePlaceholder} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Brand</label>
            <input name="brand" value={formData.brand} onChange={handleChange} required className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder={brandPlaceholder} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required className="w-full rounded-md border border-gray-300 bg-white p-3 outline-none focus:border-primary">
              {[...categoryOptions, { value: "other", label: "Other" }].map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {subcategoryOptions[formData.category]?.length > 0 && (
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">Subcategory</label>
                <select name="subcategory" value={formData.subcategory} onChange={handleChange} required className="w-full rounded-md border border-gray-300 bg-white p-3 outline-none focus:border-primary">
                  <option value="">Select subcategory</option>
                  {[...new Set([...subcategoryOptions[formData.category], "Other"])].map((subcategory) => <option key={subcategory} value={subcategory}>{subcategory}</option>)}
                </select>
              </div>
            )}
          </div>

          {vendorType === "pharmacy" || vendorType === "agrovet" ? (
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">Prescription</label>
              <select name="prescription" value={formData.prescription} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white p-3 outline-none focus:border-primary">
                <option value="">Select prescription requirement</option>
                <option value="required">Required</option>
                <option value="not-required">Not required</option>
              </select>
            </div>
          ) : null}

          {vendorType === "pharmacy" || vendorType === "agrovet" ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Mass/Volume</label>
              <input name="massVolume" value={formData.massVolume} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="250ml / 500g" />
            </div>
          ) : null}

          {vendorType === "realestate" ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Location</label>
              <input name="location" value={formData.location} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="Lekki Phase 1" />
            </div>
          ) : null}

          {vendorType === "cardealer" ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Location</label>
              <input name="location" value={formData.location} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="Lagos showroom" />
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Base price</label>
            <input type="number" min="0" step="0.01" name="basePrice" value={formData.basePrice} onChange={handleChange} required className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="499.99" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Selling option</label>
            <select name="sellingMode" value={formData.sellingMode} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white p-3 outline-none focus:border-primary">
              <option value="retail">Retail only</option>
              <option value="wholesale">Wholesale only</option>
              <option value="both">Retail and wholesale</option>
            </select>
          </div>

          {!isHealthOrAgrovet && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Item type</label>
              <select name="itemCondition" value={formData.itemCondition} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white p-3 outline-none focus:border-primary">
                <option value="generic">Generic</option>
                <option value="original">Original</option>
              </select>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Retail stock</label>
            <input type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} required className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="100" />
          </div>

          {vendorType === "retailshopvendor" && (
            <div className="md:col-span-2 rounded-md border border-red-100 bg-red-50 p-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Retail pricing</label>
              <select name="retailPricingType" value={formData.retailPricingType} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white p-3 outline-none focus:border-primary">
                <option value="regular">Regular pricing</option>
                <option value="flash_sale">Flash sale</option>
              </select>
              {formData.retailPricingType === "flash_sale" && (
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Flash sale price</label>
                    <input type="number" min="0" step="0.01" name="flashSalePrice" value={formData.flashSalePrice} onChange={handleChange} required className="w-full rounded-md border border-gray-300 bg-white p-3 outline-none focus:border-primary" placeholder="399.99" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Flash sale duration (hours)</label>
                    <input type="number" min="1" step="1" name="flashSaleDuration" value={formData.flashSaleDuration} onChange={handleChange} required className="w-full rounded-md border border-gray-300 bg-white p-3 outline-none focus:border-primary" placeholder="24" />
                  </div>
                </div>
              )}
            </div>
          )}

          {(formData.sellingMode === "wholesale" || formData.sellingMode === "both") && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Wholesale price</label>
              <input type="number" min="0" step="0.01" name="wholeSalePrice" value={formData.wholeSalePrice} onChange={handleChange} required className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="349.99" />
            </div>
          )}

          {(formData.sellingMode === "wholesale" || formData.sellingMode === "both") && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Whole sale volume</label>
              <input type="number" min="0" name="wholeSaleVolume" value={formData.wholeSaleVolume} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="100" />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Country</label>
            <select name="country" value={formData.country} onChange={handleChange} required className="w-full rounded-md border border-gray-300 bg-white p-3 outline-none focus:border-primary">
              <option value="">Select country</option>
              {countryOptions.map(({ code, name }) => <option key={code} value={code}>{name}</option>)}
            </select>
            <p className="mt-1 text-xs text-gray-500">Prices will use the selected country currency.</p>
          </div>

          {vendorType === "realestate" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Contact info</label>
              <input name="contactInfo" value={formData.contactInfo} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="+234 800 000 0000" />
            </div>
          )}

          {vendorType === "cardealer" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Contact info</label>
              <input name="contactInfo" value={formData.contactInfo} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="+234 800 000 0000" />
            </div>
          )}

          {vendorType === "pharmacy" || vendorType === "agrovet" ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Contact info</label>
              <input name="contactInfo" value={formData.contactInfo} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="+234 800 000 0000" />
            </div>
          ) : null}

          {vendorType === "blackmarket" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Contact info</label>
              <input name="contactInfo" value={formData.contactInfo} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="+234 800 000 0000" />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Upload product images</label>
            <input type="file" accept="image/*" multiple onChange={handleImageFiles} className="w-full rounded-md border border-gray-300 bg-white p-3 file:mr-4 file:rounded file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-white" />
            <textarea name="images" value={formData.images} onChange={handleChange} rows="3" className="mt-3 w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="Paste image URLs or use the file picker above. Example: https://example.com/1.png, https://example.com/2.png" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Price details</label>
            <input name="priceDetails" value={formData.priceDetails} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="Inclusive of VAT or free shipping over $50" />
          </div>

          {(productError || localValidationError) && (
            <div className="md:col-span-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{localValidationError || productError}</div>
          )}

          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button type="submit" disabled={productStatus === 'loading'} className="rounded-md bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary100 disabled:cursor-not-allowed disabled:opacity-70">
              {productStatus === 'loading' ? 'Uploading...' : 'Upload product'}
            </button>
            <button type="button" onClick={() => navigate(user.role === "blackmarket" ? "/customer" : "/")} className="rounded-md border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100">
              View customer page
            </button>
            <button type="button" onClick={() => navigate(user.role === "blackmarket" ? "/blackmarket" : "/")} className="rounded-md border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100">
              Back to dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorProductUpload;
