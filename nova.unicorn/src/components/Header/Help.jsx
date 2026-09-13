import React from "react";
import { BsChatLeftDots } from "react-icons/bs";

const Help = () => {
  return (
    <div className="absolute top-[165px] right-36 2xl:right-40 2xl-custom:right-44 bg-white w-[220px] rounded-md border border-stone-200 z-10">
      <div className="flex flex-col border-b-2 border-[#f1f1f2]">
        <p className="group p-3 hover:bg-[#f1f1f2] hover:font-semibold transition-all duration-[300]  cursor-pointer">
          <span className="text-[grey] text-sm group-hover:text-[black]">Help Center</span>
        </p>

        <p className="group p-3 hover:bg-[#f1f1f2] hover:font-semibold transition-all duration-[300]  cursor-pointer">
          <span className="text-[grey] text-sm group-hover:text-[black]">Place & track order</span>
        </p>

        <p className="group p-3 hover:bg-[#f1f1f2] hover:font-semibold transition-all duration-[300]  cursor-pointer">
          <span className="text-[grey] text-sm group-hover:text-[black]">Order cancellation</span>
        </p>

        <p className="group p-3 hover:bg-[#f1f1f2] hover:font-semibold transition-all duration-[300]  cursor-pointer">
          <span className="text-[grey] text-sm group-hover:text-[black]">Payment & Unicorn account</span>
        </p>

        <p className="group p-3 hover:bg-[#f1f1f2] hover:font-semibold transition-all duration-[300]  cursor-pointer">
          <span className="text-[grey] text-sm group-hover:text-[black]">Contact Us</span>
        </p>
      </div>

      <div className="py-4 mx-3">
        <button className="w-full bg-primary rounded-md text-white px-6 py-3 hover:bg-primary100 shadow-md flex items-center gap-4">
          <BsChatLeftDots className="text-2xl" />
          LIVE CHAT
        </button>
      </div>
    </div>
  );
};

export default Help;