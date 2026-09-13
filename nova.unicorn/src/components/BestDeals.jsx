import React from "react";
import Banner from "./Banner";

const BestDeals = () => {
  const deals = [];

  if (!deals.length) return null;

  return (
    <div className="bg-white rounded-md shadow-sm grid grid-cols-2 gap-2 p-3 mt-5 mb-14">
      {deals.map((deal, index) => (
        <Banner key={index} src={deal.image} alt={deal.alt} className="h-[150px] md:h-[200px] lg:h-[250px] w-full rounded-md shadow-sm hover:scale-95" />
      ))}
    </div>
  );
};

export default BestDeals;
