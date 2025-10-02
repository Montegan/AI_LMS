import React from 'react'
import { useAuth } from '../context/auth_context';
import { useTheme } from '../context/Theme';
import { 
  FaBookOpen, 
  FaComments, 
  FaEnvelope, 
  FaPodcast, 
  FaUserCheck, 
  FaSignOutAlt, 
  FaSun, 
  FaMoon 
} from 'react-icons/fa';
import { RiRobot2Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom"; 
import { useActiveContext } from "../context/active_nav_context";



const Sidebar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { active, toggleActive } = useActiveContext();
    const navigate = useNavigate();    
    const NavButton = ({ icon, label, onClick, id }) => (
        <div className="relative group">
            <button 
                onClick={onClick}
                className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 text-lg ${
                    theme === 'dark' 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                } ${active === id ? ' border-blue-600 border-2' : ''}`}
            >
                {icon}
            </button>
            {/* Tooltip */}
            <div className={`absolute left-16 top-1/2 transform -translate-y-1/2 px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg border ${
                theme === 'dark'
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-200'
            }`}>
                {label}
                {/* Arrow */}
                <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 border-l border-b ${
                    theme === 'dark'
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-white border-gray-200'
                }`}></div>
            </div>
        </div>
    );

    return (
        <nav className="h-full flex-shrink-0">
        <div className={`w-16 h-full flex flex-col shadow-lg border-r ${
            theme === 'dark' 
                ? 'bg-gray-900 border-gray-700' 
                : 'bg-white border-gray-200'
        }`}>
            {/* Navigation Section */}
            <div className="flex-1 py-6 px-2"> 
                <nav className="space-y-3">
                    <NavButton 
                        icon={<FaBookOpen />} 
                        id="FaBookOpen"
                        label="Course Materials" 
                        onClick={() => {navigate('/Student'); toggleActive('FaBookOpen')}}
                    />
                    <NavButton 
                        icon={<RiRobot2Fill />} 
                        id="RiRobot2Fill"
                        label="Chat" 
                        onClick={() => {navigate('/Chatbot'); toggleActive('RiRobot2Fill')}}
                    />
                    <NavButton 
                        icon={<FaEnvelope />} 
                        id="FaEnvelope"
                        label="Email" 
                        onClick={() => {navigate('/EmailService'); toggleActive('FaEnvelope')}}
                    />
                    <NavButton 
                        icon={<FaPodcast />} 
                        id="FaPodcast"
                        label="Podcast" 
                        onClick={() => {navigate('/Podcast'); toggleActive('FaPodcast')}}
                    />
                    <NavButton 
                        icon={<FaUserCheck />} 
                        id="FaUserCheck"
                        label="Attendance" 
                        onClick={() => {navigate('/student_attendance'); toggleActive('FaUserCheck')}}
                    />
                </nav>
            </div>
            
            {/* User Section */}
            <div className={`border-t p-2 ${
                theme === 'dark' 
                    ? 'border-gray-700 bg-gray-800' 
                    : 'border-gray-200 bg-gray-50'
            }`}>
                {/* User Avatar */}
                <div className="relative group mb-3">
                    <div className="w-12 h-12 flex items-center justify-center">
                        <img 
                            src={user.photoURL} 
                            alt={user.displayName} 
                            className={`w-10 h-10 rounded-full border-2 ${
                                theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                            }`} 
                        />
                    </div>
                    {/* User Info Tooltip */}
                    <div className={`absolute left-16 top-1/2 transform -translate-y-1/2 px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg border ${
                        theme === 'dark'
                            ? 'bg-gray-700 text-white border-gray-600'
                            : 'bg-white text-gray-900 border-gray-200'
                    }`}>
                        <div className="font-medium">{user.displayName}</div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{user.email}</div>
                        {/* Arrow */}
                        <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 border-l border-b ${
                            theme === 'dark'
                                ? 'bg-gray-700 border-gray-600'
                                : 'bg-white border-gray-200'
                        }`}></div>
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-2">
                    <NavButton 
                        icon={<FaSignOutAlt />} 
                        label="Logout" 
                        onClick={logout}
                    />
                    <NavButton 
                        icon={theme === 'dark' ? <FaSun /> : <FaMoon />} 
                        label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'} 
                        onClick={toggleTheme}
                    />
                </div>
            </div>
        </div>
        </nav>
    )
}

export default Sidebar