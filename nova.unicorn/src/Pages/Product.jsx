import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import ProductCard from "../components/ProductCard";
import { useAppSelector } from "../Store/hooks";
import Alert from "../components/Alert";

const Product = () => {
  const location = useLocation();
  const product = location.state?.product;
  const { notify, status } = useAppSelector((state) => state.carts);

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#02070d] px-5 text-[#f3f5f7]">
        <div className="max-w-md text-center">
          <p className="text-lg font-semibold">This product page is no longer available.</p>
          <Link to="/customer" className="mt-5 inline-flex items-center gap-2 bg-[#7ce6d4] px-4 py-3 text-sm font-bold text-[#071118]">
            <FiArrowLeft /> Back to marketplace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#02070d] text-[#f3f5f7]">
      <header className="border-b border-white/10 bg-[linear-gradient(110deg,#0b1118_0%,#12251f_58%,#15352e_100%)]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-4 py-5 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#7ce6d4]">Nova Unicorn Marketplace</p>
            <h1 className="mt-1 text-xl font-black text-white sm:text-2xl">There’s always something new to discover</h1>
            <p className="mt-1 text-sm text-[#c4c8cc]">Come back soon for fresh finds and new arrivals.</p>
          </div>
          <Link to="/customer" className="inline-flex shrink-0 items-center gap-2 bg-[#7ce6d4] px-4 py-3 text-xs font-black uppercase text-[#071118] transition hover:bg-[#a7f3d0]">
            Explore marketplace <FiArrowRight />
          </Link>
        </div>
      </header>
      {notify && <Alert message={status} />}
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="min-w-0 w-full">
          <ProductCard product={product} />
        </div>
      </div>
    </main>
  );
};

export default Product;
