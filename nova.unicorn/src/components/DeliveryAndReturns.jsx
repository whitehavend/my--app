import React from "react";
import { GiCardPickup } from "react-icons/gi";

const DeliveryAndReturns = () => {
  return (
    <div className="flex w-full flex-col items-start rounded-xl border border-white/10 bg-[#101822] text-sm shadow-lg">
      <h1 className="w-full border-b border-white/10 p-4 text-base font-semibold text-[#f3f5f7]">
        We deliver the goods to your hands
      </h1>
      <div className="flex w-full flex-col items-start justify-between">
        <p className="w-full border-b border-white/10 p-4 text-[#c4c8cc]">
          Free delivery on thousands of products in Lagos, Ibadan & Abuja
        </p>
        <div className="mb-2 flex w-full items-start justify-between px-4 py-2">
          <div className="flex h-10 w-[15%] items-center justify-center rounded-sm border border-white/10 bg-[#0b1118] text-[#7ce6d4]">
            <GiCardPickup className="w-5 h-5" />
          </div>
          <div className="w-[83%]">
            <h2 className="text-sm font-semibold text-[#f3f5f7]">Pickup Station</h2>
            <p className="text-[#aab4c0]">
              Arriving at pickup station in 2 days when you order within next
              2hrs 32mins
            </p>
          </div>
        </div>
        <div className="mb-2 flex w-full items-start justify-between px-4 pb-4">
          <div className="flex h-10 w-[15%] items-center justify-center rounded-sm border border-emerald-200 bg-emerald-50 text-emerald-700">
            <span className="text-lg font-black">N</span>
          </div>
          <div className="w-[83%]">
            <h2 className="text-sm font-semibold text-[#f3f5f7]">From our store to your door</h2>
            <p className="text-[#aab4c0]">
              Our delivery partners handle every order with care and bring it safely to your hands.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAndReturns;
