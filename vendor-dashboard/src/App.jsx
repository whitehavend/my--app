import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronRight,
  CircleAlert,
  FileCheck2,
  FileUp,
  Fingerprint,
  Landmark,
  LayoutDashboard,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  UploadCloud,
  WalletCards,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/vendors";
const industryOptions = [
  { value: "RETAIL", label: "Retail merchant", description: "Shops, marketplaces, and general trade", icon: Store },
  { value: "HEALTH_AGRO", label: "Health & agrovet", description: "Pharmacy, veterinary, and agricultural care", icon: Activity },
  { value: "REAL_ESTATE_CAR", label: "Property & automotive", description: "Dealerships, property, and asset sales", icon: Building2 },
];

const emptyForm = {
  vendorType: "HEALTH_AGRO",
  email: "",
  phoneNumber: "",
  businessName: "",
  firstName: "",
  lastName: "",
  idNumber: "",
  kraPin: "",
  businessDoc: null,
  profLicense: null,
  premisesDoc: null,
};

const initialVendorType = new URLSearchParams(window.location.search).get("vendorType");

const trackMap = {
  kycVerification: "KYC identity",
  financialGatewayVerification: "M-Pesa gateway",
  kraPinVerification: "KRA PIN",
  businessDocumentation: "Business documents",
  professionalLicenseVerification: "Professional license",
  premisesLicenseVerification: "Premises license",
};

const verificationChecklist = {
  RETAIL: [
    { key: "kyc", label: "KYC verification", mode: "auto", required: true },
    { key: "kra", label: "KRA tax details", mode: "auto", required: true },
    { key: "businessDocument", label: "Business registration document", mode: "manual", required: true },
    { key: "settlement", label: "Financial settlement info", mode: "manual", required: true },
  ],
  HEALTH_AGRO: [
    { key: "kyc", label: "KYC verification", mode: "auto", required: true },
    { key: "kra", label: "KRA tax details", mode: "auto", required: true },
    { key: "financialGateway", label: "Financial gateway validation", mode: "auto", required: true },
    { key: "professionalLicense", label: "Professional license", mode: "manual", required: true },
    { key: "premisesDoc", label: "Premises compliance", mode: "manual", required: true },
    { key: "settlement", label: "Financial settlement info", mode: "manual", required: true },
  ],
  REAL_ESTATE_CAR: [
    { key: "kyc", label: "KYC verification", mode: "auto", required: true },
  ],
};

const statusTone = {
  VERIFIED: "verified",
  PENDING: "pending",
  FAILED: "failed",
};

function StatusChip({ status }) {
  const normalizedStatus = status || "PENDING";
  return <span className={`status-chip ${statusTone[normalizedStatus] || "pending"}`}><span className="status-dot" />{normalizedStatus}</span>;
}

function DropZone({ name, label, hint, accept, file, onChange }) {
  return (
    <label className={`drop-zone ${file ? "has-file" : ""}`}>
      <input type="file" name={name} accept={accept} onChange={(event) => onChange(event.target.files?.[0] || null)} />
      <span className="drop-icon"><UploadCloud size={18} /></span>
      <span className="drop-copy"><strong>{file?.name || label}</strong><small>{file ? `${Math.ceil(file.size / 1024)} KB ready` : hint}</small></span>
      <FileUp size={18} className="drop-arrow" />
    </label>
  );
}

function TrackList({ vendor }) {
  const tracks = Object.entries(trackMap).filter(([key]) => vendor[key]);
  return <div className="track-list">{tracks.map(([key, label]) => <div className="track-row" key={key}><span>{label}</span><StatusChip status={vendor[key]?.status} /></div>)}</div>;
}

