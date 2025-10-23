import { useAuth } from "../context/auth_context";
import Login from "./Login.jsx";
import { useTheme } from "../context/Theme";

import { useNavigate } from "react-router-dom";
import { useEffect } from "react";  
export const Homepage = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate(user.role === 'faculty' ? '/teacher' : '/student');
        }
        else {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);


    return 
};