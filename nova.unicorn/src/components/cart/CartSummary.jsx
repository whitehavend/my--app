import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../Store/hooks";
import { clearCart } from "../../Store/cart/CartSlice";
import { createOrder } from "../../Store/thunk";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/currency";

const CartSummary = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { carts } = useAppSelector((state) => state.carts);
  const { user } = useAppSelector((state) => state.auth);
  const [submitting, setSubmitting] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.deliveryAddress || "");
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const currencies = [...new Set(carts.map((cart) => cart.currency || "NGN"))];
  const summaryCurrency = currencies.length === 1 ? currencies[0] : "USD";

  const calculateTotalPrice = carts.reduce((total, cart) => {
    return total + cart.price * cart.quantity;
  }, 0);

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!deliveryLocation) {
      setLocationError("Pin your delivery location before checking out.");
      return;
    }

    setSubmitting(true);

    try {
      const resultAction = await dispatch(
        createOrder({
          items: carts.map((item) => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            priceType: item.priceType || "retail",
            currency: item.currency || "NGN",
            image: item.images?.[0],
          })),
          totalAmount: calculateTotalPrice,
          shippingAddress: {
            address: deliveryAddress.trim(),
            latitude: deliveryLocation.latitude,
            longitude: deliveryLocation.longitude,
            googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${deliveryLocation.latitude},${deliveryLocation.longitude}`,
          },
          paymentMethod: "cash_on_delivery",
        })
      );

      if (createOrder.fulfilled.match(resultAction)) {
        dispatch(clearCart());
        navigate("/orders");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-start text-sm bg-white shadow-md rounded-md w-full mt-6 lg:mt-0">
      <h1 className="font-semibold uppercase border-b w-full p-3 text-base hidden lg:block">
        Cart summary
      </h1>
      <div className="w-full">
        <div className="flex items-center justify-between border-b py-3">
          <p className="text-sm text-gray-500 px-3">Subtotal</p>
          <h2 className="text-lg font-semibold px-3">
            {formatCurrency(calculateTotalPrice, summaryCurrency)}
          </h2>
        </div>
        <div className="border-b p-3">
          <p className="text-sm font-semibold text-gray-700">Delivery location</p>
          <input value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder="Delivery address or landmark" className="mt-2 w-full rounded-md border border-gray-300 p-2 text-sm" />
          <button type="button" onClick={() => { setLocationError(""); if (!navigator.geolocation) { setLocationError("Location services are not available in this browser."); return; } navigator.geolocation.getCurrentPosition((position) => setDeliveryLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }), () => setLocationError("Allow location access so we can pin the delivery point.")); }} className="mt-2 w-full rounded-md border border-primary px-3 py-2 text-sm font-semibold text-primary">{deliveryLocation ? "Delivery location pinned" : "Pin delivery location on Google Maps"}</button>
          {deliveryLocation && <a href={`https://www.google.com/maps/search/?api=1&query=${deliveryLocation.latitude},${deliveryLocation.longitude}`} target="_blank" rel="noreferrer" className="mt-2 block text-xs font-medium text-primary underline">Open pinned location in Google Maps</a>}
          {locationError && <p className="mt-2 text-xs text-red-600">{locationError}</p>}
        </div>
        <div className="p-3">
          <button
            onClick={handleCheckout}
            disabled={submitting || carts.length === 0}
            className="bg-primary text-white rounded-md uppercase shadow-lg w-full text-center py-3 flex items-center justify-center relative disabled:opacity-70"
          >
            {submitting ? "Processing..." : `checkout (${formatCurrency(calculateTotalPrice, summaryCurrency)})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
