import React, { useEffect } from "react";
import EmptyCart from "../components/cart/EmptyCart";
import CartCard from "../components/cart/CartCard";
import CartSummary from "../components/cart/CartSummary";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import Alert from "../components/Alert";
import { resetNotify } from "../Store/cart/CartSlice";

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
      <div className="flex h-14 w-full items-center justify-center bg-primary px-4 text-center text-white">
        <span className="text-lg font-black uppercase tracking-[0.22em]">Nova Unicorn</span>
      </div>
      {notify && <Alert message={status} />}
      {carts.length === 0 ? (
        <div className="w-full flex flex-col items-start justify-between px-4 lg:px-0 lg:w-[80%] 2xl:w-[75%] my-4 ">
          <EmptyCart />
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
        </div>
      )}
    </div>
  );
};

export default Cart;
