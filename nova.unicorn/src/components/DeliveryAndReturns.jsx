import React from "react";
import { GiCardPickup } from "react-icons/gi";

const DeliveryAndReturns = () => {
  return (
    <div className="flex flex-col items-start text-sm bg-white shadow-md rounded-md w-full">
      <h1 className="font-semibold border-b w-full p-3 text-base">
        We deliver the goods to your hands
      </h1>
      <div className=" flex items-start justify-between flex-col w-full">
        <p className="text-gray-600 border-b p-4">
          Free delivery on thousands of products in Lagos, Ibadan & Abuja
        </p>
        <div className="flex items-start justify-between mb-2 w-full px-4 py-2">
          <div className="border border-gray-200 w-[15%] h-10 rounded-sm  flex items-center justify-center">
            <GiCardPickup className="w-5 h-5" />
          </div>
          <div className="w-[83%]">
            <h2 className="text-sm font-semibold">Pickup Station</h2>
            <p className="text-gray-500">
              Arriving at pickup station in 2 days when you order within next
              2hrs 32mins
            </p>
          </div>
        </div>
        <div className="flex items-start justify-between mb-2 w-full px-4 pb-4">
          <div className="flex h-10 w-[15%] items-center justify-center rounded-sm border border-emerald-200 bg-emerald-50 text-emerald-700">
            <span className="text-lg font-black">N</span>
          </div>
          <div className="w-[83%]">
            <h2 className="text-sm font-semibold">From our store to your door</h2>
            <p className="text-gray-500">
              Our delivery partners handle every order with care and bring it safely to your hands.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAndReturns;
