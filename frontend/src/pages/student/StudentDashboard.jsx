import { useState } from 'react';
import { User, BarChart3, BookOpen } from 'lucide-react';
import StudentProfile from './StudentProfile';
import AttendanceTracker from './AttendanceTracker';
import ClassEnrollment from './ClassEnrollment';
import Sidebar from '../../components/Sidebar';
import { useTheme } from '../../context/Theme';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme } = useTheme();

  return (
    <div className="max-w-full w-full h-[100vh] flex">
      <Sidebar></Sidebar>
      <div className={`h-[100vh] shadow-lg flex-1 ${theme === "dark" ? "bg-gradient-to-b from-black to-gray-900" : "bg-white"}`}>
        <div className={`p-6 ${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            <User className="w-6 h-6" />
            Student Portal
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className={`grid w-full grid-cols-3 gap-2 p-1 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'profile'
                    ? theme === "dark" ? 'bg-gray-700 shadow-sm text-white' : 'bg-white shadow-sm text-gray-900'
                    : theme === "dark" ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'attendance'
                    ? theme === "dark" ? 'bg-gray-700 shadow-sm text-white' : 'bg-white shadow-sm text-gray-900'
                    : theme === "dark" ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Attendance Tracker
              </button>
              <button
                onClick={() => setActiveTab('enrollment')}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'enrollment'
                    ? theme === "dark" ? 'bg-gray-700 shadow-sm text-white' : 'bg-white shadow-sm text-gray-900'
                    : theme === "dark" ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Course Enrollment
              </button>
            </div>

            <div>
              {activeTab === 'profile' && <StudentProfile />}
              {activeTab === 'attendance' && <AttendanceTracker />}
              {activeTab === 'enrollment' && <ClassEnrollment />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
