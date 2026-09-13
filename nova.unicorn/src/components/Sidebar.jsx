import React from "react";
import { FaChevronRight } from "react-icons/fa";
import { BsBox2 } from "react-icons/bs";
import { MdOutlineRateReview } from "react-icons/md";
import { CiDiscount1 } from "react-icons/ci";
import { FaRegHeart } from "react-icons/fa";

const Sidebar = () => {
  const navItems = [
    {
      icon: <BsBox2 />,
      text: "orders",
    },
    {
      icon: <MdOutlineRateReview />,
      text: "pending reviews",
    },
    {
      icon: <CiDiscount1 />,
      text: "voucher",
    },
    {
      icon: <FaRegHeart />,
      text: "saved items",
    },
  ];

  return (
    <div className="flex flex-col items-start  h-screen w-full">
      <div className="flex items-center text-xs justify-between w-full border-y border-gray-200 p-3">
        <h1 className="uppercase ">need help?</h1>
        <FaChevronRight className="" />
      </div>
      <div className="flex items-center text-xs justify-between w-full mb-1  p-3">
        <h1 className="uppercase ">My Unicorn account</h1>
        <FaChevronRight className="" />
      </div>
      {navItems.map((item, index) => (
        <div key={index} className="flex items-center text-base my-2 px-3">
          {item.icon}
          <h1 className="capitalize font-normal leading-6 ml-3 ">{item.text}</h1>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
