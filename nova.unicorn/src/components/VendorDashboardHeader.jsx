import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { BsBox2, BsQuestionCircle, BsUpload } from "react-icons/bs";
import { HiOutlineUser } from "react-icons/hi";
import { FiHeadphones } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { getVendorOrders } from "../Store/thunk";

const links = [
  { label: "Settings", to: "/account", icon: HiOutlineUser },
  { label: "Orders", to: "/vendor/orders", icon: BsBox2 },
  { label: "Assistance", to: "/vendor/help#assistance", icon: FiHeadphones },
  { label: "Help", to: "/vendor/help", icon: BsQuestionCircle },
  { label: "Uploaded Products", to: "/vendor/products", icon: BsUpload },
];

const VendorDashboardHeader = () => {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector((state) => state.orders);

  useEffect(() => {
    const refreshOrders = () => dispatch(getVendorOrders());
    refreshOrders();
    const refreshTimer = setInterval(refreshOrders, 5000);
    return () => clearInterval(refreshTimer);
  }, [dispatch]);

  const hasOrdersToFulfill = orders.some((order) => order.status === "pending");

  return (
    <header className="bg-white shadow-sm">
      <div className="flex h-12 items-center justify-center bg-primary px-4 text-white">
        <Link to="/vendor" className="font-mono text-sm font-black uppercase tracking-[0.24em] sm:text-base">
          Nova Unicorn
        </Link>
      </div>
      <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Vendor workspace</p>
            <h1 className="mt-1 text-xl font-bold text-gray-900">Manage your store</h1>
          </div>
          <nav aria-label="Vendor dashboard" className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:justify-end lg:overflow-visible">
            {links.map(({ label, to, icon: Icon }) => {
              const isActive = pathname === to || (label === "Uploaded Products" && pathname === "/vendor/products/new");
              return (
                <Link
                  key={label}
                  to={to}
                  className={`flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? "border-primary bg-primary text-white" : "border-gray-200 text-gray-700 hover:border-primary hover:text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="relative">{label}{label === "Orders" && hasOrdersToFulfill && <span aria-label="Orders awaiting fulfillment" className="absolute -right-2 -top-1 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default VendorDashboardHeader;
