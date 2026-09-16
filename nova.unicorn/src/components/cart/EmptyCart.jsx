import React from "react";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center flex-col py-10  lg:bg-white lg:shadow-md rounded-md w-full mb-4">
      <FiShoppingCart aria-label="Shopping cart" className="h-24 w-24 text-gray-400" />
      <h1 className="font-semibold text-base leading-5 py-4">
        Your cart is empty!
      </h1>
      <p className="text-sm text-gray-500 leading-4">
        Browse our categories and discover our best deals!
      </p>
      <button
      onClick={() => navigate("/")}
            className="bg-primary text-white rounded-md uppercase shadow-lg w-[70%] lg:w-[25%] mt-8 text-center py-3 flex items-center justify-center relative"
          >
            start shopping
          </button>
    </div>
  );
};

export default EmptyCart;
