import { useAuth } from "../context/auth_context";
import Login from "./Login.jsx";
import FacultyDashboard from "../components/FacultyDashboard";
import StudentDashboard from "../components/StudentDashbaoard";
import { useTheme } from "../context/Theme";
import Sidebar from "../components/Sidebar.jsx";
import Student from "./Student";
import Faculty from "./Faculty";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";  
export const Homepage = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate(user.role === 'faculty' ? '/faculty' : '/student');
        }
        else {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);


    return 
};