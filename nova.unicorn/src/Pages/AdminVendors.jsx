import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiClock, FiFileText, FiRefreshCw, FiSearch, FiShield, FiXCircle } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { approveVendor, getPendingVendors, rejectVendor } from "../Store/thunk";

const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const apiBase = process.env.REACT_APP_VENDOR_VERIFICATION_API || (isLocal ? "http://localhost:5000/api/vendors" : "https://my-app-1-ggdw.onrender.com/api/vendors");
const checks = [
  { key: "professionalLicenseVerification", apiKey: "professionalLicense", label: "Professional license" },
  { key: "premisesLicenseVerification", apiKey: "premisesDoc", label: "Premises compliance" },
  { key: "payoutDetails", apiKey: "payoutDetails", label: "Payout details" },
];
const statusStyles = { VERIFIED: "bg-emerald-100 text-emerald-700", PENDING: "bg-amber-100 text-amber-700", FAILED: "bg-red-100 text-red-700" };
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("unicorn_token") || ""}` });

const AdminVendors = () => {
  const dispatch = useAppDispatch();
  const { pendingVendors, pendingStatus, user } = useAppSelector((state) => state.auth);
  const [tab, setTab] = useState("approvals");
  const [vendors, setVendors] = useState([]);
  const [queueStatus, setQueueStatus] = useState("idle");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [reviewing, setReviewing] = useState("");

  const loadQueue = async () => {
    setQueueStatus("loading");
    try {
      const response = await fetch(apiBase, { headers: headers() });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load verification queue");
      setVendors(body.vendors || []);
      setQueueStatus("success");
      setError("");
    } catch (loadError) {
      setQueueStatus("failed");
      setError(loadError.message);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      dispatch(getPendingVendors());
      loadQueue();
    }
  }, [dispatch, user]);

  const sortedVendors = useMemo(() => vendors
    .filter((vendor) => `${vendor.businessName} ${vendor.email} ${vendor.vendorType}`.toLowerCase().includes(query.toLowerCase()))
    .sort((first, second) => {
      const attention = (vendor) => checks.filter(({ key }) => ["PENDING", "FAILED"].includes(vendor[key]?.status)).length;
      return attention(second) - attention(first);
    }), [vendors, query]);

  const pendingDocuments = vendors.reduce((count, vendor) => count + checks.filter(({ key }) => vendor[key]?.status === "PENDING").length, 0);

  const review = async (vendor, check, status) => {
    const reason = status === "FAILED" ? window.prompt("Reason for rejecting this document", "Document was not accepted") : "";
    if (status === "FAILED" && reason === null) return;
    const id = `${vendor._id}-${check.key}`;
    setReviewing(id);
    try {
      const response = await fetch(`${apiBase}/${vendor._id}/review`, { method: "PATCH", headers: { "Content-Type": "application/json", ...headers() }, body: JSON.stringify({ check: check.apiKey, status, reason: reason || "" }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to update review");
      setVendors((current) => current.map((item) => item._id === vendor._id ? body.vendor : item));
      setSelectedVendor(body.vendor);
    } catch (reviewError) {
      window.alert(reviewError.message);
    } finally {
      setReviewing("");
    }
  };

  if (!user || user.role !== "admin") return <div className="flex min-h-[60vh] items-center justify-center px-6"><div className="text-center"><h1 className="text-2xl font-bold">Access required</h1><p className="mt-2 text-gray-600">An administrator account is required.</p></div></div>;

  return <main className="min-h-screen bg-[#eef3f1] px-4 py-8 sm:px-6 lg:px-10"><div className="mx-auto max-w-7xl">
    <section className="relative overflow-hidden rounded-[2rem] bg-[#123d3a] px-6 py-9 text-white shadow-xl sm:px-10"><div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[36px] border-emerald-300/20" /><p className="relative text-xs font-bold uppercase tracking-[0.3em] text-emerald-200">Nova operations desk</p><h1 className="relative mt-3 max-w-2xl text-4xl font-black sm:text-5xl">Trust, reviewed with care.</h1><p className="relative mt-4 max-w-xl text-sm leading-6 text-emerald-50/75">Approve sellers, inspect submitted evidence, and keep every verification decision visible.</p></section>
    <section className="mt-6 grid gap-4 sm:grid-cols-3"><Metric icon={<FiClock />} label="Account approvals" value={pendingVendors.length} note="Waiting for a decision" /><Metric icon={<FiFileText />} label="Manual documents" value={pendingDocuments} note="Need team review" /><Metric icon={<FiShield />} label="Verification files" value={vendors.length} note="Submitted vendor records" /></section>
    <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm sm:p-6"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Review centre</p><h2 className="mt-1 text-2xl font-bold text-gray-900">Admin operations</h2></div><button type="button" onClick={() => { dispatch(getPendingVendors()); loadQueue(); }} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"><FiRefreshCw />Refresh queue</button></div><div className="mt-5 flex flex-wrap gap-2"><Tab active={tab === "approvals"} onClick={() => setTab("approvals")}>Account approvals {pendingVendors.length}</Tab><Tab active={tab === "manual"} onClick={() => setTab("manual")}>Manual verification {pendingDocuments}</Tab></div>
      {tab === "approvals" ? <div className="mt-5 space-y-3">{pendingStatus === "loading" ? <Loading /> : pendingVendors.length === 0 ? <Empty text="No account approvals are waiting." /> : pendingVendors.map((vendor) => <div key={vendor.id || vendor._id} className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 p-4 sm:flex-row sm:items-center"><div><p className="font-bold text-gray-900">{vendor.shopName || vendor.businessName || "Unnamed business"}</p><p className="mt-1 text-sm text-gray-500">{vendor.fullName} · {vendor.email}</p><span className="mt-2 inline-block rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">Awaiting approval</span></div><div className="flex gap-2"><button type="button" onClick={() => dispatch(approveVendor(vendor.id || vendor._id))} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white"><FiCheckCircle />Approve</button><button type="button" onClick={() => { const reason = window.prompt("Why is this vendor being rejected?", "Verification documents were not accepted"); if (reason !== null) dispatch(rejectVendor({ vendorId: vendor.id || vendor._id, reason })); }} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-700"><FiXCircle />Reject</button></div></div>)}</div> : <div className="mt-5"><div className="relative mb-5 max-w-md"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search business, email, or category" className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-600" /></div>{error && <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}{queueStatus === "loading" ? <Loading /> : sortedVendors.length === 0 ? <Empty text="No manual verification files match your search." /> : <div className="space-y-4">{sortedVendors.map((vendor) => <button type="button" key={vendor._id} onClick={() => setSelectedVendor(vendor)} className="block w-full rounded-2xl border border-gray-100 p-5 text-left transition hover:border-emerald-300 hover:shadow-md"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start"><div><p className="font-bold text-gray-900">{vendor.businessName}</p><p className="text-sm text-gray-500">{vendor.email} · {vendor.vendorType}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Click to view documents</span></div><div className="mt-4 flex flex-wrap gap-2">{checks.filter(({ key }) => vendor[key]).map((check) => <span key={check.key} className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[vendor[check.key].status] || statusStyles.PENDING}`}>{check.label}: {vendor[check.key].status}</span>)}</div></button>)}</div>}</div>}
    </section>
    {selectedVendor && <DocumentModal vendor={selectedVendor} onClose={() => setSelectedVendor(null)} onReview={review} reviewing={reviewing} />}
  </div></main>;
};

