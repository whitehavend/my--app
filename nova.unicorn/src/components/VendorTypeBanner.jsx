import { BsBuildings, BsShop } from "react-icons/bs";
import { FaCarSide, FaCapsules } from "react-icons/fa";
import { GiPlantRoots } from "react-icons/gi";

const vendorBanners = {
  retailshopvendor: {
    label: "Retail shop vendor",
    title: "Turn every shelf into an opportunity",
    description: "Bring your everyday products to more customers through Nova Unicorn.",
    icon: BsShop,
    background: "from-emerald-700 via-teal-700 to-cyan-800",
    accent: "bg-emerald-300/20",
  },
  cardealer: {
    label: "Car dealer",
    title: "Move your best inventory further",
    description: "Showcase vehicles, reach serious buyers, and grow your dealership online.",
    icon: FaCarSide,
    background: "from-slate-800 via-blue-900 to-indigo-950",
    accent: "bg-sky-300/20",
  },
  realestate: {
    label: "Real estate",
    title: "Put the right places on the map",
    description: "Connect remarkable properties with people ready to make a move.",
    icon: BsBuildings,
    background: "from-amber-700 via-orange-700 to-rose-800",
    accent: "bg-yellow-200/20",
  },
  pharmacy: {
    label: "Pharmacy",
    title: "Make trusted care easier to find",
    description: "Create a dependable digital storefront for health and wellness essentials.",
    icon: FaCapsules,
    background: "from-rose-700 via-red-700 to-pink-800",
    accent: "bg-rose-200/20",
  },
  agrovet: {
    label: "Agrovet",
    title: "Help every harvest go further",
    description: "Put practical farm and animal-care supplies within easy reach.",
    icon: GiPlantRoots,
    background: "from-lime-800 via-green-800 to-emerald-950",
    accent: "bg-lime-200/20",
  },
};

const VendorTypeBanner = ({ vendorType = "retailshopvendor" }) => {
  const banner = vendorBanners[vendorType] || vendorBanners.retailshopvendor;
  const Icon = banner.icon;

  return (
    <section className={`relative isolate overflow-hidden bg-gradient-to-br ${banner.background} text-white`}>
      <div className={`absolute -right-16 -top-20 h-64 w-64 rounded-full ${banner.accent}`} aria-hidden="true" />
      <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full border border-white/10" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-6xl items-center gap-5 px-4 py-9 sm:px-6 sm:py-12">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-sm sm:h-20 sm:w-20">
          <Icon className="h-8 w-8 sm:h-10 sm:w-10" />
        </div>
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">{banner.label}</p>
          <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-4xl">{banner.title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/85 sm:text-base">{banner.description}</p>
        </div>
      </div>
    </section>
  );
};

export default VendorTypeBanner;
