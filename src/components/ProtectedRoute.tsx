import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/auth";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/admin" replace />;
}
