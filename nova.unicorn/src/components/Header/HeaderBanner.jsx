import React from "react";
import { IoShieldHalfOutline } from "react-icons/io5";

const HeaderBanner = () => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-gray-100 w-full h-10">
      <div className="w-[80%]">
        <div className="w-[55%] b">
          <div className="flex items-center justify-between">
            <div className="cursor-pointer flex items-center gap-2">
              <img src="images/unicorn-horn-black.svg" alt="Unicorn horn" className="w-5 h-5" />
              <h1 className="text-primary font-semibold pl-[2px] leading-5 text-[10px] tracking-[0.12em] uppercase">
                Sell On Unicorn
              </h1>
            </div>
            <div className="flex items-center gap-1">
              <div className="cursor-pointer flex items-center mr-2 gap-1">
                <h1 className="font-mono uppercase font-black text-sm tracking-[0.18em]">
                  Nova
                </h1>
                <img src="images/unicorn-horn-black.svg" alt="Unicorn horn" className="w-3 h-3" />
              </div>
              <span className="font-mono uppercase font-semibold text-[10px] tracking-[0.25em]">
                Unicorn
              </span>
              <div className="text-gray-400 hover:text-blue-400 cursor-pointer flex items-center">
                <IoShieldHalfOutline className="w-4 h-4 " />
                <h1 className=" font-mono  font-semibold pl-[2px] text-sm">
                  Pay
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderBanner;
