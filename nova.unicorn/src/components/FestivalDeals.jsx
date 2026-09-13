import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { FaChevronRight } from "react-icons/fa6";
import { getAllProducts } from "../Store/thunk";
import { useNavigate } from "react-router-dom";
import ProductSkeleton from "./preloader/ProductSkeleton";

const FestivalDeals = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { products, status, error } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  if (status === "failed") {
    return <div>Error: {error}</div>;
  }

  const handleProductClick = (product) => {
    navigate(`/${product.title.toLowerCase()}`, { state: { product } });
  };

  return (
    <>
      {status === "loading" ? (
        <ProductSkeleton />
      ) : (
        <div className="bg-white rounded-md shadow-sm w-full overflow-hidden my-5">
          <div className="flex items-center justify-between text-white bg-[#4B158D] p-4 rounded-t-md">
            <h1 className="text-white font-bold capitalize text-sm md:text-base lg:text-lg">
              Unicorn Festival Deals
            </h1>
            <div className="flex items-center text-xs lg:text-sm cursor-pointer">
              <h1 className="uppercase font-medium ">See all</h1>
              <FaChevronRight />
            </div>
          </div>
          <div className="p-3 w-full grid grid-cols-3 md:grid-cols-4  lg:grid-cols-6 gap-2">
            {products.slice(0, 18).map((product, index) => (
              <div
                key={index}
                className=" text-sm hover:shadow-md rounded-md hover:scale-95 cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="rounded-md h-40 md:h-44 lg:h-48 w-full object-cover"
                />
                <div className="p-2">
                  <h1 className="text-gray-600 text-sm flex md:hidden capitalize ">
                    {`${product.title.slice(0, 9)} ${product.title.length > 6 ? "..." : ""} `}
                  </h1>
                  <h1 className="text-gray-600 text-sm hidden md:flex capitalize ">
                    {`${product.title.slice(0, 19)} ${product.title.length > 20 ? "..." : ""} `}
                  </h1>
                  <h2 className="text-base mt-1">
                    ₦{product.price.toLocaleString()}
                  </h2>
                  <h2 className="text-gray-500 line-through text-xs mb-1">
                    ₦{product.price.toLocaleString()}
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

export default FestivalDeals;
