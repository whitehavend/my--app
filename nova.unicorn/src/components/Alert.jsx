import React from "react";
import { MdCheck } from "react-icons/md";

const Alert = ({message}) => {
  return (
    <div className="bg-[#6dbc28] w-full text-sm font-medium flex gap-2 items-center justify-center py-[10px] text-white fixed top-0 left-0 right-0 z-40">
      <MdCheck className="text-base font-medium" />
      <p>{message}</p>
    </div>
  );
};

export default Alert;