const Metric = ({ icon, label, value, note }) => <div className="rounded-2xl bg-white p-5 shadow-sm"><span className="text-emerald-700">{icon}</span><p className="mt-4 text-sm text-gray-500">{label}</p><strong className="text-3xl text-gray-900">{value}</strong><p className="text-xs text-gray-500">{note}</p></div>;
const Tab = ({ active, onClick, children }) => <button type="button" onClick={onClick} className={`rounded-xl px-4 py-2 text-sm font-bold ${active ? "bg-[#123d3a] text-white" : "bg-gray-100 text-gray-600"}`}>{children}</button>;
const Loading = () => <p className="py-10 text-center text-gray-500">Loading queue...</p>;
const Empty = ({ text }) => <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-500">{text}</p>;
const DocumentModal = ({ vendor, onClose, onReview, reviewing }) => <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#123d3a]/60 p-4"><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Submitted verification file</p><h2 className="mt-1 text-2xl font-bold text-gray-900">{vendor.businessName}</h2><p className="text-sm text-gray-500">{vendor.email} · {vendor.vendorType}</p></div><button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-600">Close</button></div><div className="mt-6 space-y-3">{checks.filter(({ key }) => vendor[key]).map((check) => { const item = vendor[check.key]; const id = `${vendor._id}-${check.key}`; return <div key={check.key} className="rounded-2xl border border-gray-100 bg-gray-50 p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="font-bold text-gray-900">{check.label}</p><p className="mt-1 text-xs text-gray-500">{item.errorMessage || "Submitted for review"}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[item.status] || statusStyles.PENDING}`}>{item.status}</span></div>{item.filePath ? <a href={item.filePath} target="_blank" rel="noreferrer" className="mt-3 inline-block rounded-lg bg-[#123d3a] px-3 py-2 text-xs font-bold text-white">Open submitted document</a> : <p className="mt-3 text-xs text-gray-500">No document URL stored. Review the submitted payout details above.</p>}{item.status === "PENDING" && <div className="mt-3 flex gap-2"><button type="button" disabled={reviewing === id} onClick={() => onReview(vendor, check, "VERIFIED")} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white">Approve</button><button type="button" disabled={reviewing === id} onClick={() => onReview(vendor, check, "FAILED")} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700">Reject</button></div>}</div>; })}</div></div></div>;

export default AdminVendors;
