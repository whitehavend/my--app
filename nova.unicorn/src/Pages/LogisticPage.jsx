import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiHeadphones } from "react-icons/fi";
import { HiOutlineUser } from "react-icons/hi";
import { BsQuestionCircle, BsShieldCheck } from "react-icons/bs";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { getLogisticRequests, updateLogisticAvailability } from "../Store/thunk";

const pageLinks = [
  { label: "Settings", to: "/account", icon: HiOutlineUser },
  { label: "Assistance", to: "/vendor/help#assistance", icon: FiHeadphones },
  { label: "Help", to: "/vendor/help", icon: BsQuestionCircle },
];

const LogisticPage = () => {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { requests, status, error } = useAppSelector((state) => state.logistics);
  const [isAvailable, setIsAvailable] = useState(Boolean(user?.logisticAvailable));

  useEffect(() => {
    setIsAvailable(Boolean(user?.logisticAvailable));
    const refreshRequests = () => dispatch(getLogisticRequests());
    refreshRequests();
    const refreshTimer = setInterval(refreshRequests, 5000);

    return () => clearInterval(refreshTimer);
  }, [dispatch, user?.logisticAvailable]);

  const toggleAvailability = async () => {
    const nextValue = !isAvailable;
    const result = await dispatch(updateLogisticAvailability(nextValue));
    if (updateLogisticAvailability.fulfilled.match(result)) {
      setIsAvailable(nextValue);
      dispatch(getLogisticRequests());
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50 to-cyan-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-950 shadow-2xl">
          <div className="flex flex-col gap-4 border-b border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-cyan-400 text-sm font-black text-slate-900">
                N
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-emerald-200">Nova Unicorn</p>
                <p className="text-xs text-emerald-100/80">Delivery partners</p>
              </div>
            </div>

            <nav aria-label="Logistics actions" className="flex flex-wrap gap-2">
              {pageLinks.map(({ label, to, icon: Icon }) => {
                const isActive = pathname === to;

                return (
                  <Link
                    key={label}
                    to={to}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-all sm:text-sm ${
                      isActive
                        ? "border-emerald-300 bg-emerald-300 text-slate-900 shadow-md"
                        : "border-white/15 bg-white/5 text-white hover:border-emerald-200 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <section className="relative overflow-hidden bg-gradient-to-r from-[#051b1b] via-[#0d5a4d] to-[#0ea5a4] p-6 sm:p-8 lg:p-12">
            <div className="absolute -right-14 -top-14 h-52 w-52 rounded-full bg-emerald-300/20 blur-3xl" aria-hidden="true" />
            <div className="absolute bottom-0 left-12 h-40 w-40 rounded-full bg-cyan-200/10 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-100">
                <BsShieldCheck className="h-3.5 w-3.5" />
                Safe delivery first
              </div>

              <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                Drive safe. Deliver with care. Protect every drop-off.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50 sm:text-lg">
                Your safety matters on every route. Take extra care, respect the road, deliver on time, and keep every customer experience smooth and secure.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/orders" className="rounded-full bg-white px-5 py-3 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50">
                  View deliveries
                </Link>
                <Link to="/vendor/help" className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                  Safety tips
                </Link>
              </div>
            </div>
          </section>
        </header>

        <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Logistic dashboard</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Logistic contact details</h2>
          <dl className="mt-6 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-sm text-gray-500">Full name</dt>
              <dd className="mt-1 font-medium text-slate-900">{user?.displayName || "Delivery driver"}</dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-sm text-gray-500">Phone number</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {user?.countryCode || "+000"} {user?.phoneNumber || "0000000000"}
              </dd>
            </div>
          </dl>
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-medium text-slate-700">Availability status</p>
            <button type="button" onClick={toggleAvailability} className={`mt-3 rounded-full px-5 py-3 text-sm font-bold text-white ${isAvailable ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-600 hover:bg-slate-700"}`}>
              {isAvailable ? "Available - switch to unavailable" : "Unavailable - switch to available"}
            </button>
            <p className="mt-2 text-xs text-slate-600">When available, vendors can request you for item pickup.</p>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <h2 className="text-xl font-bold text-slate-900">Pickup requests</h2>
            {error && <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {status !== "loading" && !requests.length && !error && <p className="mt-3 text-sm text-slate-600">No vendors have requested a pickup yet.</p>}
            <div className="mt-3 space-y-3">
              {requests.map((request, index) => (
                <article key={`${request.vendorId}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="font-semibold text-slate-900">{request.vendorFullName || "Vendor"}</p>
                  <p className="mt-1 text-slate-600">Shop: {request.vendorShopName || "Not provided"}</p>
                  <p className="mt-1 text-slate-600">Phone: {request.vendorPhoneNumber || "Not provided"}</p>
                  <p className="mt-1 text-slate-600">Shop address: {request.vendorShopAddress || "Not provided"}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LogisticPage;
