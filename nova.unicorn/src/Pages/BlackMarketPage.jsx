import { BsStars, BsShieldCheck } from "react-icons/bs";
import { useAppSelector } from "../Store/hooks";

const BlackMarketPage = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <main className="min-h-screen bg-[#10131c] px-4 py-8 text-white sm:px-6 lg:py-12">
      <section className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-amber-300/20 bg-gradient-to-br from-[#171b2c] via-[#31214d] to-[#8b3d2f] p-8 shadow-2xl sm:p-14">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-amber-300/15 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-3xl">
          <div className="flex items-center gap-3 text-amber-200"><BsStars className="h-6 w-6" /><span className="text-xs font-bold uppercase tracking-[0.28em]">Nova Unicorn exclusive</span></div>
          <h1 className="mt-6 text-4xl font-black uppercase tracking-[0.08em] sm:text-6xl">BLACK MARKET</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/80 sm:text-lg">A bold marketplace for rare finds, independent sellers, and unexpected discoveries.</p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-amber-100"><BsShieldCheck className="h-5 w-5" />Curated opportunities for {user?.username || "you"}</div>
        </div>
      </section>
    </main>
  );
};

export default BlackMarketPage;