import React from "react";

const ProductSkeleton = () => {
  return (
    <div className="bg-white rounded-md shadow-sm w-full overflow-hidden animate-pulse mt-4">
      <div className="flex items-center justify-between text-white bg-gray-300 opacity-50 p-4 lg:p-6 rounded-t-md" />
      <div className="p-3 w-full flex overflow-x-auto space-x-2">
        {Array(12)
          .fill()
          .map((item, index) => (
            <div
              key={index}
              className="w-44 text-sm cursor-pointer bg-white h-60 flex-shrink-0 hover:shadow-md hover:scale-95"
            />
          ))}
      </div>
    </div>
  );
};

export default ProductSkeleton;
