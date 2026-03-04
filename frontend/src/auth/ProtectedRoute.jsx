import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, adminOnly }) {

  const token = localStorage.getItem("token");

  // If not logged in → go to login
  if (!token) {
    return <Navigate to="/" />;
  }

  // For now allow admin pages if logged in
  // (we will refine later)

  return children;
}