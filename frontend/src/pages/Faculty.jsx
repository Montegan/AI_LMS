import React from 'react'
import FacultyDashboard from '../components/FacultyDashboard';
import { useAuth } from '../context/auth_context';
import { Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/Theme';

const Faculty = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    if (!user) {
        return <Navigate to="/" />
    }
    if (user.role !== "faculty") {
        return <Navigate to="/student" />
    }
    
    return (
        <div className={`w-full h-[100vh] flex ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <nav className="h-full flex-shrink-0">
                <Sidebar/>
            </nav>
            <main className={`flex-1 h-full overflow-y-auto ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                <div className="p-8">
                    <FacultyDashboard/>
                </div>
            </main>
        </div>
    )
}

export default Faculty