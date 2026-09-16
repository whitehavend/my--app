import { Navigate } from "react-router-dom";
import { useAppSelector } from "../Store/hooks";

const ProtectedRoleRoute = ({ role, children }) => {
  const { user, status } = useAppSelector((state) => state.auth);

  if (!user && status === "loading" && localStorage.getItem("unicorn_token")) {
    return <div className="flex min-h-[60vh] items-center justify-center">Loading your account...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
};

export default ProtectedRoleRoute;
