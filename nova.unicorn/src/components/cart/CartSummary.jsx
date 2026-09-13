import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../Store/hooks";
import { clearCart } from "../../Store/cart/CartSlice";
import { createOrder } from "../../Store/thunk";
import { useNavigate } from "react-router-dom";

const CartSummary = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { carts } = useAppSelector((state) => state.carts);
  const { user } = useAppSelector((state) => state.auth);
  const [submitting, setSubmitting] = useState(false);

  const calculateTotalPrice = carts.reduce((total, cart) => {
    return total + cart.price * cart.quantity;
  }, 0);

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login");
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
            image: item.images?.[0],
          })),
          totalAmount: calculateTotalPrice,
          shippingAddress: {
            city: "Lagos",
            country: "Nigeria",
            address: "Default delivery address",
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
            ₦{calculateTotalPrice.toFixed(2)}
          </h2>
        </div>
        <div className="p-3">
          <button
            onClick={handleCheckout}
            disabled={submitting || carts.length === 0}
            className="bg-primary text-white rounded-md uppercase shadow-lg w-full text-center py-3 flex items-center justify-center relative disabled:opacity-70"
          >
            {submitting ? "Processing..." : `checkout (₦ ${calculateTotalPrice.toFixed(2)})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
