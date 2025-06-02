import { Navigate } from "react-router-dom";

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RequireAuth;