function VerificationHub({ vendor, onBack }) {
  const checks = verificationChecklist[vendor?.vendorType] || verificationChecklist.RETAIL;
  const [uploadState, setUploadState] = useState({});

  const submitCheck = async (checkKey, file) => {
    if (!vendor?._id) return;
    const payload = { idNumber: "12345678", idType: "KENYA_NATIONAL_ID", firstName: "Vendor", lastName: "Applicant" };

    try {
      if (checkKey === "kyc") {
        const response = await fetch(`${API_BASE}/${vendor._id}/verify-kyc`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "KYC verification failed");
      }

      if (checkKey === "kra") {
        const response = await fetch(`${API_BASE}/${vendor._id}/verify-tax`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kraPin: "A123456789X" }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "KRA verification failed");
      }

      if (checkKey === "financialGateway") {
        const response = await fetch(`${API_BASE}/${vendor._id}/verify-financial`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: 1 }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Financial verification failed");
      }

      if (checkKey === "businessDocument" || checkKey === "professionalLicense" || checkKey === "premisesDoc") {
        const formData = new FormData();
        if (checkKey === "businessDocument") formData.append("businessDoc", file || new Blob(["business document"], { type: "application/octet-stream" }));
        if (checkKey === "professionalLicense") formData.append("profLicense", file || new Blob(["professional license"], { type: "application/octet-stream" }));
        if (checkKey === "premisesDoc") formData.append("premisesDoc", file || new Blob(["premises doc"], { type: "application/octet-stream" }));

        const endpoint = checkKey === "businessDocument" ? "verify-documents" : "verify-professional";
        const response = await fetch(`${API_BASE}/${vendor._id}/${endpoint}`, { method: "POST", body: formData });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Document verification failed");
      }

      setUploadState((current) => ({ ...current, [checkKey]: { status: "submitted", message: "Submitted to verification queue" } }));
    } catch (error) {
      setUploadState((current) => ({ ...current, [checkKey]: { status: "error", message: error.message } }));
    }
  };

  return (
    <section className="workspace-grid">
      <div className="form-column">
        <div className="section-kicker">02 / Verification hub</div>
        <h2>Complete your vendor checks</h2>
        <p className="section-intro">Some checks are auto-validated immediately. Others are reviewed by our compliance team before approval.</p>

        {checks.map((check) => (
          <div className="verification-card" key={check.key}>
            <div className="verification-card-head">
              <div>
                <span className="eyebrow">{check.mode === "auto" ? "Auto-check" : "Manual review"}</span>
                <h3>{check.label}</h3>
              </div>
              <span className={`status-pill ${check.mode === "auto" ? "verified" : "pending"}`}>{check.mode === "auto" ? "Automatic" : "Team review"}</span>
            </div>

            <div className="verification-upload-row">
              <label className="file-upload-button">
                <input type="file" onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    submitCheck(check.key, file);
                  }
                }} />
                Upload document
              </label>
              <span className="verification-note">{uploadState[check.key]?.message || (check.mode === "auto" ? "System validates this automatically" : "Submitted to staff review queue")}</span>
            </div>
          </div>
        ))}

        <button type="button" className="secondary-button" onClick={onBack}>Back to onboarding</button>
      </div>

      <aside className="side-note">
        <div className="side-note-top"><ShieldCheck size={18} /><span>Review flow</span></div>
        <h3>What is automated vs reviewed</h3>
        <p>Identity, tax, and financial gateway checks can be validated automatically. Licenses, premises documents, and settlement setup are routed to the compliance team.</p>
        <ul className="checklist">
          <li>Auto-verified: KYC, KRA, financial gateway</li>
          <li>Manual review: professional license, premises evidence, settlement details</li>
        </ul>
      </aside>
    </section>
  );
}

