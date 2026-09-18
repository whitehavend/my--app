import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { createProduct } from "../Store/thunk";

const defaultForm = {
  title: "",
  brand: "",
  category: "smartphones",
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
  wholesalePrice: "",
  basePrice: "",
  prescription: "",
  country: "",
  location: "",
  contactInfo: "",
  massVolume: "",
};

const VendorProductUpload = ({ vendorType = "retailshopvendor" }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { productStatus, productError } = useAppSelector((state) => state.products);
  const [formData, setFormData] = useState(defaultForm);

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

    const payload = {
      ...formData,
      title: formData.title || formData.brand || "Vendor listing",
      price: formData.basePrice ? Number(formData.basePrice) : Number(formData.price || 0),
      salePrice: formData.wholesalePrice ? Number(formData.wholesalePrice) : (formData.salePrice === "" ? null : Number(formData.salePrice)),
      compareAtPrice: formData.compareAtPrice === "" ? null : Number(formData.compareAtPrice),
      stock: formData.stockVolume ? Number(formData.stockVolume) : Number(formData.stock || 0),
      weight: formData.massVolume === "" ? 0 : Number(formData.massVolume),
      images: (formData.images || "")
        .split(",")
        .map((image) => image.trim())
        .filter(Boolean),
      country: formData.country,
      location: formData.location,
      contactInfo: formData.contactInfo,
      vendorType,
    };

    const resultAction = await dispatch(createProduct(payload));

    if (createProduct.fulfilled.match(resultAction)) {
      setFormData(defaultForm);
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
            <select name="category" value={formData.category} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary">
              <option value="smartphones">Smartphones</option>
              <option value="laptops">Laptops</option>
              <option value="gaming">Gaming</option>
              <option value="accessories">Accessories</option>
              <option value="appliances">Appliances</option>
              <option value="fashion">Fashion</option>
              <option value="electronics-and-gadgets">Electronics and gadgets</option>
              <option value="home-and-lifestyle">Home and lifestyle</option>
              <option value="groceries">Groceries</option>
              <option value="beauty">Beauty</option>
              <option value="automobile-parts">Automobile parts</option>
              <option value="books-and-games">Books and games</option>
              <option value="baby-products">Baby products</option>
              <option value="passenger-and-light-vehicles">Passenger and light vehicles</option>
              <option value="heavy-vehicles">Heavy vehicles</option>
              <option value="land">Land</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industry">Industry</option>
              <option value="pom">POM</option>
              <option value="otc">OTC</option>
              <option value="therapeutic">Therapeutic</option>
              <option value="animals">Animals</option>
              <option value="crops">Crops</option>
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

          {(vendorType === "cardealer" || vendorType === "pharmacy" || vendorType === "agrovet") && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Wholesale price</label>
              <input type="number" min="0" step="0.01" name="wholesalePrice" value={formData.wholesalePrice} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="349.99" />
            </div>
          )}

          {(vendorType === "cardealer" || vendorType === "pharmacy" || vendorType === "agrovet") && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Stock volume</label>
              <input type="number" min="0" name="stockVolume" value={formData.stockVolume} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="100" />
            </div>
          )}

          {(vendorType === "cardealer" || vendorType === "pharmacy" || vendorType === "agrovet") && (
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
            <label className="mb-2 block text-sm font-medium text-gray-700">Image URLs</label>
            <textarea name="images" value={formData.images} onChange={handleChange} rows="3" className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="https://example.com/1.png, https://example.com/2.png" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Price details</label>
            <input name="priceDetails" value={formData.priceDetails} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-primary" placeholder="Inclusive of VAT or free shipping over $50" />
          </div>

          {productError && (
            <div className="md:col-span-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{productError}</div>
          )}

          <div className="md:col-span-2 flex gap-3">
            <button type="submit" disabled={productStatus === 'loading'} className="rounded-md bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary100 disabled:cursor-not-allowed disabled:opacity-70">
              {productStatus === 'loading' ? 'Uploading...' : 'Upload product'}
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
