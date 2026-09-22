import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Rating from "./Rating";
import { MdAddShoppingCart, MdBookmarkBorder } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { addToCart, resetNotify } from "../Store/cart/CartSlice";
import { formatCurrency } from "../utils/currency";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notify } = useAppSelector((state) => state.carts);
  const { user } = useAppSelector((state) => state.auth);
  const [selectedImage, setSelectedImage] = useState(product.images?.[0] || "images/phones.png");
  const productId = product._id || product.id;
  const [isSaved, setIsSaved] = useState(() => user ? JSON.parse(localStorage.getItem(`nova_saved_${user.uid}`) || "[]").includes(productId) : false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (notify) {
      setTimeout(() => {
        navigate("/cart");
        dispatch(resetNotify());
      }, 1000);
    }
  }, [notify, navigate, dispatch]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const flashSaleEndsAt = product.retailPricingType === "flash_sale" ? new Date(product.flashSaleEndsAt).getTime() : 0;
  const flashSaleRemaining = flashSaleEndsAt - now;
  const flashSaleActive = product.flashSalePrice !== null && product.flashSalePrice !== undefined && Number.isFinite(flashSaleRemaining) && flashSaleRemaining > 0;
  const flashSaleHours = Math.floor(flashSaleRemaining / 3600000);
  const flashSaleMinutes = Math.floor((flashSaleRemaining % 3600000) / 60000);
  const flashSaleSeconds = Math.floor((flashSaleRemaining % 60000) / 1000);

  const handleAddToCart = (product, quantity, priceType = "retail") => {
    if (!user || user.role !== "customer") {
      navigate("/login");
      return;
    }
    const selectedPrice = priceType === "wholesale" ? product.wholesalePrice : product.price;
    dispatch(addToCart({ product: { ...product, price: selectedPrice, priceType }, quantity }));
  };

  const handleSave = () => {
    if (!user || user.role !== "customer") {
      navigate("/login");
      return;
    }

    const savedKey = `nova_saved_${user.uid}`;
    const savedIds = JSON.parse(localStorage.getItem(savedKey) || "[]");
    const nextSavedIds = savedIds.includes(productId)
      ? savedIds.filter((id) => id !== productId)
      : [...savedIds, productId];
    localStorage.setItem(savedKey, JSON.stringify(nextSavedIds));
    setIsSaved(nextSavedIds.includes(productId));
  };

  const imageUrl = selectedImage || "images/phones.png";

  return (
    <section>
      <div className="flex items-start bg-white shadow-md rounded-md w-full">
        <div>
          <img
            src={imageUrl}
            alt={product.title}
            className="h-[200px] w-[300px]"
            onError={(event) => { event.currentTarget.src = "images/phones.png"; }}
          />
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button type="button" key={`${image}-${index}`} onClick={() => setSelectedImage(image)} className={`shrink-0 rounded-md border-2 p-0.5 ${selectedImage === image ? "border-primary" : "border-transparent"}`} aria-label={`View product image ${index + 1}`}>
                  <img src={image} alt="" className="h-14 w-14 rounded object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 w-full">
          <div className="text-[10px] flex flex-col lg:flex-row text-xs lg:text-sm items-start lg:items-center">
            <h1 className="bg-[#276076] text-white p-0.5 lg:p-1 rounded-sm shadow capitalize mr-2 mb-1 lg:mb-0">
              Official store
            </h1>
            <h1 className="bg-primary text-white p-0.5 lg:p-1 rounded-sm shadow capitalize">
              Jumai festival deal
            </h1>
          </div>
          <h1 className="capitalize py-1.5 lg:py-2">{product.title}</h1>
          <h2 className="text-xs border-b w-full border-gray-100 pb-2 lg:pb-3">
            Brand: <span className="text-sky-600">{product.brand}</span>
          </h2>
          <h1 className="text-xl py-1">{formatCurrency(product.price, product.currency)}</h1>
          <p className="text-xs text-gray-600">Item type: <span className="capitalize font-medium">{product.itemCondition || "generic"}</span></p>
          {flashSaleActive && <p className="mt-2 rounded-md bg-red-50 p-2 text-xs font-semibold text-red-700">Flash sale: {formatCurrency(product.flashSalePrice, product.currency)} · ends in {flashSaleHours}h {flashSaleMinutes}m {flashSaleSeconds}s</p>}
          <p className="text-[10px] text-gray-500">
            {product.availabilityStatus}
          </p>
          <p className="text-xs text-gray-600 py-1">
            {product.shippingInformation}
          </p>
          <Rating rating={product.rating} />
          <div className="my-4 flex flex-wrap gap-2">
            {(product.sellingMode === "retail" || product.sellingMode === "both" || !product.sellingMode) && <button onClick={() => handleAddToCart(flashSaleActive ? { ...product, price: product.flashSalePrice } : product, 1, "retail")} className="bg-primary text-white rounded-md shadow-lg flex-1 py-2.5 text-sm flex items-center justify-center gap-2"><MdAddShoppingCart className="w-5 h-5" />Retail</button>}
            {(product.sellingMode === "wholesale" || product.sellingMode === "both") && product.wholesalePrice !== null && product.wholesalePrice !== undefined && <button onClick={() => handleAddToCart(product, 1, "wholesale")} className="bg-slate-800 text-white rounded-md shadow-lg flex-1 py-2.5 text-sm flex items-center justify-center gap-2"><MdAddShoppingCart className="w-5 h-5" />Wholesale</button>}
          </div>
          <button type="button" onClick={handleSave} className="flex w-full items-center justify-center gap-2 rounded-md border border-primary py-2.5 text-sm font-medium text-primary hover:bg-gray-50">
            <MdBookmarkBorder className="h-5 w-5" />
            {isSaved ? "Saved item" : "Save item"}
          </button>
        </div>
      </div>
      <div className="flex flex-col items-start bg-white shadow-md rounded-md w-full my-4">
        <h1 className="font-semibold border-b w-full p-3 text-base">
          Product details
        </h1>
        <p className="text-sm text-gray-600 p-4">{product.description}</p>
        <h2 className="font-semibold text-sm px-4 pb-4">
          Weight (kg) <span className="font-normal">:{product.weight}</span>
        </h2>
      </div>
      <div className="flex flex-col items-start text-sm bg-white shadow-md rounded-md w-full my-4">
        <h1 className="font-semibold border-b w-full p-3 text-sm lg:text-base">
          Verified Customer Feedback
        </h1>
        <div className="p-4 flex items-start justify-between w-full">
          <div className="w-[28%] lg:w-[25%] mr-0.5">
            <h2 className="uppercase pb-2 text-sm lg:text-base">Verified Ratings</h2>
            <div className="flex items-center justify-center flex-col h-[120px] w-full bg-gray-100 rounded-md">
              <h1 className="text-primary text-base md:text-lg lg:text-xl">{product.rating} / 5</h1>
              <Rating rating={product.rating} />
            </div>
          </div>
          <div className="w-[70%] lg:w-[73%]">
            <h2 className="uppercase pb-2 text-sm lg:text-base">Comments from Verified Purchases</h2>
            {product.reviews.map((review, index) => (
              <div
                key={index}
                className={`py-2 ${
                  index !== product.reviews.length - 1 ? "border-b" : ""
                }`}
              >
                <Rating rating={review.rating} />
                <h2 className=" py-2">{review.comment}</h2>
                <h2 className="text-gray-500 text-xs">
                  {new Date(review.date).toLocaleDateString()} by{" "}
                  {review.reviewerName}
                </h2>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCard;
