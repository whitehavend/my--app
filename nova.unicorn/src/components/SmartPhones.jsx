import React from "react";
import { FaChevronRight } from "react-icons/fa6";
import { useAppSelector } from "../Store/hooks";
import { useNavigate } from "react-router-dom";
import ProductSkeleton from "./preloader/ProductSkeleton";

const SmartPhones = () => {
  const { productCategory, status } = useAppSelector((state) => state.products);
  const navigate = useNavigate();

  const handleProductClick = (product) => {
    navigate(`/${product.title.toLowerCase()}`, { state: { product } });
  };

  return (
    <>
      {status === "loading" ? (
        <ProductSkeleton />
      ) : (
        <div className="bg-white rounded-md shadow-sm w-full overflow-hidden">
          <div className="flex items-center justify-between text-white bg-sky-600 p-3 lg:p-4 rounded-t-md">
            <div className="flex items-center">
              <h1 className="text-white font-bold capitalize text-sm md:text-base lg:text-lg">
                Smartphones
              </h1>
            </div>
            <div className="flex items-center text-xs lg:text-sm cursor-pointer">
              <h1 className="uppercase font-medium ">See all</h1>
              <FaChevronRight />
            </div>
          </div>
          <div className="p-3 w-full flex overflow-x-auto space-x-2">
            {productCategory.map((item, index) => (
              <div
                key={index}
                onClick={() => handleProductClick(item)}
                className=" w-36 md:w-40 lg:w-44 text-sm cursor-pointer rounded-md flex-shrink-0 hover:shadow-md hover:scale-95"
              >
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="rounded-md h-40 md:h-44 lg:h-48 w-full object-cover"
                />
                <div className="p-1.5 lg:p-2">
                  <h1 className="text-gray-600 text-sm capitalize">
                    {item.title.slice(0, 20)}
                  </h1>
                  <h2 className="text-base mt-1">
                    ₦{item.price.toLocaleString()}
                  </h2>
                  <h2 className="text-gray-500 line-through text-xs mb-1">
                    ₦{item.price.toLocaleString()}
                  </h2>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default SmartPhones;
