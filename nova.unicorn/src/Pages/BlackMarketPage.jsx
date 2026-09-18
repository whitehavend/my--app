import { Link, useLocation } from "react-router-dom";
import { BsShieldCheck, BsStars } from "react-icons/bs";
import { FiHeadphones } from "react-icons/fi";
import { HiOutlineUser } from "react-icons/hi";
import { BsBox2, BsQuestionCircle, BsUpload } from "react-icons/bs";
import { useAppSelector } from "../Store/hooks";

const pageLinks = [
  { label: "My Account", to: "/account", icon: HiOutlineUser },
  { label: "Orders", to: "/orders", icon: BsBox2 },
  { label: "Assistance", to: "/vendor/help#assistance", icon: FiHeadphones },
  { label: "Help", to: "/vendor/help", icon: BsQuestionCircle },
  { label: "Upload", to: "/vendor/products/new", icon: BsUpload },
];

const BlackMarketPage = () => {
  const { pathname } = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <main className="min-h-screen bg-[#10131c] px-4 py-6 text-white sm:px-6 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 overflow-hidden rounded-3xl border border-amber-300/20 bg-slate-950/60 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col gap-4 border-b border-white/10 bg-white/5 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-fuchsia-400 text-sm font-black text-slate-900">
                N
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-amber-200">Nova Unicorn</p>
                <p className="text-xs text-slate-300">Exclusive market</p>
              </div>
            </div>

            <nav aria-label="Black market actions" className="flex flex-wrap gap-2">
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

          <section className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-[#171b2c] via-[#31214d] to-[#8b3d2f] p-6 sm:p-8 lg:p-12">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-amber-300/15 blur-3xl" aria-hidden="true" />
            <div className="relative max-w-3xl">
              <div className="flex items-center gap-3 text-amber-200">
                <BsStars className="h-6 w-6" />
                <span className="text-xs font-bold uppercase tracking-[0.28em]">Nova Unicorn exclusive</span>
              </div>
              <h1 className="mt-6 text-4xl font-black uppercase tracking-[0.08em] text-white sm:text-6xl">BLACK MARKET</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
                A bold marketplace for rare finds, independent sellers, and unexpected discoveries that deserve a spotlight.
              </p>
              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-amber-100">
                <BsShieldCheck className="h-5 w-5" />
                Curated opportunities for {user?.username || "you"}
              </div>
            </div>
          </section>
        </header>
      </div>
    </main>
  );
};

export default BlackMarketPage;