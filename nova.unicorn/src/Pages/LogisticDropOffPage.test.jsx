import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import logisticsReducer from "../Store/logistics/LogisticsSlice";
import LogisticDropOffPage from "./LogisticDropOffPage";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

test("selecting an assigned order calculates distance and opens its Google Maps route", async () => {
  axios.get.mockResolvedValue({
    data: {
      requests: [{
        _id: "request-1",
        orderId: "order-1",
        status: "accepted",
        orderStatus: "delivering",
        dropOffAddress: "12 Market Street",
        dropOffLatitude: 1,
        dropOffLongitude: 0,
        dropOffGoogleMapsUrl: "https://www.google.com/maps/search/?api=1&query=1,0",
      }],
    },
  });
  const getCurrentPosition = jest.fn((onSuccess) => onSuccess({ coords: { latitude: 0, longitude: 0 } }));
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: { getCurrentPosition },
  });
  const store = configureStore({ reducer: { logistics: logisticsReducer } });

  render(
    <Provider store={store}>
      <MemoryRouter>
        <LogisticDropOffPage />
      </MemoryRouter>
    </Provider>
  );

  expect(await screen.findByText("12 Market Street")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Calculate distance" }));

  expect(await screen.findByText(/Distance from your location: 111\.2 km/)).toBeInTheDocument();
  const mapsRoute = screen.getByRole("link", { name: /open route in google maps/i });
  expect(mapsRoute.href).toContain("origin=0,0");
  expect(mapsRoute.href).toContain("destination=1,0");
});