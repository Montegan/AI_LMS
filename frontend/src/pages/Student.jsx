import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth_context";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/Theme";
import StudentDashbaoard from "../components/StudentDashbaoard";
export default function Student() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { user } = useAuth();
  const { theme } = useTheme();
  if (!user) {
    return <Navigate to="/" />
  }
  if (user.role !== "student") {
    return <Navigate to="/Teacher" />
  }
  const courses = [
    { id: "cs101", name: "CS101: Intro to ML", instructor: "Dr. Lee", term: "Fall 2025" },
    { id: "cs205", name: "CS205: Data Structures", instructor: "Prof. Kim", term: "Fall 2025" },
    { id: "ai410", name: "AI410: GenAI Systems", instructor: "Dr. Gomez", term: "Fall 2025" },
  ];

  return (
    <div className={`w-full h-[100vh] flex ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <Sidebar/>
        <StudentDashbaoard selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse} courses={courses} />
    </div>
  );
}
