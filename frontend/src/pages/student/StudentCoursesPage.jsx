import { useState } from 'react';
import { BookOpen, GraduationCap } from 'lucide-react';
import ClassEnrollment from './ClassEnrollment';
import MyCourses from './MyCourses';
import Sidebar from '../../components/Sidebar';
import { useTheme } from '../../context/Theme';

export default function StudentCoursesPage() {
  const [activeTab, setActiveTab] = useState('courses');
  const { theme } = useTheme();

  return (
    <div className="max-w-full w-full h-[100vh] flex">
      <Sidebar />
      <div className={`h-[100vh] p-6 shadow-lg flex-1 overflow-y-auto ${theme === "dark" ? "bg-gradient-to-b from-black to-gray-900" : "bg-white"}`}>
        <div className={`p-6 ${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b mb-6`}>
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            <BookOpen className="w-6 h-6" />
            Course Materials
          </h2>
        </div>
        <MyCourses />
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
