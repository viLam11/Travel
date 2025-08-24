import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import Post from "../pages/Post";
import Homepage from "../pages/Homepage/Homepage";
import { useContext } from "react";
import { UserContext } from "./UserContext";

export default function ProtectedRoutes() {
    const { user } = useContext(UserContext);   
    const navigate = useNavigate();
    return (
        user ? <Outlet /> : <Navigate to="/auth" replace />  
    )
}