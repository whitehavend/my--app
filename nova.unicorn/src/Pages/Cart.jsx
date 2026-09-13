import React, { useEffect } from "react";
import Banner from "../components/Banner";
import HeaderBanner from "../components/Header/HeaderBanner";
import Navbar from "../components/Header/Navbar";
import EmptyCart from "../components/cart/EmptyCart";
import CartCard from "../components/cart/CartCard";
import CartSummary from "../components/cart/CartSummary";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import Alert from "../components/Alert";
import { resetNotify } from "../Store/cart/CartSlice";
import FlashSales from "../components/FlashSales";

const Cart = () => {
  const { carts, notify, status } = useAppSelector((state) => state.carts);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (notify) {
      setTimeout(() => {
        dispatch(resetNotify());
      }, 1000);
    }
  }, [dispatch, notify]);

  return (
    <div className="flex flex-col items-center  bg-gray-100 ">
      <div className="bg-primary w-full flex items-center justify-center ">
        <Banner
          src="images/festival.gif"
          alt="festival"
          className="w-full lg:w-[90%] h-[50px]"
        />
      </div>
      <HeaderBanner />
      <Navbar />
      {notify && <Alert message={status} />}
      {carts.length === 0 ? (
        <div className="w-full flex flex-col items-start justify-between px-4 lg:px-0 lg:w-[80%] 2xl:w-[75%] my-4 ">
          <EmptyCart />
          <FlashSales />
        </div>
      ) : (
        <div className="w-full flex  flex-col items-start justify-between px-4 lg:px-0 lg:w-[80%] 2xl:w-[75%] my-4 ">
          <div className="w-full flex lg:flex-row flex-col items-start justify-between mb-6 lg:mb-10">
            <div className="w-full lg:w-[71%]">
              <CartCard />
            </div>
            <div className="w-full lg:w-[28%]">
              <CartSummary />
            </div>
          </div>
          <FlashSales />
        </div>
      )}
    </div>
  );
};

export default Cart;
