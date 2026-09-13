import React from "react";

const SpecialOffers = () => {
  const offers = [
    {
      image: "images/new-arrivals.gif",
      text: "new arrivals",
    },
    {
      image: "images/clearance-sales.png",
      text: "clearance sales",
    },
    {
      image: "images/appliances.png",
      text: "applainces deals",
    },
    {
      image: "images/phones.png",
      text: "phones & tablet deals",
    },
    {
      image: "images/beverages.gif",
      text: "beverages",
    },
    {
      image: "images/fashion.gif",
      text: "fashion deals",
    },
    {
      image: "images/renewed.jpg",
      text: "starting from ₦65,000",
    },
    {
      image: "images/special-offer.png",
      text: "special offers",
    },
    {
      image: "images/beauty.png",
      text: "beauty deals",
    },
    {
      image: "images/mobile-accesories.png",
      text: "mobile accessories",
    },
    {
      image: "images/electronic.png",
      text: "electronics deals",
    },
    {
      image: "images/home-essentials.png",
      text: "home essentials",
    },
  ];

  return (
    <div className="bg-white p-2 lg:p-3  mt-[2.5rem] lg:mt-5 rounded-md shadow-md grid grid-cols-4 lg:grid-cols-6 gap-1 lg:gap-2">
      {offers.map((offer, index) => (
        <div className="hover:scale-95 " key={index}>
            <img src={offer.image} alt={offer.text} className="rounded-md shadow-sm"/>
            <h1 className="text-xs lg:text-sm text-gray-600 text-center capitalize">{offer.text}</h1>
        </div>
      ))}
    </div>
  );
};

export default SpecialOffers;
