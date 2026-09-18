import { Link, useLocation } from "react-router-dom";
import { FiHeadphones } from "react-icons/fi";
import { HiOutlineUser } from "react-icons/hi";
import { BsBox2, BsQuestionCircle, BsShieldCheck, BsUpload } from "react-icons/bs";
import { useAppSelector } from "../Store/hooks";

const pageLinks = [
  { label: "My Account", to: "/account", icon: HiOutlineUser },
  { label: "Orders", to: "/orders", icon: BsBox2 },
  { label: "Assistance", to: "/vendor/help#assistance", icon: FiHeadphones },
  { label: "Help", to: "/vendor/help", icon: BsQuestionCircle },
  { label: "Upload", to: "/vendor/products/new", icon: BsUpload },
];

const LogisticPage = () => {
  const { pathname } = useLocation();
  const { user } = useAppSelector((state) => state.auth);

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
        </section>
      </div>
    </main>
  );
};

export default LogisticPage;
