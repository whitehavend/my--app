import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { getVendorOrders } from "../Store/thunk";

const VendorOrders = () => {
  const dispatch = useAppDispatch();
  const { orders, status, error } = useAppSelector((state) => state.orders);

  useEffect(() => {
    dispatch(getVendorOrders());
  }, [dispatch]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Fulfillment queue</p>
        <h2 className="mt-1 text-2xl font-bold text-gray-900">Orders to fulfill</h2>
        <p className="mt-2 text-sm text-gray-600">Review orders containing your products and prepare them for delivery.</p>
      </div>
      {status === "loading" && <p className="text-gray-600">Loading fulfillment orders...</p>}
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {status !== "loading" && !orders.length && !error && (
        <div className="rounded-md border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">There are no orders to fulfill yet.</div>
      )}
      <div className="space-y-4">
        {orders.map((order) => (
          <article key={order._id || order.id} className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 border-b border-gray-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Order ID</p>
                <h3 className="font-semibold text-gray-900">{order._id || order.id}</h3>
              </div>
              <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-700">{order.status}</span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              {order.items?.map((item) => (
                <div key={`${order._id || order.id}-${item._id || item.productId}`} className="flex justify-between gap-4">
                  <span>{item.title} x {item.quantity}</span>
                  <span className="font-medium">₦{Number(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-gray-100 pt-3 text-right font-semibold text-gray-900">Total: ₦{Number(order.totalAmount || 0).toFixed(2)}</div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default VendorOrders;
