import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "./UserContext";

export default function ProtectedRoutes() {
    const context = useContext(UserContext);
    const navigate = useNavigate();
    
    // Handle case where context might be undefined
    if (!context) {
        throw new Error('ProtectedRoutes must be used within a UserProvider');
    }
    
    const { user } = context;
    
    return (
        user ? <Outlet /> : <Navigate to="/auth" replace />
    );
}