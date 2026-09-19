import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { createProduct } from "../Store/thunk";

const vendorCategoryOptions = {
  shopvendor: [
    { value: "smartphones", label: "Smartphones" },
    { value: "laptops", label: "Laptops" },
    { value: "gaming", label: "Gaming" },
    { value: "accessories", label: "Accessories" },
    { value: "appliances", label: "Appliances" },
    { value: "fashion", label: "Fashion" },
    { value: "electronics-and-gadgets", label: "Electronics and gadgets" },
    { value: "home-and-lifestyle", label: "Home and lifestyle" },
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

const getDefaultForm = (selectedVendorType = "retailshopvendor") => ({
  title: "",
  brand: "",
  category: vendorCategoryOptions[selectedVendorType]?.[0]?.value || "smartphones",
  description: "",
  price: "",
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

  if (user.role !== "vendor") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-10">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">Vendor access required</h1>
          <p className="text-gray-600">Only vendor accounts can upload new products.</p>
        </div>
      </div>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    if (wholeSalePriceValue !== undefined && wholeSalePriceValue !== "" && Number(wholeSalePriceValue) <= basePriceValue) {
      setLocalValidationError("Wholesale price must be greater than the base price.");
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
      salePrice: wholeSalePriceValue ? Number(wholeSalePriceValue) : (formData.salePrice === "" ? null : Number(formData.salePrice)),
      wholesalePrice: wholeSalePriceValue ? Number(wholeSalePriceValue) : null,
      compareAtPrice: formData.compareAtPrice === "" ? null : Number(formData.compareAtPrice),
      stock: wholeSaleVolumeValue ? Number(wholeSaleVolumeValue) : Number(formData.stock || 0),
      stockVolume: wholeSaleVolumeValue ? Number(wholeSaleVolumeValue) : null,
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
      navigate("/");
    }
  };

  return (
    <div className="min-h-[60vh] bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Vendor dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Upload a new product</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Product title</label>
            <input name="title" value={formData.title} onChange={handleChange} required className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="Example: Nova Pro Smartphone" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Brand</label>
            <input name="brand" value={formData.brand} onChange={handleChange} required className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="Nova" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary">
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Product description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows="5" className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="Describe the product, key features, and benefits." />
          </div>

          {vendorType === "pharmacy" || vendorType === "agrovet" ? (
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">Prescription</label>
              <select name="prescription" value={formData.prescription} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary">
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

          {(vendorType === "retailshopvendor" || vendorType === "cardealer" || vendorType === "pharmacy" || vendorType === "agrovet") && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Whole sale price</label>
              <input type="number" min="0" step="0.01" name="wholeSalePrice" value={formData.wholeSalePrice} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="349.99" />
            </div>
          )}

          {(vendorType === "retailshopvendor" || vendorType === "cardealer" || vendorType === "pharmacy" || vendorType === "agrovet") && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Whole sale volume</label>
              <input type="number" min="0" name="wholeSaleVolume" value={formData.wholeSaleVolume} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="100" />
            </div>
          )}

          {(vendorType === "retailshopvendor" || vendorType === "cardealer" || vendorType === "pharmacy" || vendorType === "agrovet") && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Country</label>
              <input name="country" value={formData.country} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="Nigeria" />
            </div>
          )}

          {(vendorType === "realestate" || vendorType === "blackmarket") && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Country</label>
              <input name="country" value={formData.country} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="Nigeria" />
            </div>
          )}

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
            <button type="button" onClick={() => navigate('/')} className="rounded-md border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100">
              View customer page
            </button>
            <button type="button" onClick={() => navigate('/')} className="rounded-md border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorProductUpload;
