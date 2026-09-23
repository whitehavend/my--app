import { useEffect, useMemo, useState } from "react";
import { FiRefreshCw, FiSearch, FiTruck } from "react-icons/fi";
import { useAppSelector } from "../Store/hooks";

const apiBaseUrl = (process.env.REACT_APP_BASEURL || "http://localhost:5001/api").replace(/\/$/, "");
const tokenHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("unicorn_token") || ""}` });

const CollectionOfficerPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [logistics, setLogistics] = useState([]);
  const [orderQuery, setOrderQuery] = useState("");
  const [logisticQuery, setLogisticQuery] = useState("");
  const [selectedLogistics, setSelectedLogistics] = useState({});
  const [assigningOrder, setAssigningOrder] = useState("");
  const [assignmentMessage, setAssignmentMessage] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const loadData = async () => {
    setStatus("loading");
    try {
      const response = await fetch(`${apiBaseUrl}/orders/collection-officer`, { headers: tokenHeaders() });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load collection data");
      setOrders(body.orders || []);
      setLogistics(body.logistics || []);
      setError("");
      setStatus("success");
    } catch (loadError) {
      setError(loadError.message);
      setStatus("failed");
    }
  };

  useEffect(() => {
    loadData();
    const refreshTimer = setInterval(loadData, 10000);
    return () => clearInterval(refreshTimer);
  }, []);

  const assignLogistic = async (orderId) => {
    const logisticId = selectedLogistics[orderId];
    if (!logisticId) return;
    setAssigningOrder(orderId);
    setAssignmentMessage("");
    try {
      const response = await fetch(`${apiBaseUrl}/orders/collection-officer/${orderId}/assign-logistic`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...tokenHeaders() },
        body: JSON.stringify({ logisticId }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to assign logistic");
      setAssignmentMessage(`Order ${orderId} assigned successfully.`);
      setSelectedLogistics((current) => ({ ...current, [orderId]: "" }));
      await loadData();
    } catch (assignError) {
      setAssignmentMessage(assignError.message);
    } finally {
      setAssigningOrder("");
    }
  };

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const query = orderQuery.trim().toLowerCase();
    return !query || String(order._id || "").toLowerCase().includes(query);
  }), [orders, orderQuery]);

  const filteredLogistics = useMemo(() => logistics.filter((logistic) => {
    const query = logisticQuery.trim().toLowerCase();
    return !query || String(logistic.fullName || "").toLowerCase().includes(query);
  }), [logistics, logisticQuery]);

  return (
    <main className="min-h-screen bg-[#eef3f1] px-4 py-8 sm:px-6 lg:px-10">
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center" aria-hidden="true"><span className="-rotate-12 text-center text-4xl font-black uppercase tracking-[0.25em] text-slate-900/[0.04] sm:text-6xl">Collection officer official use only</span></div>
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[2rem] bg-[#123d3a] px-6 py-9 text-white shadow-xl sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-200">Collection operations</p>
          <div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-4xl font-black sm:text-5xl">Collection officer page</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/80">Search customer orders and coordinate with every available logistics partner from one workspace.</p>
            </div>
            <button type="button" onClick={loadData} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#123d3a] hover:bg-emerald-50"><FiRefreshCw />Refresh data</button>
          </div>
          <p className="mt-5 text-xs text-emerald-100/70">Signed in as {user?.displayName || user?.email}</p>
        </header>

        {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {assignmentMessage && <p className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{assignmentMessage}</p>}
        {status === "loading" && <p className="mt-6 rounded-xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm">Loading collection data...</p>}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Customer orders</p><h2 className="mt-1 text-2xl font-bold text-gray-900">Order lookup</h2></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">{filteredOrders.length} shown</span></div>
            <div className="relative mt-5"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={orderQuery} onChange={(event) => setOrderQuery(event.target.value)} placeholder="Search by order ID" className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-600" /></div>
            <div className="mt-5 space-y-3">{status !== "loading" && !filteredOrders.length && <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">No customer orders match this order ID.</p>}{filteredOrders.map((order) => <article key={order._id} className="rounded-xl border border-gray-100 p-4"><div className="flex flex-col justify-between gap-2 sm:flex-row"><div><p className="font-bold text-gray-900">Order {order._id}</p><p className="mt-1 text-sm text-gray-500">Customer: {order.customer?.fullName || order.customer?.email || "Customer details unavailable"}</p></div><span className="h-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">{order.status}</span></div><div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-3"><p>Total: {order.currency} {Number(order.totalAmount || 0).toLocaleString()}</p><p>Payment: <span className="capitalize">{String(order.paymentStatus || "not_required").replaceAll("_", " ")}</span></p><p>Items: {order.items?.reduce((total, item) => total + Number(item.quantity || 0), 0) || 0}</p></div><div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row"><select value={selectedLogistics[order._id] || ""} onChange={(event) => setSelectedLogistics((current) => ({ ...current, [order._id]: event.target.value }))} className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white p-3 text-sm"><option value="">Choose an available logistic</option>{filteredLogistics.map((logistic) => <option key={logistic._id} value={logistic._id}>{logistic.fullName} - {logistic.phoneNumber}</option>)}</select><button type="button" disabled={!selectedLogistics[order._id] || assigningOrder === order._id} onClick={() => assignLogistic(order._id)} className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">{assigningOrder === order._id ? "Assigning..." : "Assign logistic"}</button></div></article>)}</div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Live availability</p><h2 className="mt-1 text-2xl font-bold text-gray-900">Logistics</h2></div><FiTruck className="mt-1 text-2xl text-emerald-700" /></div>
            <div className="relative mt-5"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={logisticQuery} onChange={(event) => setLogisticQuery(event.target.value)} placeholder="Search by logistic name" className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-600" /></div>
            <div className="mt-5 space-y-3">{status !== "loading" && !filteredLogistics.length && <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">No available logistics match this name.</p>}{filteredLogistics.map((logistic) => <article key={logistic._id} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4"><div className="flex items-center justify-between gap-3"><p className="font-bold text-gray-900">{logistic.fullName || "Logistic partner"}</p><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" title="Available" /></div><p className="mt-2 text-sm text-gray-600">{logistic.countryCode} {logistic.phoneNumber}</p><p className="mt-1 text-xs text-gray-500">{logistic.email}</p></article>)}</div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default CollectionOfficerPage;
