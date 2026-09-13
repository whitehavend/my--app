import React from "react";
import Banner from "./Banner";

const Trends = () => {
  const trends = [
    {
      image: "images/trendy.gif",
      alt: "trendy",
    },
    {
      image: "images/WATCHING.gif",
      alt: "watching",
    },
    {
      image: "images/boiling.gif",
      alt: "boiling",
    },
  ];

  return (
    <div className="bg-white rounded-md shadow-sm grid grid-cols-3 gap-2 p-3 my-5">
      {trends.map((trend, index) => (
        <Banner key={index} src={trend.image} alt={trend.alt} className="h-[150px] md:h-[200px] lg:h-[250px] w-full rounded-md shadow-sm hover:scale-95" />
      ))}
    </div>
  );
};

export default Trends;
