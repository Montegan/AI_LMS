import { useState } from 'react';
import { BookOpen, GraduationCap } from 'lucide-react';
import ClassEnrollment from './ClassEnrollment';
import MyCourses from './MyCourses';
import { useTheme } from '../../context/Theme';
import StudentSidebar from '../../components/StudentSidebar';
import { useAuth } from '../../context/auth_context';
import { Navigate } from 'react-router-dom';

export default function StudentCoursesPage() {
  const [activeTab, setActiveTab] = useState('courses');
  const { user } = useAuth();
  const { theme } = useTheme();
  
  if (!user) {
        return <Navigate to="/" />
    }
    if (user.role !== "student") {
        return <Navigate to="/teacher" />
    }
  return (
    <div className="max-w-full w-full h-[100vh] flex">
      <StudentSidebar />
      <div className={`h-[100vh] p-6 shadow-lg flex-1 overflow-y-auto ${theme === "dark" ? "bg-gradient-to-b from-black to-gray-900" : "bg-white"}`}>
        {/* Header removed - Back button is now rendered conditionally */}
        <MyCourses
          renderBackButton={(onBack) => (
            <div className={`p-6 ${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b mb-6`}>
              <button 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${theme === "dark" ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"}`}
                onClick={onBack}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Courses
              </button>
            </div>
          )}
        />
        {/* <div className="p-6">
          <div className="space-y-6">
            <div className={`grid w-full grid-cols-2 gap-2 p-1 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
              <button
                onClick={() => setActiveTab('courses')}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'courses'
                    ? theme === "dark" ? 'bg-gray-700 shadow-sm text-white' : 'bg-white shadow-sm text-gray-900'
                    : theme === "dark" ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                My Courses
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
                Enrollment
              </button>
            </div>

            <div>
              {activeTab === 'courses' && <MyCourses />}
              {activeTab === 'enrollment' && <ClassEnrollment />}
            </div>
          </div> 
        </div>*/}
      </div>
    </div>
  );
}
