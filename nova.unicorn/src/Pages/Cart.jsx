import React, { useEffect, useState } from "react";
import Banner from "../components/Banner";
import HeaderBanner from "../components/Header/HeaderBanner";
import Navbar from "../components/Header/Navbar";
import EmptyCart from "../components/cart/EmptyCart";
import CartCard from "../components/cart/CartCard";
import CartSummary from "../components/cart/CartSummary";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import Alert from "../components/Alert";
import { addToCart, resetNotify } from "../Store/cart/CartSlice";
import FlashSales from "../components/FlashSales";
import { getAllProducts } from "../Store/thunk";

const Cart = () => {
  const { carts, notify, status } = useAppSelector((state) => state.carts);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { products } = useAppSelector((state) => state.products);
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setSavedIds(JSON.parse(localStorage.getItem(`nova_saved_${user.uid}`) || "[]"));
    }
  }, [user]);

  const savedProducts = products.filter((product) => savedIds.includes(product._id || product.id));
  const removeSaved = (productId) => {
    const nextSavedIds = savedIds.filter((id) => id !== productId);
    setSavedIds(nextSavedIds);
    if (user) localStorage.setItem(`nova_saved_${user.uid}`, JSON.stringify(nextSavedIds));
  };

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
      {user?.role === "customer" && (
        <section className="w-full px-4 lg:px-0 lg:w-[80%] 2xl:w-[75%] mb-8">
          <h2 className="mb-3 text-xl font-semibold">Saved items ({savedProducts.length})</h2>
          {!savedProducts.length && <p className="rounded-md bg-white p-5 text-gray-600">You have no saved items yet.</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedProducts.map((product) => {
              const productId = product._id || product.id;
              return (
                <article key={productId} className="rounded-md bg-white p-4 shadow-sm">
                  <img src={product.images?.[0]} alt={product.title} className="h-36 w-full rounded-md object-cover" />
                  <h3 className="mt-3 font-semibold capitalize">{product.title}</h3>
                  <p className="mt-1 font-medium">₦{Number(product.salePrice ?? product.price).toLocaleString()}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => dispatch(addToCart({ product: { ...product, id: productId, price: product.salePrice ?? product.price }, quantity: 1 }))} className="flex-1 rounded-md bg-primary px-3 py-2 text-sm text-white">Add to cart</button>
                    <button onClick={() => removeSaved(productId)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">Remove</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default Cart;
