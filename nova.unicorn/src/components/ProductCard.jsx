import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Rating from "./Rating";
import { MdAddShoppingCart, MdBookmarkBorder } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { addToCart, resetNotify } from "../Store/cart/CartSlice";
import { detectVisitorCurrency, formatCurrency } from "../utils/currency";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notify } = useAppSelector((state) => state.carts);
  const { user } = useAppSelector((state) => state.auth);
  const [selectedImage, setSelectedImage] = useState(product.images?.[0] || "images/phones.png");
  const productId = product._id || product.id;
  const isPropertyOrVehicle = product.vendorType === "realestate" || product.vendorType === "cardealer";
  const [isSaved, setIsSaved] = useState(() => user ? JSON.parse(localStorage.getItem(`nova_saved_${user.uid}`) || "[]").includes(productId) : false);
  const [visitorCurrency, setVisitorCurrency] = useState("NGN");
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

  useEffect(() => {
    let ignore = false;

    const resolveVisitorCurrency = async () => {
      try {
        const detectedCurrency = await detectVisitorCurrency(user);
        if (!ignore) setVisitorCurrency(detectedCurrency);
      } catch (error) {
        if (!ignore) setVisitorCurrency("NGN");
      }
    };

    resolveVisitorCurrency();
    return () => { ignore = true; };
  }, [user]);

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
    <section className="space-y-4 text-[#f3f5f7]">
      <div className="grid w-full grid-cols-1 gap-6 rounded-xl border border-white/10 bg-[#101822] p-4 shadow-lg sm:p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <div className="min-w-0">
          <img
            src={imageUrl}
            alt={product.title}
            className="aspect-[4/3] max-h-[520px] w-full rounded-lg bg-[#0b1118] object-contain"
            onError={(event) => { event.currentTarget.src = "images/phones.png"; }}
          />
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {product.images.map((image, index) => (
                <button type="button" key={`${image}-${index}`} onClick={() => setSelectedImage(image)} className={`shrink-0 rounded-md border-2 p-0.5 ${selectedImage === image ? "border-[#7ce6d4]" : "border-white/10"}`} aria-label={`View product image ${index + 1}`}>
                  <img src={image} alt="" className="h-14 w-14 rounded object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="w-full min-w-0">
          <div className="flex items-start text-xs sm:text-sm">
            <span className="mb-1 rounded-sm bg-[#7ce6d4]/15 px-2 py-1 text-[10px] font-bold uppercase text-[#7ce6d4]">
              Official store
            </span>
          </div>
          <h1 className="py-2 text-2xl font-black capitalize sm:text-3xl">{product.title}</h1>
          <h2 className="w-full border-b border-white/10 pb-3 text-sm text-[#aab4c0]">
            Brand: <span className="text-[#7ce6d4]">{product.brand}</span>
          </h2>
          <div className="py-3">
            <h2 className="text-3xl font-black text-[#f3f5f7]">{formatCurrency(product.price, product.currency, { convert: true, localCurrency: visitorCurrency })}</h2>
            {visitorCurrency && visitorCurrency !== product.currency && (
              <p className="mt-1 text-xs text-[#aab4c0]">Original: {formatCurrency(product.price, product.currency)}</p>
            )}
          </div>
          <p className="text-sm text-[#c4c8cc]">Item type: <span className="font-medium capitalize text-[#f3f5f7]">{product.itemCondition || "generic"}</span></p>
          {flashSaleActive && <p className="mt-2 rounded-md border border-red-400/20 bg-red-500/10 p-3 text-xs font-semibold text-red-200">Flash sale: {formatCurrency(product.flashSalePrice, product.currency, { convert: true, localCurrency: visitorCurrency })} · ends in {flashSaleHours}h {flashSaleMinutes}m {flashSaleSeconds}s</p>}
          <p className="mt-2 text-xs text-[#aab4c0]">
            {product.availabilityStatus}
          </p>
          <p className="py-1 text-sm text-[#c4c8cc]">
            {product.shippingInformation}
          </p>
          <Rating rating={product.rating} />
          <div className="my-4 flex flex-wrap gap-2">
            {!isPropertyOrVehicle && (product.sellingMode === "retail" || product.sellingMode === "both" || !product.sellingMode) && <button onClick={() => handleAddToCart(flashSaleActive ? { ...product, price: product.flashSalePrice } : product, 1, "retail")} className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#7ce6d4] py-2.5 text-sm font-bold text-[#071118] shadow-lg hover:bg-[#a7f3d0]"><MdAddShoppingCart className="h-5 w-5" />Retail</button>}
            {!isPropertyOrVehicle && (product.sellingMode === "wholesale" || product.sellingMode === "both") && product.wholesalePrice !== null && product.wholesalePrice !== undefined && <button onClick={() => handleAddToCart(product, 1, "wholesale")} className="flex flex-1 items-center justify-center gap-2 rounded-md border border-white/10 bg-[#0b1118] py-2.5 text-sm font-bold text-[#f3f5f7] shadow-lg hover:border-[#7ce6d4]"><MdAddShoppingCart className="h-5 w-5" />Wholesale</button>}
            {isPropertyOrVehicle && <button type="button" onClick={handleSave} className="flex flex-1 items-center justify-center gap-2 rounded-md border border-white/10 py-2.5 text-sm font-medium text-[#dfe7ee] hover:border-[#7ce6d4] hover:bg-white/5"><MdBookmarkBorder className="h-5 w-5" />{isSaved ? "Saved" : "Save listing"}</button>}
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col items-start rounded-xl border border-white/10 bg-[#101822] shadow-lg">
        <h1 className="w-full border-b border-white/10 p-4 text-base font-semibold">
          Product details
        </h1>
        <p className="p-4 text-sm leading-6 text-[#c4c8cc]">{product.description}</p>
        <h2 className="px-4 pb-4 text-sm font-semibold">
          Weight (kg) <span className="font-normal">:{product.weight}</span>
        </h2>
      </div>
      <div className="flex w-full flex-col items-start rounded-xl border border-white/10 bg-[#101822] text-sm shadow-lg">
        <h1 className="w-full border-b border-white/10 p-4 text-base font-semibold">
          Verified Customer Feedback
        </h1>
        <div className="p-4 flex items-start justify-between w-full">
          <div className="mr-0.5 w-[28%] lg:w-[25%]">
            <h2 className="pb-2 text-sm uppercase lg:text-base">Verified Ratings</h2>
            <div className="flex h-[120px] w-full flex-col items-center justify-center rounded-md border border-white/10 bg-[#0b1118]">
              <h1 className="text-base text-[#7ce6d4] md:text-lg lg:text-xl">{product.rating} / 5</h1>
              <Rating rating={product.rating} />
            </div>
          </div>
          <div className="w-[70%] lg:w-[73%]">
            <h2 className="pb-2 text-sm uppercase lg:text-base">Comments from Verified Purchases</h2>
            {(product.reviews || []).map((review, index) => (
              <div
                key={index}
                className={`py-2 text-[#dfe7ee] ${
                  index !== product.reviews.length - 1 ? "border-b" : ""
                }`}
              >
                <Rating rating={review.rating} />
                <h2 className="py-2">{review.comment}</h2>
                <h2 className="text-xs text-[#aab4c0]">
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
