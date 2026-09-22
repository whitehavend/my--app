import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiClock, FiFileText, FiRefreshCw, FiSearch, FiShield, FiXCircle } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { approveVendor, getPendingVendors, rejectVendor } from "../Store/thunk";

const isLocalRuntime = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
const complianceApiBase = process.env.REACT_APP_VENDOR_VERIFICATION_API || (isLocalRuntime ? "http://localhost:5000/api/vendors" : "https://my-app-1-ggdw.onrender.com/api/vendors");
const manualChecks = [
  { key: "businessDocumentation", apiKey: "businessDocument", label: "Business documents" },
  { key: "professionalLicenseVerification", apiKey: "professionalLicense", label: "Professional license" },
  { key: "premisesLicenseVerification", apiKey: "premisesDoc", label: "Premises compliance" },
  { key: "payoutDetails", apiKey: "payoutDetails", label: "Payout details" },
];
const statusClass = { VERIFIED: "bg-emerald-100 text-emerald-700", PENDING: "bg-amber-100 text-amber-700", FAILED: "bg-red-100 text-red-700" };
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("unicorn_token") || ""}` });

const AdminVendors = () => {
  const dispatch = useAppDispatch();
  const { pendingVendors, pendingStatus, user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("approvals");
  const [complianceVendors, setComplianceVendors] = useState([]);
  const [complianceStatus, setComplianceStatus] = useState("idle");
  const [complianceError, setComplianceError] = useState("");
  const [query, setQuery] = useState("");
  const [reviewing, setReviewing] = useState("");

  const loadComplianceVendors = async () => {
    setComplianceStatus("loading");
    setComplianceError("");
    try {
      const response = await fetch(complianceApiBase, { headers: authHeaders() });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load manual verification queue");
      setComplianceVendors(body.vendors || []);
      setComplianceStatus("success");
    } catch (error) {
      setComplianceStatus("failed");
      setComplianceError(error.message);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      dispatch(getPendingVendors());
      loadComplianceVendors();
    }
  }, [dispatch, user]);

  const handleApprove = async (vendorId) => { await dispatch(approveVendor(vendorId)); dispatch(getPendingVendors()); };
  const handleReject = async (vendorId) => {
    const reason = window.prompt("Why is this vendor being rejected?", "Verification documents were not accepted");
    if (reason === null) return;
    await dispatch(rejectVendor({ vendorId, reason }));
    dispatch(getPendingVendors());
  };

  const reviewDocument = async (vendor, check, status) => {
    const reason = status === "FAILED" ? window.prompt("Reason for rejecting this document", "Document was not accepted") : "";
    if (status === "FAILED" && reason === null) return;
    const reviewId = `${vendor._id}-${check.key}`;
    setReviewing(reviewId);
    try {
      const response = await fetch(`${complianceApiBase}/${vendor._id}/review`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ check: check.apiKey, status, reason: reason || "" }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to update document review");
      setComplianceVendors((current) => current.map((item) => item._id === vendor._id ? body.vendor : item));
    } catch (error) { window.alert(error.message); } finally { setReviewing(""); }
  };

  const filteredComplianceVendors = useMemo(() => complianceVendors.filter((vendor) => `${vendor.businessName} ${vendor.email} ${vendor.vendorType}`.toLowerCase().includes(query.toLowerCase())), [complianceVendors, query]);
  const pendingDocuments = complianceVendors.reduce((total, vendor) => total + manualChecks.filter(({ key }) => vendor[key]?.status === "PENDING").length, 0);

  if (!user || user.role !== "admin") return <div className="flex min-h-[60vh] items-center justify-center px-6 py-10"><div className="max-w-md text-center"><h1 className="mb-2 text-2xl font-bold">Access required</h1><p className="text-gray-600">An administrator account is required to view vendor operations.</p></div></div>;

  return (
    <main className="min-h-screen bg-[#eef3f1] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#123d3a] px-6 py-8 text-white shadow-xl sm:px-10 sm:py-10"><div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[36px] border-emerald-300/20" /><div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Nova operations desk</p><h1 className="max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">Trust, reviewed with care.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-emerald-50/75">One calm workspace for approving sellers, reviewing documents, and keeping every verification decision visible.</p></div><div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur"><span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />Admin workspace online</div></div></section>
        <section className="mt-6 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-white p-5 shadow-sm"><FiClock className="text-amber-600" /><p className="mt-5 text-sm text-gray-500">Account approvals</p><strong className="text-3xl text-gray-900">{pendingVendors.length}</strong><p className="text-xs text-gray-500">Waiting for a decision</p></div><div className="rounded-2xl bg-white p-5 shadow-sm"><FiFileText className="text-blue-600" /><p className="mt-5 text-sm text-gray-500">Manual documents</p><strong className="text-3xl text-gray-900">{pendingDocuments}</strong><p className="text-xs text-gray-500">Need team review</p></div><div className="rounded-2xl bg-white p-5 shadow-sm"><FiShield className="text-emerald-600" /><p className="mt-5 text-sm text-gray-500">Verification files</p><strong className="text-3xl text-gray-900">{complianceVendors.length}</strong><p className="text-xs text-gray-500">Submitted vendor records</p></div></section>
        <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm sm:p-6"><div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Review centre</p><h2 className="mt-1 text-2xl font-bold text-gray-900">Admin operations</h2></div><button type="button" onClick={() => { dispatch(getPendingVendors()); loadComplianceVendors(); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"><FiRefreshCw />Refresh queue</button></div><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => setActiveTab("approvals")} className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeTab === "approvals" ? "bg-[#123d3a] text-white" : "bg-gray-100 text-gray-600"}`}>Account approvals <span className="ml-1 opacity-70">{pendingVendors.length}</span></button><button type="button" onClick={() => setActiveTab("manual")} className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeTab === "manual" ? "bg-[#123d3a] text-white" : "bg-gray-100 text-gray-600"}`}>Manual verification <span className="ml-1 opacity-70">{pendingDocuments}</span></button></div>
          {activeTab === "approvals" ? <div className="mt-5 space-y-3">{pendingStatus === "loading" ? <p className="py-10 text-center text-gray-500">Loading account approvals...</p> : pendingVendors.length === 0 ? <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-500">No account approvals are waiting.</p> : pendingVendors.map((vendor) => <div key={vendor.id || vendor._id} className="flex flex-col gap-4 rounded-2xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-gray-900">{vendor.shopName || vendor.businessName || "Unnamed business"}</p><p className="mt-1 text-sm text-gray-500">{vendor.fullName} · {vendor.email}</p><span className="mt-2 inline-block rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Awaiting approval</span></div><div className="flex gap-2"><button type="button" onClick={() => handleApprove(vendor.id || vendor._id)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"><FiCheckCircle />Approve</button><button type="button" onClick={() => handleReject(vendor.id || vendor._id)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"><FiXCircle />Reject</button></div></div>)}</div> : <div className="mt-5"><div className="relative mb-5 max-w-md"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search business, email, or category" className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-600" /></div>{complianceError && <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{complianceError}</p>}{complianceStatus === "loading" ? <p className="py-10 text-center text-gray-500">Loading manual verification files...</p> : filteredComplianceVendors.length === 0 ? <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-500">No manual verification files match your search.</p> : <div className="space-y-4">{filteredComplianceVendors.map((vendor) => <div key={vendor._id} className="rounded-2xl border border-gray-100 p-5"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-bold text-gray-900">{vendor.businessName}</p><p className="text-sm text-gray-500">{vendor.email} · {vendor.vendorType}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Verification file</span></div><div className="mt-4 grid gap-3 md:grid-cols-3">{manualChecks.filter(({ key }) => vendor[key]).map((check) => { const item = vendor[check.key]; const reviewId = `${vendor._id}-${check.key}`; return <div key={check.key} className="rounded-xl bg-gray-50 p-3"><div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold text-gray-800">{check.label}</p><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusClass[item.status] || statusClass.PENDING}`}>{item.status}</span></div><p className="mt-2 truncate text-xs text-gray-500">{item.referenceId || "No file reference"}</p>{item.status === "PENDING" && <div className="mt-3 flex gap-2"><button type="button" disabled={reviewing === reviewId} onClick={() => reviewDocument(vendor, check, "VERIFIED")} className="flex-1 rounded-lg bg-emerald-700 px-2 py-2 text-xs font-semibold text-white disabled:opacity-50">Approve</button><button type="button" disabled={reviewing === reviewId} onClick={() => reviewDocument(vendor, check, "FAILED")} className="flex-1 rounded-lg border border-red-200 px-2 py-2 text-xs font-semibold text-red-700 disabled:opacity-50">Reject</button></div>}</div>; })}</div></div>)}</div>}</div>}
        </section>
      </div>
    </main>
  );
};

export default AdminVendors;
