import { useAppSelector } from "../Store/hooks";
import { formatCurrency } from "../utils/currency";

const VendorFulfilledOrders = () => {
  const { orders, status, error } = useAppSelector((state) => state.orders);
  const fulfilledOrders = orders.filter((order) => ["delivering", "delivered"].includes(order.status));

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Order history</p>
        <h2 className="mt-1 text-2xl font-bold text-gray-900">Fulfilled orders</h2>
        <p className="mt-2 text-sm text-gray-600">Orders that have left your fulfillment queue.</p>
      </div>
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {status !== "loading" && !fulfilledOrders.length && !error && (
        <div className="rounded-md border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">No fulfilled orders yet.</div>
      )}
      <div className="space-y-4">
        {fulfilledOrders.map((order) => (
          <article key={order._id || order.id} className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 border-b border-gray-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Order ID</p>
                <h3 className="font-semibold text-gray-900">{order._id || order.id}</h3>
              </div>
              <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Fulfilled</span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              {order.items?.map((item) => (
                <div key={`${order._id || order.id}-${item._id || item.productId}`} className="flex justify-between gap-4">
                  <span>{item.title} x {item.quantity}</span>
                  <span className="font-medium">{formatCurrency(item.price * item.quantity, item.currency || order.currency)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-gray-100 pt-3 text-right font-semibold text-gray-900">Total: {formatCurrency(order.totalAmount, order.currency || order.items?.[0]?.currency)}</div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default VendorFulfilledOrders;
