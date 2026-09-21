import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { getAvailableLogistics, getVendorLogisticRequests, getVendorOrders, removeLogisticRequest, requestLogistic } from "../Store/thunk";

const VendorLogisticPanel = () => {
  const dispatch = useAppDispatch();
  const { logistics, vendorRequests, status, error } = useAppSelector((state) => state.logistics);
  const { orders } = useAppSelector((state) => state.orders);
  const [selectedOrderId, setSelectedOrderId] = useState("");

  useEffect(() => {
    const refreshAvailableLogistics = () => {
      dispatch(getAvailableLogistics());
      dispatch(getVendorLogisticRequests());
      dispatch(getVendorOrders());
    };
    refreshAvailableLogistics();
    const refreshTimer = setInterval(refreshAvailableLogistics, 5000);

    return () => clearInterval(refreshTimer);
  }, [dispatch]);

  const handleRequest = async (logisticId) => {
    const result = await dispatch(requestLogistic({ logisticId, orderId: selectedOrderId }));
    if (requestLogistic.fulfilled.match(result)) {
      dispatch(getAvailableLogistics());
      dispatch(getVendorLogisticRequests());
    }
  };

  const handleRemove = async (request) => {
    const result = await dispatch(removeLogisticRequest({ logisticId: request.logisticId, requestId: request._id }));
    if (removeLogisticRequest.fulfilled.match(result)) dispatch(getAvailableLogistics());
  };

  const requestForLogistic = (logisticId) => vendorRequests.find((request) => request.logisticId === logisticId);

  return (
    <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Pickup coordination</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">Available logistics</h2>
        <p className="mt-2 text-sm text-slate-600">Request an available logistic partner to collect your prepared items.</p>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Order to collect
          <select value={selectedOrderId} onChange={(event) => setSelectedOrderId(event.target.value)} className="mt-1 w-full rounded-md border border-emerald-200 bg-white p-2 text-sm md:max-w-xl">
            <option value="">Select an active order</option>
            {orders.filter((order) => ["pending", "delivering"].includes(order.status)).map((order) => (
              <option key={order._id || order.id} value={order._id || order.id}>Order {(order._id || order.id).slice(-8)} - {order.status}</option>
            ))}
          </select>
        </label>
        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {status !== "loading" && !logistics.length && !error && <p className="mt-4 text-sm text-slate-600">No logistics are currently available.</p>}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {logistics.map((logistic) => (
            <article key={logistic.id || logistic.uid} className="rounded-xl border border-emerald-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">{logistic.fullName || "Logistic partner"}</h3>
              <p className="mt-1 text-sm text-slate-600">Phone: {logistic.countryCode} {logistic.phoneNumber}</p>
              {requestForLogistic(logistic.id || logistic.uid) ? (
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold capitalize text-amber-700">{(requestForLogistic(logistic.id || logistic.uid).status || "pending").replace("_", " ")}</span>
                  <button type="button" onClick={() => handleRemove(requestForLogistic(logistic.id || logistic.uid))} className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Remove</button>
                </div>
              ) : (
                <button type="button" disabled={!selectedOrderId} onClick={() => handleRequest(logistic.id || logistic.uid)} className="mt-3 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
                  Request pickup
                </button>
              )}
            </article>
          ))}
        </div>
        {vendorRequests.some((request) => request.status === "rejected") && (
          <div className="mt-5 border-t border-emerald-200 pt-4">
            <h3 className="font-semibold text-slate-900">Request updates</h3>
            {vendorRequests.filter((request) => request.status === "rejected").map((request) => (
              <div key={request._id} className="mt-2 flex items-center justify-between gap-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
                <span>{request.logisticName || "Logistic partner"} rejected your pickup request.</span>
                <button type="button" onClick={() => handleRemove(request)} className="rounded-md border border-red-200 px-3 py-1 font-semibold hover:bg-white">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default VendorLogisticPanel;
