import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { getAllCategories } from "../Store/thunk";


const Categories = () => {
  const dispatch = useAppDispatch();
  const {categories} = useAppSelector((state) => state.categories);
  useEffect(() => {
    dispatch(getAllCategories())
  },[dispatch]);
  // const categories = [
  //   {
  //     icon: <GiCookingPot />,
  //     text: "Appliances",
  //   },
  //   {
  //     icon: <IoPhonePortraitOutline />,
  //     text: "Phones & Tablets",
  //   },
  //   {
  //     icon: <GiLipstick />,
  //     text: "Health & Beauty",
  //   },
  //   {
  //     icon: <IoHome />,
  //     text: "Home & Office",
  //   },
  //   {
  //     icon: <FaTv />,
  //     text: "Electronics",
  //   },
  //   {
  //     icon: <IoShirtOutline />,
  //     text: "Fashion",
  //   },
  //   {
  //     icon: <CiApple />,
  //     text: "Supermarket",
  //   },
  //   {
  //     icon: <IoMdLaptop />,
  //     text: "Computing",
  //   },
  //   {
  //     icon: <PiBaby />,
  //     text: "Baby Products",
  //   },
  //   {
  //     icon: <FaGamepad />,
  //     text: "Gaming",
  //   },
  // ];

  return (
    <div className="bg-white p-3 w-[18%] h-[420px] hidden lg:flex flex-col">
      {categories.slice(0,12).map((item, index) => (
        <div key={index} className="flex items-center text-sm text-gray-600 hover:text-primary cursor-pointer my-1 ">
          <h1 className="capitalize font-normal leading-6 ml-3 ">
            {item}
          </h1>
        </div>
      ))}
      {/* <h1 className="capitalize text-sm text-gray-600 font-normal leading-6">Musical Instruments</h1>
      <div className="flex items-center text-sm text-gray-600 hover:text-primary cursor-pointer my-2 ">
          <TbDotsCircleHorizontal />
          <h1 className="capitalize font-normal leading-6 ml-3 ">Other Categories</h1>
        </div> */}
    </div>
  );
};

export default Categories;
