import React, { useState } from "react";
import { MdDeleteOutline } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../../Store/hooks";
import { deleteFromCart, updateCart } from "../../Store/cart/CartSlice";
import Deletion from "../modals/Deletion";

const CartCard = () => {
  const dispatch = useAppDispatch();
  const [showModal, setShowModal] = useState(false);
  const [productId, setProductId] = useState("");
  const { carts } = useAppSelector((state) => state.carts);

  const handleUpdateCart = (id, quantity) => {
    dispatch(updateCart({ productId: id, quantity }));
  };

  const handleIncrement = (cart) => {
    const newQuantity = cart.quantity + 1;
    handleUpdateCart(cart.id, newQuantity);
  };

  const handleDecrement = (cart) => {
    const newQuantity = cart.quantity > 1 ? cart.quantity - 1 : 1;
    handleUpdateCart(cart.id, newQuantity);
  };

  const handleRemoveFromCart = (id) => {
    dispatch(deleteFromCart({ productId}));
  };

  const openModal = (id) => {
    setShowModal(true);
    setProductId(id);
  };

  return (
    <div className="flex flex-col items-start bg-white shadow-md rounded-md w-full">
      <h1 className="font-semibold border-b w-full p-3 text-base">
        Cart ({carts?.length})
      </h1>
      {showModal && (
        <Deletion
          closeModal={() => setShowModal(false)}
          deleteCart={handleRemoveFromCart}
        />
      )}
      {carts.map((cart) => (
        <div
          className="flex items-start flex-col px-3 py-4 w-full border-t border-gray-100"
          key={cart.id}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-start">
              <img
                src={cart?.images[0]}
                alt={cart?.title}
                className="w-20 h-20 rounded-md shadow mr-4"
              />
              <div>
                <h1 className="font-medium text-base lg:text-lg block lg:hidden text-gray-600 leading-5">
                  {`${cart?.title.slice(0, 20)}${cart?.title.slice(0, 20) ? "..." : ""}`}
                </h1>
                <h1 className="font-medium text-base lg:text-lg hidden lg:block text-gray-600 leading-5">
                  {`${cart?.title}`}
                </h1>
                <p className="text-primary text-xs">
                  Stock:{" "}
                  <span className="text-gray-700">
                    {cart?.availabilityStatus}
                  </span>
                </p>
              </div>
            </div>
            <h1 className="font-semibold text-lg">
              ₦{cart?.price}
            </h1>
          </div>
          <div className="pt-2 flex items-center justify-between w-full">
            <h1
              className="text-primary uppercase text-sm lg:text-base flex items-center cursor-pointer"
              onClick={() => openModal(cart.id)}
            >
              <MdDeleteOutline className="mr-3 w-6 h-6" /> Remove
            </h1>
            <div className="flex items-center">
              <button
                onClick={() => handleDecrement(cart)}
                className="bg-primary rounded-sm hover:bg-primary100 px-2.5 py-0.5 lg:px-3 lg:py-1 mr-2 cursor-pointer text-white"
              >
                -
              </button>
              <h1 className="px-3 py-1 mr-2 text-sm lg:text-base">{cart.quantity}</h1>
              <button
                onClick={() => handleIncrement(cart)}
                className="bg-primary cursor-pointer hover:bg-primary100 rounded-sm px-2.5 py-0.5 lg:px-3 lg:py-1 text-white"
              >
                +
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartCard;
