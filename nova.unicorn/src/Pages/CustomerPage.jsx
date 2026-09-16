import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { getAllProducts } from "../Store/thunk";
import { addToCart } from "../Store/cart/CartSlice";
import { Link, useNavigate } from "react-router-dom";

const CustomerPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { products, status, error } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);
  const [search, setSearch] = useState("");
  const [savedItems, setSavedItems] = useState([]);

  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setSavedItems(JSON.parse(localStorage.getItem(`nova_saved_${user.uid}`) || "[]"));
    }
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
  };

  const handleAddToCart = (product) => {
    if (!requireCustomerLogin()) return;
    dispatch(addToCart({ product: { ...product, id: product._id || product.id, price: product.salePrice ?? product.price }, quantity: 1 }));
  };

  const visibleProducts = products.filter((product) => product.vendorId).filter((product) => {
    const query = search.toLowerCase().trim();
    return !query || [product.title, product.brand, product.category].some((value) => value?.toLowerCase().includes(query));
  });

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div><p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Customer marketplace</p><h1 className="mt-2 text-3xl font-bold">Shop vendor products</h1></div>
          <Link to="/cart" className="rounded-md bg-primary px-4 py-3 text-center text-sm font-medium text-white">View cart</Link>
        </div>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, brands, or categories" className="mb-6 w-full rounded-md border border-gray-300 bg-white p-4 outline-none focus:border-primary" />
        {status === "loading" && <p>Loading products...</p>}
        {error && <p className="text-red-600">{error}</p>}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <article key={product._id || product.id} className="overflow-hidden rounded-md bg-white shadow-sm">
              <img src={product.images?.[0]} alt={product.title} className="h-48 w-full object-cover" />
              <div className="p-4"><p className="text-xs uppercase text-gray-500">{product.brand} · {product.category}</p><h2 className="mt-2 text-lg font-semibold capitalize">{product.title}</h2><p className="mt-2 line-clamp-2 text-sm text-gray-600">{product.description}</p><p className="mt-3 text-xl font-bold">₦{Number(product.salePrice ?? product.price).toLocaleString()}</p><div className="mt-4 flex gap-2"><button onClick={() => handleSave(product._id || product.id)} className="flex-1 rounded-md border border-primary px-3 py-3 text-sm font-medium text-primary hover:bg-gray-50">{savedItems.includes(product._id || product.id) ? "Saved" : "Save item"}</button><button onClick={() => handleAddToCart(product)} className="flex-1 rounded-md bg-primary px-3 py-3 text-sm font-medium text-white hover:bg-primary100">Add to cart</button></div></div>
            </article>
          ))}
        </div>
        {!visibleProducts.length && status !== "loading" && <p className="rounded-md bg-white p-6 text-gray-600">No products match your search.</p>}
      </div>
    </main>
  );
};

export default CustomerPage;
