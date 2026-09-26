import { useState } from "react";
import { FiArrowRight, FiLock, FiMapPin, FiSend } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../Store/hooks";
import { handleLogin } from "../Store/thunk";

const getApiBaseUrl = () => {
  const configuredBaseUrl = process.env.REACT_APP_BASEURL;
  if (configuredBaseUrl) return configuredBaseUrl.replace(/\/$/, "");
  return typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5001/api"
    : "https://my-app-1-ggdw.onrender.com/api";
};

const apiBaseUrl = getApiBaseUrl();

const VendorPreRegistrationPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [shopName, setShopName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const preregister = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setRegistrationMessage("");
    try {
      const response = await fetch(`${apiBaseUrl}/auth/vendor-pre-registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to preregister shop");
      setRegistrationMessage("Shop preregistered. We will contact you when vendor onboarding opens.");
      setShowCelebration(true);
      setShopName("");
    } catch (registrationError) {
      setError(registrationError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openOriginalSite = async (event) => {
    event.preventDefault();
    setUnlocking(true);
    setError("");
    const result = await dispatch(handleLogin({ data: { role: "adminGateway", accessCode } }));
    if (handleLogin.fulfilled.match(result)) {
      navigate("/collection-officer");
    } else {
      setError(result.payload || "Unable to open the original site");
    }
    setUnlocking(false);
  };

  return (
    <main className="min-h-screen bg-[#081f2b] px-4 py-8 text-slate-900 sm:px-8 lg:px-12">
      {showCelebration && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#081f2b]/70 px-4" role="status" aria-live="polite"><div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl sm:p-12"><div className="pointer-events-none absolute inset-0" aria-hidden="true">{Array.from({ length: 28 }, (_, index) => <span key={index} className="absolute h-3 w-2 animate-bounce rounded-sm" style={{ left: `${(index * 37) % 100}%`, top: `${(index * 19) % 75}%`, backgroundColor: ["#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#6366f1"][index % 5], transform: `rotate(${index * 29}deg)`, animationDelay: `${(index % 7) * 80}ms` }} />)}<span className="absolute left-8 top-8 h-20 w-16 rounded-[50%] bg-rose-400 shadow-lg" /><span className="absolute right-8 top-12 h-24 w-16 rounded-[50%] bg-cyan-400 shadow-lg" /><span className="absolute bottom-8 left-1/2 h-20 w-14 rounded-[50%] bg-amber-300 shadow-lg" /></div><div className="relative"><p className="text-5xl">Thank you!</p><h2 className="mt-4 text-3xl font-black text-emerald-900">Thank you for registering</h2><p className="mt-3 text-sm leading-6 text-slate-600">Your shop has been added to the NovaUnicorn vendor interest list.</p><button type="button" onClick={() => setShowCelebration(false)} className="mt-7 rounded-xl bg-emerald-800 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-900">Continue</button></div></div></div>}
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#f4f1e8] shadow-2xl">
        <section className="relative overflow-hidden bg-[#123d3a] px-6 py-16 text-white sm:px-12 sm:py-24 lg:px-20 lg:py-32">
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full border-[48px] border-emerald-300/15" />
          <div className="absolute bottom-[-9rem] left-1/3 h-72 w-72 rounded-full border-[34px] border-cyan-300/10" />
          <div className="relative max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-200">The next chapter of commerce</p>
            <h1 className="mt-5 text-6xl font-black tracking-tight sm:text-8xl">NovaUnicorn</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50/80 sm:text-xl">Our aim is to help vendors aim greater customers from the comfort of their shops.</p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-100/70 sm:text-lg">A market filled with unlimited opportunities.</p>
          </div>
        </section>

        <section className="grid gap-6 p-5 sm:p-8 lg:grid-cols-2 lg:p-12">
          <form onSubmit={preregister} className="rounded-2xl border border-[#d9d4c8] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800"><FiMapPin className="text-2xl" /></div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Vendor interest list</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">Preregister your shop</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Enter your shop name only. This reserves one vendor place without opening a shopping or selling account yet.</p>
            <label className="mt-6 block text-sm font-semibold text-slate-700">Shop name<input required maxLength="120" value={shopName} onChange={(event) => setShopName(event.target.value)} placeholder="Example: Sunrise Electronics" className="mt-2 w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-emerald-700" /></label>
            <button type="submit" disabled={submitting} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-4 text-sm font-bold text-white hover:bg-emerald-900 disabled:opacity-60"><FiSend />{submitting ? "Saving..." : "Preregister shop"}</button>
          </form>

          <form onSubmit={openOriginalSite} className="rounded-2xl border border-[#d9d4c8] bg-[#123d3a] p-6 text-white shadow-sm sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-emerald-200"><FiLock className="text-2xl" /></div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Private access</p>
            <h2 className="mt-2 text-3xl font-black">Open the original site</h2>
            <p className="mt-3 text-sm leading-6 text-emerald-50/75">Use the administrator gateway passcode to continue to the existing NovaUnicorn experience.</p>
            <label className="mt-6 block text-sm font-semibold text-emerald-50">Gateway passcode<input required type="password" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} placeholder="Enter passcode" className="mt-2 w-full rounded-xl border border-white/20 bg-white p-4 text-slate-900 outline-none focus:border-emerald-300" /></label>
            <button type="submit" disabled={unlocking} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-5 py-4 text-sm font-bold text-emerald-950 hover:bg-emerald-200 disabled:opacity-60">{unlocking ? "Opening..." : "Continue to original site"}<FiArrowRight /></button>
          </form>
        </section>
        {(registrationMessage || error) && <p className={`mx-5 mb-6 rounded-xl p-4 text-center text-sm sm:mx-8 lg:mx-12 ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>{error || registrationMessage}</p>}
      </div>
    </main>
  );
};

export default VendorPreRegistrationPage;
