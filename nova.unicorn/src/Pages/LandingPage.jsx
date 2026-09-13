import React, { useEffect } from "react";
import Banner from "../components/Banner";
import HeaderBanner from "../components/Header/HeaderBanner";
import Navbar from "../components/Header/Navbar";
import FirstSection from "../components/FirstSection";
import SpecialOffers from "../components/SpecialOffers";
import Trends from "../components/Trends";
import FlashSales from "../components/FlashSales";
import FestivalDeals from "../components/FestivalDeals";
import BestDeals from "../components/BestDeals";
import { useAppDispatch } from "../Store/hooks";
import { getProductByCategory } from "../Store/thunk";
import SmartPhones from "../components/SmartPhones";

const LandingPage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getProductByCategory());
  }, [dispatch]);

  return (
    <div className="flex flex-col items-center  bg-gray-100 ">
      <div className="bg-primary w-full flex items-center justify-center ">
        <Banner
          src="images/festival.gif"
          alt="festival"
          className="w-full lg:w-[90%] h-[50px]"
        />
      </div>
      <HeaderBanner />
      <Navbar />
      <div className="w-full px-3 lg:px-0 lg:w-[80%] 2xl:w-[75%] ">
        <FirstSection />
        <SpecialOffers />
        <Trends />
        <SmartPhones />
        <FestivalDeals />
        <FlashSales />
        <BestDeals />
      </div>
    </div>
  );
};

export default LandingPage;
