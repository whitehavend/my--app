import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { IoMail } from "react-icons/io5";
import { IoMdCheckbox } from "react-icons/io";
import { FaApple, FaGooglePlay } from "react-icons/fa";

const FooterSubscription = () => {
    const [isClicked, setIsClicked] = useState(false);

  return (
    <div className="w-full lg:w-[80%] 2xl:w-[75%]">
      <div className="hidden lg:grid lg:grid-cols-4 gap-3 rounded-2xl border border-white/10 bg-[#0b1118] p-6 shadow-[0_12px_24px_rgba(124,230,212,0.08)]">
        <Link to="/" className="flex items-center w-[30%] gap-2">
          <h1 className="font-mono text-[#f3f5f7] uppercase font-semibold pr-[2px] text-2xl">
            Unicorn
          </h1>
          <img src="images/unicorn-horn-black.svg" alt="Unicorn horn" className="w-4 h-4" />
        </Link>
        <div className="text-sm text-white col-span-2 ">
          <h1 className="font-semibold uppercase text-[#f3f5f7]">New to Unicorn?</h1>
          <h2 className="text-xs text-[#dfe7ee]">
            Subscribe to our newsletter to get updates on our latest offers!
          </h2>
          <div className="flex items-center my-4">
            <div className="relative mr-2">
              <input
                type="text"
                placeholder="Enter E-mail Address"
                className="w-full h-12 pl-10 placeholder:text-base text-base text-[#f3f5f7] rounded-md outline-none border border-white/10 bg-[#101822]"
              />
              <IoMail className="absolute w-6 h-6 left-2 top-1/2 transform -translate-y-1/2 text-[#a8b0bb]" />
            </div>
            <div className="flex items-center justify-center border border-white/10 bg-[#101822] px-6 h-12 rounded-md text-[#f3f5f7]">
              <h1 className="uppercase">Male</h1>
            </div>
            <div className="flex items-center justify-center border border-white/10 bg-[#101822] px-6 h-12 rounded-md ml-2 text-[#f3f5f7]">
              <h1 className="uppercase">feMale</h1>
            </div>
          </div>
          <div className="flex mt-6">
            <div className="flex items-center justify-center cursor-pointer hover:bg-white/5 rounded-[50%] p-2 h-fit ml-[-7px] mr-1">
              {isClicked ? (
                <IoMdCheckbox
                  onClick={() => setIsClicked(!isClicked)}
                  className="text-[#7ce6d4] w-5 h-5"
                />
              ) : (
                <MdOutlineCheckBoxOutlineBlank
                  onClick={() => setIsClicked(!isClicked)}
                  className="w-5 h-5 text-[#a8b0bb]"
                />
              )}
            </div>
            <p className="text-[#a8b0bb] w-[50%]">
              I agree to Unicorn’s Privacy and Cookie Policy. You can unsubscribe
              from newsletters at any time.
              <br />
              <span className="text-[#7ce6d4]">I accept the Legal Terms</span>
            </p>
          </div>
        </div>
        <div className="text-sm text-white ">
          <div className="flex items-start">
            <div className="bg-[#7ce6d4] p-2 rounded-md mr-2">
              <img src="images/unicorn-horn-black.svg" alt="Unicorn horn" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-semibold uppercase pb-1 text-[#f3f5f7]">
                DOWNLOAD UNICORN FREE APP
              </h1>
              <h2 className="text-xs text-[#dfe7ee]">Get access to exclusive offers!</h2>
            </div>
          </div>
          <div className="flex items-center mt-4 text-[#f3f5f7]">
            <div className="flex items-center cursor-pointer hover:text-[#7ce6d4] mr-2">
              <FaApple className="w-6 h-6" />
              <h1 className="text-[7px] leading-3">
                Download on the <br />{" "}
                <span className="text-xs font-medium">App Store</span>
              </h1>
            </div>
            <div className="flex items-center cursor-pointer hover:text-[#7ce6d4]">
              <FaGooglePlay className="w-6 h-6" />
              <h1 className="text-[7px]">
                GET IT ON <br />{" "}
                <span className="text-xs font-medium">Google Play</span>
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div className="grid lg:hidden grid-cols-3 gap-3 p-6 text-[#dfe7ee]">
        <h1 className="text-xs uppercase">Chat with us</h1>
        <h1 className="text-xs uppercase">help center</h1>
        <h1 className="text-xs uppercase">Contact us</h1>
        <h1 className="text-xs uppercase">terms & conditions</h1>
        <h1 className="text-xs uppercase">privary notice</h1>
        <h1 className="text-xs uppercase">cookie notice</h1>
        <h1 className="text-xs uppercase">become a seller</h1>
        <h1 className="text-xs uppercase">report a product</h1>
        <h1 className="text-xs uppercase">anniversary deals</h1>
      </div>
    </div>
  );
};

export default FooterSubscription;
