import React from "react";
import ModalWrapper from "./ModalWrapper";

const Deletion = ({closeModal, deleteCart}) => {
  return (
    <ModalWrapper>
      <h1 className="text-lg font-semibold mb-4 text-center">Confirm Deletion</h1>
      <p className="text-sm mb-5 text-center">
        Are you sure you want to delete this product from cart?
      </p>
      <div className="flex items-center justify-between w-full">
        <button onClick={closeModal} className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 hover:text-gray-700 rounded">
          Cancel
        </button>
        <button onClick={deleteCart} className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded">
          Yes
        </button>
      </div>
    </ModalWrapper>
  );
};

export default Deletion;
