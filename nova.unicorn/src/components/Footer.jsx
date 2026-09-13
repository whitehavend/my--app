import React from "react";
import FooterSubscription from "./FooterSubscription";
import { FaFacebookF } from "react-icons/fa6";
import { IoLogoYoutube } from "react-icons/io";
import { FaInstagram, FaCcMastercard } from "react-icons/fa";
import { BsTwitter } from "react-icons/bs";
import { RiVisaLine } from "react-icons/ri";
import { SiDhl } from "react-icons/si";
import { MdCopyright } from "react-icons/md";

const Footer = () => {
  return (
    <main className="bg-[#535357]">
      <div className="flex flex-col items-center justify-center bg-[#313133] ">
        <FooterSubscription />
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="text-sm hidden lg:grid grid-cols-4 gap-6 w-full lg:w-[80%] border-b pb-12 2xl:w-[75%]  cursor-pointer text-white mt-6">
          <div>
            <h1 className="font-bold mb-4 uppercase">Need Help?</h1>
            <p>Chat with us</p>
            <p>Help Center</p>
            <p>Contact Us</p>
            <h1 className="font-bold mb-4 mt-5 uppercase">Useful Links</h1>
            <p>Service Center</p>
            <p>How to shop on Unicorn?</p>
            <p>Delivery options and timelines</p>
            <p>How to return a product on Unicorn?</p>
            <p>Corporate and bulk purchases</p>
            <p>Report a Product</p>
            <p>Dispute Resolution Policy</p>
            <p>Returns & Refund Timeline</p>
            <p>Return Policy</p>
          </div>
          <div>
            <h1 className="font-bold mb-4">ABOUT UNICORN</h1>
            <p>About us</p>
            <p>Unicorn careers</p>
            <p>Unicorn Express</p>
            <p>Terms and Conditions</p>
            <p>Privacy Notice</p>
            <p>Unicorn Store Credit Terms & Conditions</p>
            <p>Unicorn Payment Information Guidelines</p>
            <p>Cookie Notice</p>
            <p>Unicorn Global</p>
            <p>Official Stores</p>
            <p>Flash Sales</p>
          </div>
          <div>
            <h1 className="font-bold mb-4">MAKE MONEY WITH UNICORN</h1>
            <p>Sell on Unicorn</p>
            <p>Vendor hub</p>
            <p>Become a Sales Consultant</p>
            <p>Join the Unicorn KOL Program</p>
          </div>
          <div>
            <h1 className="font-bold mb-4">UNICORN INTERNATIONAL</h1>
            <div className="flex items-start">
              <div className="mr-4">
                <p>Algeria</p>
                <p>Egypt</p>
                <p>Ghana</p>
                <p>Ivory Coast</p>
                <p>Kenya</p>
              </div>
              <div>
                <p>Algeria</p>
                <p>Egypt</p>
                <p>Ghana</p>
                <p>Ivory Coast</p>
                <p>Kenya</p>
              </div>
            </div>
          </div>
          <div>
            <h1 className="uppercase font-bold mb-4 ">join us on</h1>
            <div className="flex items-center">
              <FaFacebookF className="mr-4 w-5 h-5" />
              <IoLogoYoutube className="mr-4 w-5 h-5" />
              <FaInstagram className="mr-4 w-5 h-5" />
              <BsTwitter className=" w-5 h-5" />
            </div>
          </div>
          <div>
            <h1 className="uppercase font-bold mb-4 ">
              PAYMENT METHODS & DELIVERY PARTNERS
            </h1>
            <div className="flex items-center">
              <FaCcMastercard className="mr-4 w-5 h-5" />
              <RiVisaLine className="mr-4 w-5 h-5" />
              <SiDhl className=" w-8 h-8" />
            </div>
          </div>
        </div>
        <p className="text-xs lg:text-sm text-white flex items-center pt-2 pb-4 lg:pt-4 lg:pb-8">
          <MdCopyright className="mr-1 w-5 h-5" />
          All rights reserved.
        </p>
      </div>
    </main>
  );
};

export default Footer;
