import React, { useState, useEffect } from "react";
import { MdDiscount } from "react-icons/md";
import { FaChevronRight } from "react-icons/fa6";
import { useAppSelector } from "../Store/hooks";
import ComingSoonBanner from "./ComingSoonBanner";
import { formatCurrency } from "../utils/currency";

const FlashSales = () => {
  const { products } = useAppSelector((state) => state.products);
  const [timeLeft, setTimeLeft] = useState(6 * 60 * 60 * 1000);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1000) {
          return 6 * 60 * 60 * 1000;
        }
        return prevTime - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (time) => {
    const hours = Math.floor(time / (60 * 60 * 1000));
    const minutes = Math.floor((time % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((time % (60 * 1000)) / 1000);

    return `${hours}h : ${minutes}m : ${seconds}s`;
  };

  const salesItems = products
    .filter((product) => product.vendorId && product.salePrice !== null && product.salePrice !== undefined)
    .map((product) => ({
      image: product.images?.[0],
      name: product.title,
      price: formatCurrency(product.compareAtPrice ?? product.price, product.currency),
      discountedPrice: formatCurrency(product.salePrice, product.currency),
      itemsLeft: product.stock,
      percentage: product.stock ? Math.min(100, Math.max(5, product.stock)) : 0,
    }));

  if (!salesItems.length) return <ComingSoonBanner label="Flash sales" />;

  return (
    <div className="bg-white rounded-md shadow-sm w-full overflow-hidden">
      <div className="flex items-center justify-between text-white bg-red-600 p-3 lg:p-4 rounded-t-md">
        <div className="flex items-start flex-col">
          <div className="flex items-center">
            <MdDiscount className="text-primary mr-2" />
            <h1 className="text-white font-bold capitalize text-sm md:text-base lg:text-lg">
              Flash sales
            </h1>
          </div>
          <h1 className="font-semibold block lg:hidden text-xs md:text-sm lg:text-lg">
            <span className="capitalize font-normal">Time left : </span>
            {formatTime(timeLeft)}
          </h1>
        </div>
        <h1 className="font-semibold hidden lg:flex text-sm md:text-base lg:text-lg">
          <span className="capitalize font-normal">Time left : </span>
          {formatTime(timeLeft)}
        </h1>
        <div className="flex items-center text-xs lg:text-sm cursor-pointer">
          <h1 className="uppercase font-medium ">See all</h1>
          <FaChevronRight />
        </div>
      </div>
      <div className="p-3 w-full flex overflow-x-auto space-x-2">
        {salesItems.map((item, index) => (
          <div
            key={index}
            className="w-36 md:w-40 lg:w-44 text-sm flex-shrink-0 hover:shadow-md hover:scale-95"
          >
            <img
              src={item.image}
              alt={item.name}
              className="rounded-md h-28 md:h-32 lg:h-36 w-full object-cover"
            />
            <div className="p-2">
              <h1 className="text-gray-600 text-xs lg:text-sm capitalize ">
                {item.name.slice(0, 20)}
              </h1>
              <h2 className=" text-sm lg:text-base mt-0.5">{item.discountedPrice}</h2>
              <h2 className="text-gray-500 line-through text-[10px] mb-0.5">
                {item.price}
              </h2>
              <p className="text-xs">{item.itemsLeft} items left</p>
              <div className="w-full bg-gray-200 h-3 rounded-lg">
                <div
                  className="h-3 bg-primary rounded-lg"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashSales;