function ManualReviewPanel({ vendor, onBack, onReviewed }) {
  const manualChecks = [
    { key: "businessDocument", label: "Business registration document", field: "businessDocumentation" },
    { key: "professionalLicense", label: "Professional license", field: "professionalLicenseVerification" },
    { key: "premisesDoc", label: "Premises compliance", field: "premisesLicenseVerification" },
  ].filter((check) => vendor?.[check.field]);
  const [messages, setMessages] = useState({});

  const review = async (check, status) => {
    let reason = "";
    if (status === "FAILED") {
      reason = window.prompt("Reason for rejecting this document", "Document was not accepted") || "Document was not accepted";
    }

    const response = await fetch(`${API_BASE}/${vendor._id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ check: check.key, status, reason }),
    });
    const body = await response.json();
    if (!response.ok) {
      setMessages((current) => ({ ...current, [check.key]: body.error || "Unable to update review" }));
      return;
    }
    setMessages((current) => ({ ...current, [check.key]: `${status === "VERIFIED" ? "Approved" : "Rejected"} successfully` }));
    onReviewed(body.vendor);
  };

  return <section className="workspace-grid"><div className="form-column"><div className="section-kicker">03 / Manual review</div><h2>{vendor.businessName || "Vendor documents"}</h2><p className="section-intro">Review submitted documents and record the compliance team decision.</p>{manualChecks.length === 0 ? <div className="empty-state">No manual documents have been submitted.</div> : manualChecks.map((check) => { const item = vendor[check.field]; return <div className="verification-card" key={check.key}><div className="verification-card-head"><div><span className="eyebrow">{check.label}</span><h3>{item.referenceId || "Uploaded document"}</h3></div><StatusChip status={item.status} /></div><p className="verification-note">{item.errorMessage || "Awaiting review"}</p><div className="review-actions"><button type="button" className="primary-button" onClick={() => review(check, "VERIFIED")}>Approve</button><button type="button" className="secondary-button" onClick={() => review(check, "FAILED")}>Reject</button></div>{messages[check.key] && <p className="verification-note">{messages[check.key]}</p>}</div>; })}<button type="button" className="secondary-button" onClick={onBack}>Back to compliance queue</button></div><aside className="side-note"><div className="side-note-top"><ShieldCheck size={18} /><span>Reviewer controls</span></div><h3>Keep every decision traceable.</h3><p>Approve only documents that meet the selected vendor category requirements. Rejected documents remain visible with the reason recorded.</p></aside></section>;
}

function OnboardingPortal({ onCreated, onOpenVerification }) {
  const [form, setForm] = useState(() => ({ ...emptyForm, vendorType: industryOptions.some((option) => option.value === initialVendorType) ? initialVendorType : emptyForm.vendorType }));
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const selectedIndustry = industryOptions.find((option) => option.value === form.vendorType);

  const setValue = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const request = async (url, options) => {
        const response = await fetch(url, options);
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Verification request failed");
        return body;
      };
      const registration = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorType: form.vendorType, email: form.email, phoneNumber: form.phoneNumber, businessName: form.businessName }),
      });
      const registrationBody = await registration.json();
      if (!registration.ok) throw new Error(registrationBody.error || "Unable to register vendor");
      const vendorId = registrationBody.vendor._id;

      await request(`${API_BASE}/${vendorId}/verify-kyc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idNumber: form.idNumber, idType: "KENYA_NATIONAL_ID", firstName: form.firstName, lastName: form.lastName }),
      });
      if (form.kraPin) await request(`${API_BASE}/${vendorId}/verify-tax`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kraPin: form.kraPin }) });

      if (form.vendorType === "HEALTH_AGRO") {
        const files = new FormData();
        if (form.profLicense) files.append("profLicense", form.profLicense);
        if (form.premisesDoc) files.append("premisesDoc", form.premisesDoc);
        await request(`${API_BASE}/${vendorId}/verify-professional`, { method: "POST", body: files });
      }
      if (form.vendorType === "RETAIL" && form.businessDoc) {
        const files = new FormData();
        files.append("businessDoc", form.businessDoc);
        await request(`${API_BASE}/${vendorId}/verify-documents`, { method: "POST", body: files });
      }
      setFeedback({ type: "success", message: `${form.businessName} is now in the verification queue.` });
      setForm(emptyForm);
      onCreated();
      onOpenVerification(registrationBody.vendor);
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="workspace-grid">
      <div className="form-column">
        <div className="section-kicker">01 / Intake profile</div>
        <h2>Start a verification file</h2>
        <p className="section-intro">Tell us what kind of business you are running. We will reveal the checks that matter for your category.</p>
        <div className="industry-grid">
          {industryOptions.map(({ value, label, description, icon: Icon }) => <button type="button" className={`industry-card ${form.vendorType === value ? "selected" : ""}`} key={value} onClick={() => setValue("vendorType", value)}><span className="industry-icon"><Icon size={20} /></span><span><strong>{label}</strong><small>{description}</small></span>{form.vendorType === value && <Check size={17} className="selected-check" />}</button>)}
        </div>

        <form onSubmit={submit} className="verification-form">
          <div className="form-heading"><div><span className="eyebrow">{selectedIndustry.label}</span><h3>Business identity</h3></div><span className="step-count">Step 1 of 3</span></div>
          <div className="input-grid">
            <label>Business name<input required value={form.businessName} onChange={(event) => setValue("businessName", event.target.value)} placeholder="e.g. Northstar Pharmacy" /></label>
            <label>Email address<input required type="email" value={form.email} onChange={(event) => setValue("email", event.target.value)} placeholder="owner@business.co.ke" /></label>
            <label>Kenyan phone number<input required value={form.phoneNumber} onChange={(event) => setValue("phoneNumber", event.target.value)} placeholder="0712 345 678" /></label>
            <label>KRA PIN<input value={form.kraPin} onChange={(event) => setValue("kraPin", event.target.value)} placeholder="A000000000X" /></label>
          </div>

          <div className="form-heading subheading"><div><span className="eyebrow">Identity check</span><h3>Applicant details</h3></div><Fingerprint size={19} /></div>
          <div className="input-grid">
            <label>First name<input required value={form.firstName} onChange={(event) => setValue("firstName", event.target.value)} placeholder="John" /></label>
            <label>Last name<input required value={form.lastName} onChange={(event) => setValue("lastName", event.target.value)} placeholder="Doe" /></label>
            <label className="wide">National ID number<input required value={form.idNumber} onChange={(event) => setValue("idNumber", event.target.value)} placeholder="12345678" /></label>
          </div>

          <div className="form-heading subheading"><div><span className="eyebrow">Category evidence</span><h3>Upload supporting files</h3></div><FileCheck2 size={19} /></div>
          {form.vendorType === "HEALTH_AGRO" && <div className="drop-grid"><DropZone name="profLicense" label="Professional registration" hint="Pharmacy or Vet Board certificate · PDF, PNG" accept=".pdf,.png,.jpeg,.jpg" file={form.profLicense} onChange={(file) => setValue("profLicense", file)} /><DropZone name="premisesDoc" label="Premises compliance" hint="Facility approval · PDF, PNG" accept=".pdf,.png,.jpeg,.jpg" file={form.premisesDoc} onChange={(file) => setValue("premisesDoc", file)} /></div>}
          {form.vendorType === "RETAIL" && <div className="drop-grid"><DropZone name="businessDoc" label="Business registration" hint="Trade permit or registration · PDF, PNG" accept=".pdf,.png,.jpeg,.jpg" file={form.businessDoc} onChange={(file) => setValue("businessDoc", file)} /></div>}
          {form.vendorType === "REAL_ESTATE_CAR" && <div className="notice-box"><Landmark size={18} /><span>Asset dealerships start with identity verification. Property title deeds and vehicle documents can be attached during the review stage.</span></div>}

          {feedback && <div className={`feedback ${feedback.type}`}><CircleAlert size={17} />{feedback.message}</div>}
          <button className="primary-button" type="submit" disabled={submitting}>{submitting ? <><LoaderCircle size={17} className="spin" />Submitting file</> : <>Submit for verification <ArrowUpRight size={17} /></>}</button>
        </form>
      </div>
      <aside className="side-note">
        <div className="side-note-top"><ShieldCheck size={18} /><span>Verification map</span></div>
        <h3>Every track has a clear owner.</h3>
        <p>Files are stored securely and routed to the right compliance check for review.</p>
        <div className="mini-track"><span className="mini-number">01</span><span><strong>Identity</strong><small>SmileID identity match</small></span></div>
        <div className="mini-track"><span className="mini-number">02</span><span><strong>Financial</strong><small>M-Pesa gateway confirmation</small></span></div>
        <div className="mini-track"><span className="mini-number">03</span><span><strong>Industry</strong><small>Licenses and local permits</small></span></div>
      </aside>
    </section>
  );
}

