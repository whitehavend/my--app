import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { getAllProducts } from "../Store/thunk";
import { addToCart } from "../Store/cart/CartSlice";

const SavedItems = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { products, status } = useAppSelector((state) => state.products);
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setSavedIds(JSON.parse(localStorage.getItem(`nova_saved_${user.uid}`) || "[]"));
    }
  }, [user]);

  const savedProducts = products.filter((product) => savedIds.includes(product._id || product.id));
  const removeSaved = (productId) => {
    const nextSavedIds = savedIds.filter((id) => id !== productId);
    setSavedIds(nextSavedIds);
    localStorage.setItem(`nova_saved_${user.uid}`, JSON.stringify(nextSavedIds));
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div><p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Customer account</p><h1 className="mt-2 text-3xl font-bold">Saved items ({savedProducts.length})</h1></div>
          <Link to="/customer" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Back to marketplace</Link>
        </div>
        {status === "loading" && <p>Loading saved items...</p>}
        {!savedProducts.length && status !== "loading" && <p className="rounded-md bg-white p-6 text-gray-600">You have no saved items yet.</p>}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {savedProducts.map((product) => {
            const productId = product._id || product.id;
            return <article key={productId} className="rounded-md bg-white p-4 shadow-sm"><img src={product.images?.[0]} alt={product.title} className="h-44 w-full rounded-md object-cover" /><h2 className="mt-3 font-semibold capitalize">{product.title}</h2><p className="mt-1 font-medium">₦{Number(product.salePrice ?? product.price).toLocaleString()}</p><div className="mt-3 flex gap-2"><button onClick={() => dispatch(addToCart({ product: { ...product, id: productId, price: product.salePrice ?? product.price }, quantity: 1 }))} className="flex-1 rounded-md bg-primary px-3 py-2 text-sm text-white">Add to cart</button><button onClick={() => removeSaved(productId)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">Remove</button></div></article>;
          })}
        </div>
      </section>
    </main>
  );
};

export default SavedItems;
