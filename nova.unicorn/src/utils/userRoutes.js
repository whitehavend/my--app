export const getUserDashboardPath = (user) => {
  if (!user) return "/login";

  if (user.role === "uberdriver" || user.vendorType === "uberdriver") {
    return "/uber-driver";
  }

  if (user.role === "vendor") {
    return `/vendor/${user.vendorType || "retailshopvendor"}`;
  }

  if (user.role === "blackmarket") return "/blackmarket";
  if (user.role === "admin") return "/collection-officer";
  if (user.role === "collectionOfficer") return "/admin/vendors";
  if (user.role === "customer") return "/customer";

  return `/${user.role || "customer"}`;
};