function ComplianceDashboard({ vendors, loading, error, onRefresh, onOpenReview, onSweep }) {
  const [query, setQuery] = useState("");
  const [sweepingId, setSweepingId] = useState("");
  const filteredVendors = useMemo(() => vendors.filter((vendor) => `${vendor.businessName} ${vendor.email} ${vendor.vendorType}`.toLowerCase().includes(query.toLowerCase())), [vendors, query]);
  const counts = { total: vendors.length, verified: vendors.filter((vendor) => vendor.kycVerification?.status === "VERIFIED").length, pending: vendors.filter((vendor) => vendor.financialGatewayVerification?.status !== "VERIFIED").length };

  const handleSweep = async (vendor) => {
    setSweepingId(vendor._id);
    try {
      await onSweep(vendor);
    } finally {
      setSweepingId("");
    }
  };

  return <section className="dashboard-view">
    <div className="dashboard-toolbar"><div><div className="section-kicker">02 / Operations desk</div><h2>Compliance queue</h2><p className="section-intro">A live view of every vendor identity and industry track.</p></div><button className="ghost-button" type="button" onClick={onRefresh} disabled={loading}><RefreshCw size={16} className={loading ? "spin" : ""} />Refresh queue</button></div>
    <div className="metric-row"><div className="metric-card"><span>Registered vendors</span><strong>{counts.total}</strong><small>Across all verticals</small></div><div className="metric-card accent"><span>KYC verified</span><strong>{counts.verified}</strong><small>Identity milestones cleared</small></div><div className="metric-card"><span>Needs attention</span><strong>{counts.pending}</strong><small>Financial or document tracks</small></div></div>
    <div className="table-shell"><div className="table-head"><div><h3>Vendor records</h3><span>{filteredVendors.length} visible records</span></div><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search vendors" /></label></div>{error && <div className="feedback error"><CircleAlert size={17} />{error}</div>}{loading ? <div className="empty-state"><LoaderCircle className="spin" />Loading vendor records</div> : filteredVendors.length === 0 ? <div className="empty-state"><Building2 />No vendor records match this search.</div> : <div className="table-scroll"><table><thead><tr><th>Vendor</th><th>Industry</th><th>Core tracks</th><th>Industry tracks</th><th>Action</th></tr></thead><tbody>{filteredVendors.map((vendor) => <tr key={vendor._id}><td><div className="vendor-cell"><span className="vendor-avatar">{vendor.businessName?.slice(0, 1).toUpperCase() || "V"}</span><span><strong>{vendor.businessName || "Unnamed business"}</strong><small>{vendor.email}</small></span></div></td><td><span className="type-pill">{vendor.vendorType}</span></td><td><div className="chip-stack"><StatusChip status={vendor.kycVerification?.status} /><StatusChip status={vendor.financialGatewayVerification?.status} /><StatusChip status={vendor.kraPinVerification?.status} /></div></td><td><div className="chip-stack">{vendor.vendorType === "HEALTH_AGRO" && <><StatusChip status={vendor.professionalLicenseVerification?.status} /><StatusChip status={vendor.premisesLicenseVerification?.status} /></>}{vendor.vendorType === "RETAIL" && <StatusChip status={vendor.businessDocumentation?.status} />}{vendor.vendorType === "REAL_ESTATE_CAR" && <span className="muted-cell">KYC only</span>}</div></td><td><button type="button" className="table-action" onClick={() => window.alert(`Verification sweep queued for ${vendor.businessName}`)}>Run sweep <ChevronRight size={15} /></button></td></tr>)}</tbody></table></div>}</div>
  </section>;
}

