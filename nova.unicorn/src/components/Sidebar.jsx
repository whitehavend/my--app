import React from "react";
import { FaChevronRight } from "react-icons/fa";
import { BsBox2 } from "react-icons/bs";
import { FaRegHeart } from "react-icons/fa";
import { Link } from "react-router-dom";

const Sidebar = () => {
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
      <Link to="/orders" className="flex items-center text-base my-2 px-3">
        <BsBox2 />
        <span className="capitalize font-normal leading-6 ml-3">Orders</span>
      </Link>
      <Link to="/saved-items" className="flex items-center text-base my-2 px-3">
        <FaRegHeart />
        <span className="capitalize font-normal leading-6 ml-3">Saved items</span>
      </Link>
    </div>
  );
};

export default Sidebar;
