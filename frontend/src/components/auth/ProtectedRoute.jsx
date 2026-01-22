import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../../services/api";

const ProtectedRoute = () => {
    const user = authService.getCurrentUser();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