export default function App() {
  const [activeView, setActiveView] = useState("onboarding");
  const [vendors, setVendors] = useState([]);
  const [verificationVendor, setVerificationVendor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadVendors = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API_BASE);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load vendors");
      setVendors(body.vendors || []);
    } catch (loadError) {
      setError(`${loadError.message}. Is the backend running on port 5000?`);
    } finally {
      setLoading(false);
    }
  };

  const runVerificationSweep = async (vendor) => {
    const jsonRequest = (path, body) => fetch(`${API_BASE}/${vendor._id}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    await jsonRequest("verify-kyc", { idNumber: "12345678", idType: "KENYA_NATIONAL_ID", firstName: "Admin", lastName: "Sweep" });
    await jsonRequest("verify-tax", { kraPin: "A123456789X" });
    if (vendor.vendorType === "HEALTH_AGRO") await jsonRequest("verify-professional", {});
    if (vendor.vendorType === "RETAIL") await jsonRequest("verify-documents", {});
    await loadVendors();
  };

  useEffect(() => { loadVendors(); }, []);

  const openVerificationHub = (vendor) => {
    if (vendor) {
      setVerificationVendor(vendor);
      setActiveView("verification");
    }
  };

  const openReview = (vendor) => {
    setVerificationVendor(vendor);
    setActiveView("review");
  };

  const updateReviewedVendor = (updatedVendor) => {
    setVerificationVendor(updatedVendor);
    setVendors((current) => current.map((vendor) => vendor._id === updatedVendor._id ? updatedVendor : vendor));
  };

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark"><ShieldCheck size={19} /></span><span><strong>Nova Verify</strong><small>Vendor operations</small></span></div><div className="topbar-status"><span className="online-dot" />Compliance workspace <span className="divider-dot" /> <span>Kenya / EAT</span></div></header>
    <main className="page-wrap"><section className="hero"><div><span className="hero-label">Vendor assurance platform</span><h1>Make trust <em>visible.</em></h1><p>One calm workspace for onboarding businesses and keeping every verification track moving.</p></div><div className="hero-stamp"><BadgeCheck size={22} /><span><strong>Live operations</strong><small>Last sync just now</small></span></div></section>
      <nav className="view-tabs" aria-label="Workspace views"><button type="button" className={activeView === "onboarding" ? "active" : ""} onClick={() => setActiveView("onboarding")}><LayoutDashboard size={17} />Onboarding portal</button><button type="button" className={activeView === "verification" ? "active" : ""} onClick={() => setActiveView("verification")}><FileCheck2 size={17} />Verification hub</button><button type="button" className={activeView === "compliance" ? "active" : ""} onClick={() => { setActiveView("compliance"); loadVendors(); }}><ShieldCheck size={17} />Admin compliance <span className="tab-count">{vendors.length}</span></button></nav>
      {activeView === "verification" ? <VerificationHub vendor={verificationVendor} onBack={() => setActiveView("onboarding")} /> : activeView === "review" ? <ManualReviewPanel vendor={verificationVendor} onBack={() => setActiveView("compliance")} onReviewed={updateReviewedVendor} /> : activeView === "onboarding" ? <OnboardingPortal onCreated={loadVendors} onOpenVerification={openVerificationHub} /> : <ComplianceDashboard vendors={vendors} loading={loading} error={error} onRefresh={loadVendors} onOpenReview={openReview} onSweep={runVerificationSweep} />}
    </main>
    <footer><span>Nova Verify / Internal operations</span><span>Protected workflow <ShieldCheck size={14} /></span></footer>
  </div>;
}

                     <td><button type="button" className="table-action" onClick={() => onOpenReview(vendor)}>Review documents <ChevronRight size={15} /></button></td>
