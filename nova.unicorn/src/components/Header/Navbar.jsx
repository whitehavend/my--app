import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BiSearchAlt2 } from "react-icons/bi";
import { BsPerson } from "react-icons/bs";
import { BsBox2 } from "react-icons/bs";
import { FaChevronDown } from "react-icons/fa";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa";
import { useAppSelector } from "../../Store/hooks";
import { formatEmail } from "../../utils/formatEmail";
import Help from "./Help";
import Account from "./Account";

const Navbar = () => {
  const [showHelp, setShowHelp] = useState(false);
  const [showAcct, setShowAcct] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  let name;
  if (user) {
    name = formatEmail(user?.email);
  }

  const openHelp = () => {
    setShowHelp(!showHelp);
    setShowAcct(false);
  };

  const openAcct = () => {
    setShowAcct(!showAcct);
    setShowHelp(false);
  };

  return (
    <>
      <nav className="w-full ">
        <div className="items-center shadow-md justify-center hidden py-4  bg-white lg:flex">
          <div className="w-[80%] flex items-center justify-between ">
            <div className="flex items-center gap-3">
              <div
                onClick={openAcct}
                className={`flex items-center text-black hover:text-primary cursor-pointer ${
                  showAcct && "bg-gray-100 rounded-md"
                }`}
              >
                <BsPerson className="w-5 h-5" />
                <span className="mx-2">{user?.username || name || "Account"}</span>
                <FaChevronDown className="w-3 h-3" />
              </div>
              {showAcct && <Account />}
              <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono uppercase text-[1.65rem] font-black tracking-[0.18em] leading-none text-black">
                  Nova
                </span>
                <img src="images/unicorn-horn-black.svg" alt="Unicorn horn" className="w-5 h-5" />
              </div>
              <span className="font-mono uppercase text-[1.1rem] font-semibold tracking-[0.32em] text-black">
                Unicorn
              </span>
              </Link>
            </div>
            <div className="flex w-[80%]">
              <div className="flex flex-1 items-center">
                <div className="relative flex-1">
                  <input
                    type="search"
                    placeholder="search products, brands and categories"
                    className="w-full p-2 pl-10 placeholder:text-base text-base text-black rounded-md outline-none border-gray-500 border"
                  />
                  <BiSearchAlt2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
                <button className="flex ml-2 items-center text-sm px-4 py-3 text-white uppercase rounded-md shadow-md bg-primary100 font-medium">
                  Search
                </button>
              </div>

              <div className="flex ml-2">
                <div
                  onClick={openHelp}
                  className={`flex items-center px-3 text-black hover:text-primary cursor-pointer ${
                    showHelp && " bg-gray-100 rounded-md"
                  }`}
                >
                  <FaRegCircleQuestion className="w-5 h-5 " />
                  <span className="mx-3 ">Help</span>
                  <FaChevronDown className=" w-3 h-3  " />
                </div>
                {showHelp && <Help />}
                <Link to="/orders" className="flex items-center gap-2 px-3 text-black hover:text-primary">
                  <BsBox2 className="w-5 h-5" />
                  <span>Orders</span>
                </Link>
                <Link to="/saved-items" className="flex items-center gap-2 px-3 text-black hover:text-primary">
                  <FaRegHeart className="w-5 h-5" />
                  <span>Saved items</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* mobile */}
        <div className="flex items-center justify-between p-4 bg-white lg:hidden">
          <div className="flex">
            <Link to={user ? "/account" : "/login"} className="mr-3 flex items-center gap-1 text-xs">
              <BsPerson className="w-6 h-6" />
              <span>{user?.username || "Account"}</span>
            </Link>
            <Link to="/" className="flex items-center">
              <span className="font-mono text-lg font-black uppercase tracking-[0.16em] text-black">
                NOVA
              </span>
            </Link>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <Link to="/orders" className="flex shrink-0 items-center gap-1 text-[11px]">
              <BsBox2 className="h-5 w-5" />
              <span>Orders</span>
            </Link>
            <Link to="/saved-items" className="flex shrink-0 items-center gap-1 text-[11px]">
              <FaRegHeart className="h-5 w-5" />
              <span>Saved</span>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
