import { Link, useLocation } from "react-router-dom";
import { FiHeadphones } from "react-icons/fi";
import { HiOutlineUser } from "react-icons/hi";
import { BsMegaphone, BsQuestionCircle } from "react-icons/bs";
import { useAppSelector } from "../Store/hooks";

const pageLinks = [
  { label: "Settings", to: "/account", icon: HiOutlineUser },
  { label: "Assistance", to: "/vendor/help#assistance", icon: FiHeadphones },
  { label: "Help", to: "/vendor/help", icon: BsQuestionCircle },
];

const AdvertPage = () => {
  const { pathname } = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const socials = Object.entries(user?.advertSocials || {});

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-amber-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-2xl">
          <div className="flex flex-col gap-4 border-b border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-sm font-black text-slate-900">
                N
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-amber-200">Nova Unicorn</p>
                <p className="text-xs text-slate-300">Advertise with us</p>
              </div>
            </div>

            <nav aria-label="Advertiser actions" className="flex flex-wrap gap-2">
              {pageLinks.map(({ label, to, icon: Icon }) => {
                const isActive = pathname === to;

                return (
                  <Link
                    key={label}
                    to={to}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-all sm:text-sm ${
                      isActive
                        ? "border-amber-300 bg-amber-300 text-slate-900 shadow-md"
                        : "border-white/15 bg-white/5 text-white hover:border-amber-200 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <section className="relative overflow-hidden bg-gradient-to-r from-[#0f172a] via-[#1d4ed8] to-[#7c3aed] p-6 sm:p-8 lg:p-12">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-amber-300/20 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-12 left-10 h-40 w-40 rounded-full bg-cyan-300/15 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-100">
                <BsMegaphone className="h-3.5 w-3.5" />
                Growth partner
              </div>

              <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                Promote Nova Unicorn and turn attention into sales.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
                Reach thousands of shoppers, showcase your brand, and grow faster with ads built for discovery, trust, and repeat purchases.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/vendor/help" className="rounded-full bg-amber-300 px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-200">
                  Start advertising
                </Link>
                <Link to="/vendor/help#assistance" className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                  Talk to our team
                </Link>
              </div>
            </div>
          </section>
        </header>

        <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Advert dashboard</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Your advertising platforms</h2>
          <p className="mt-2 text-gray-600">
            Signed in as {user?.displayName || "Advertiser"} · {user?.email || "your@email.com"}
          </p>
          <div className="mt-6 space-y-3">
            {socials.map(([platform, username]) => (
              <div key={platform} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-slate-50 p-4">
                <span className="capitalize text-slate-700">{platform}</span>
                <span className="font-medium text-primary">@{username}</span>
              </div>
            ))}
            {!socials.length && <p className="text-gray-600">No advertising platforms selected yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdvertPage;
