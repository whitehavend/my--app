import React from "react";
import Banner from "./Banner";
import ComingSoonBanner from "./ComingSoonBanner";
import { useAppSelector } from "../Store/hooks";

const BestDeals = () => {
  const { products } = useAppSelector((state) => state.products);
  const deals = products.filter((product) => product.vendorId && (product.salePrice || product.compareAtPrice));

  if (!deals.length) return <ComingSoonBanner label="Best deals" />;

  return (
    <div className="bg-white rounded-md shadow-sm grid grid-cols-2 gap-2 p-3 mt-5 mb-14">
      {deals.map((deal) => (
        <Banner key={deal._id || deal.id} src={deal.images?.[0]} alt={deal.title} className="h-[150px] md:h-[200px] lg:h-[250px] w-full rounded-md shadow-sm hover:scale-95" />
      ))}
    </div>
  );
};

export default BestDeals;
