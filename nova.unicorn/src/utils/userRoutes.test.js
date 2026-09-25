import { getUserDashboardPath } from "./userRoutes";

describe("getUserDashboardPath", () => {
  it("routes Uber drivers to their personal dashboard by role", () => {
    expect(getUserDashboardPath({ role: "uberdriver" })).toBe("/uber-driver");
  });

  it("keeps general vendors on their vendor route", () => {
    expect(getUserDashboardPath({ role: "vendor", vendorType: "pharmacy" })).toBe("/vendor/pharmacy");
  });

  it("sends customers to their storefront", () => {
    expect(getUserDashboardPath({ role: "customer" })).toBe("/customer");
  });
});
