import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { getAllProducts } from "../Store/thunk";
import { addToCart } from "../Store/cart/CartSlice";
import { formatCurrency } from "../utils/currency";
import CartCard from "../components/cart/CartCard";
import CartSummary from "../components/cart/CartSummary";

const SavedItems = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { products, status } = useAppSelector((state) => state.products);
  const { carts } = useAppSelector((state) => state.carts);
  const [savedIds, setSavedIds] = useState([]);
  const [savedVendors, setSavedVendors] = useState([]);

  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setSavedIds(JSON.parse(localStorage.getItem(`nova_saved_${user.uid}`) || "[]"));
      setSavedVendors(JSON.parse(localStorage.getItem(`nova_saved_vendors_${user.uid}`) || "[]"));
    }
  }, [user]);

  const savedProducts = products.filter((product) => savedIds.includes(product._id || product.id));
  const removeSaved = (productId) => {
    const nextSavedIds = savedIds.filter((id) => id !== productId);
    setSavedIds(nextSavedIds);
    localStorage.setItem(`nova_saved_${user.uid}`, JSON.stringify(nextSavedIds));
  };
  const removeSavedVendor = (vendorId) => {
    const nextSavedVendors = savedVendors.filter((vendor) => String(typeof vendor === "string" ? vendor : vendor.vendorId) !== String(vendorId));
    setSavedVendors(nextSavedVendors);
    localStorage.setItem(`nova_saved_vendors_${user.uid}`, JSON.stringify(nextSavedVendors));
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div><p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Customer account</p><h1 className="mt-2 text-3xl font-bold">Saved items &amp; cart</h1></div>
          <Link to="/customer" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Back to marketplace</Link>
        </div>
        <section className="mb-8" aria-labelledby="saved-vendors-heading">
          <h2 id="saved-vendors-heading" className="mb-4 text-xl font-bold">Saved vendors ({savedVendors.length})</h2>
          {!savedVendors.length && <p className="rounded-md bg-white p-6 text-gray-600">You have no saved vendors yet.</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedVendors.map((savedVendor) => {
              const vendorId = typeof savedVendor === "string" ? savedVendor : savedVendor.vendorId;
              const vendorProduct = products.find((product) => String(product.vendorId) === String(vendorId));
              const vendorName = (typeof savedVendor === "string" ? "" : savedVendor.vendorName) || vendorProduct?.vendorName || "Vendor shop";
              const vendorType = (typeof savedVendor === "string" ? "" : savedVendor.vendorType) || vendorProduct?.vendorType || "";
              const visitLabel = vendorType === "blackmarket" ? "Visit black market" : "Visit vendor shop";
              return <article key={vendorId} className="flex items-center justify-between gap-3 rounded-md bg-white p-4 shadow-sm"><div><h3 className="font-semibold">{vendorName}</h3><p className="mt-1 text-xs uppercase text-gray-500">{vendorType === "blackmarket" ? "Black market" : "Vendor"}</p></div><div className="flex shrink-0 gap-2"><Link to={`/shop/${encodeURIComponent(vendorId)}`} state={{ vendor: savedVendor }} className="rounded-md bg-primary px-3 py-2 text-sm text-white">{visitLabel}</Link><button type="button" onClick={() => removeSavedVendor(vendorId)} aria-label={`Remove ${vendorName} from saved vendors`} className="rounded-md border border-gray-300 px-3 py-2 text-sm">Remove</button></div></article>;
            })}
          </div>
        </section>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)]">
          <section aria-labelledby="saved-items-heading">
            <div className="mb-4 flex items-baseline justify-between"><h2 id="saved-items-heading" className="text-xl font-bold">Saved items ({savedProducts.length})</h2></div>
            {status === "loading" && <p>Loading saved items...</p>}
            {!savedProducts.length && status !== "loading" && <p className="rounded-md bg-white p-6 text-gray-600">You have no saved items yet.</p>}
            <div className="grid gap-5 sm:grid-cols-2">
              {savedProducts.map((product) => {
                const productId = product._id || product.id;
                return <article key={productId} className="rounded-md bg-white p-4 shadow-sm"><img src={product.images?.[0]} alt={product.title} className="h-44 w-full rounded-md object-cover" /><h3 className="mt-3 font-semibold capitalize">{product.title}</h3><p className="mt-1 font-medium">{formatCurrency(product.price, product.currency)}</p><div className="mt-3 flex gap-2"><button onClick={() => dispatch(addToCart({ product: { ...product, id: productId, price: product.price, priceType: "retail" }, quantity: 1 }))} className="flex-1 rounded-md bg-primary px-3 py-2 text-sm text-white">Add to cart</button><button onClick={() => removeSaved(productId)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">Remove</button></div></article>;
              })}
            </div>
          </section>
          <section aria-labelledby="cart-heading">
            <h2 id="cart-heading" className="mb-4 text-xl font-bold">Your cart ({carts.length})</h2>
            {carts.length ? <><CartCard /><CartSummary /></> : <div className="rounded-md bg-white p-6 text-gray-600"><p>Your cart is empty.</p><Link to="/customer" className="mt-3 inline-block font-semibold text-primary underline">Browse products</Link></div>}
          </section>
        </div>
      </section>
    </main>
  );
};

export default SavedItems;
