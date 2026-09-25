import { Navigate } from "react-router-dom";
import { useAppSelector } from "../Store/hooks";
import { getUserDashboardPath } from "../utils/userRoutes";

const ProtectedRoleRoute = ({ role, vendorType, children }) => {
  const { user, status } = useAppSelector((state) => state.auth);
  const hasStoredToken = Boolean(localStorage.getItem("unicorn_token"));

  if (hasStoredToken && (!user || status === "loading" || status === "idle")) {
    return <div className="flex min-h-[60vh] items-center justify-center">Loading your account...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to={getUserDashboardPath(user)} replace />;
  }

  if (role === "vendor" && vendorType && user.vendorType !== vendorType) {
    return <Navigate to={getUserDashboardPath(user)} replace />;
  }

  return children;
};

export default ProtectedRoleRoute;
