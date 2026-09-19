import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { deleteVendorProduct, getVendorProducts } from "../Store/thunk";
import { formatCurrency } from "../utils/currency";

const VendorProducts = () => {
  const dispatch = useAppDispatch();
  const { products, status, error } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(getVendorProducts());
  }, [dispatch]);

  const handleDelete = async (productId) => {
    const confirmed = window.confirm("Are you sure you want to delete this uploaded product?");
    if (!confirmed) return;

    const resultAction = await dispatch(deleteVendorProduct(productId));
    if (deleteVendorProduct.fulfilled.match(resultAction)) {
      dispatch(getVendorProducts());
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Product history</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">Uploaded products</h2>
        </div>
        <Link to="/vendor/products/new" className="inline-flex w-fit rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary100">
          Upload new product
        </Link>
      </div>

      {status === "loading" && <p className="text-gray-600">Loading your products...</p>}
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {status !== "loading" && !products.length && !error && (
        <div className="rounded-md border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          You have not uploaded any products yet.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article key={product._id || product.id} className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
            {product.images?.[0] ? <img src={product.images[0]} alt={product.title} className="h-40 w-full object-cover" /> : <div className="flex h-40 items-center justify-center bg-gray-100 text-sm text-gray-500">No product image</div>}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">{product.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{product.brand} · {product.category}</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-primary">{formatCurrency(product.salePrice ?? product.price ?? 0, product.currency)}</span>
                <span className="text-gray-500">{product.stock} in stock</span>
              </div>
              <p className="mt-2 text-xs text-gray-500">Uploaded {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "recently"}</p>
              <button
                type="button"
                onClick={() => handleDelete(product._id || product.id)}
                className="mt-4 w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
              >
                Delete item
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default VendorProducts;
