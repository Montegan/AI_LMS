import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/auth_context';
import Upload_course_material from './faculty_upload/Upload_course_material';
import { db } from '../firebase_config';
import { doc, collection, limit, onSnapshot, query, getDoc } from 'firebase/firestore';
import Course_content from './faculty_upload/Course_content';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/Theme';

const FacultyDashboard = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [enrolled_courses, set_enrolled_courses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    useEffect(()=>{
      if(user==null){
        return
      }
      const Current_user=user.uid
      console.log(Current_user)
      const doc_ref= collection(db, "users",Current_user,"enrolled_courses")
      const doc_query= query(doc_ref,limit(50))
      const items= onSnapshot(doc_query, async (snapshot)=>{
        // Fetch all courses at once
        const coursePromises = snapshot.docs.map(async (docSnap) => {
          const course_ref = doc(db, "courses", docSnap.id)
          try {
            const courseSnapshot = await getDoc(course_ref)
            if (courseSnapshot.exists()) {
              return { id: courseSnapshot.id, ...courseSnapshot.data() }
            } else {
              console.warn(`Course ${docSnap.id} not found`)
              return null
            }
          } catch (error) {
            console.error(`Error fetching course ${docSnap.id}:`, error)
            return null
          }
        })
        
        const courses = await Promise.all(coursePromises)
        const validCourses = courses.filter(course => course !== null)
        set_enrolled_courses(validCourses)
      })
      return()=>{
        items()
      }      
    },[])
    
    const handleCourseClick = (course) => {
      setSelectedCourse(course);
    };

    // If a course is selected, show the Course_content component
    if (selectedCourse) {
      return (
        <div className={theme === "dark" ? "text-white" : "text-black"}>
          <div className="mb-4">
            <button
              onClick={() => setSelectedCourse(null)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${theme === "dark" ? "bg-gray-800 text-white hover:bg-gray-700 border-gray-700" : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"}`}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
          </div>
          <Course_content course={selectedCourse} handleCourseClick={handleCourseClick} />
        </div>
      );
    }
    
    // Otherwise, show the dashboard
    return(
  <div className={theme === "dark" ? "text-white" : "text-black"}>
    <h3 className={`text-2xl font-bold mb-4 text-center ${theme === "dark" ? "text-white" : "text-white"}`}>Faculty Dashboard</h3>
    <div className={`p-6 rounded-lg border space-y-4 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
      <p className={`text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Welcome, {user.displayName}!</p>
      
      <div className="space-y-4">
        <h4 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Your Courses</h4>
        {enrolled_courses.length === 0 ? (
          <p className={`text-center py-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>No courses enrolled yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {enrolled_courses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course)}
                className={`rounded-lg shadow-sm border p-6 hover:shadow-md transition-all cursor-pointer ${theme === "dark" ? "bg-gray-700 border-gray-600 hover:border-blue-500" : "bg-white border-gray-200 hover:border-blue-400"}`}
              >
                <h5 className={`text-xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{course.name}</h5>
                <p className={`text-sm font-semibold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>{course.code}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className={`mt-6 pt-6 border-t ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
        <h4 className={`text-lg font-semibold mb-3 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Quick Actions</h4>
        <div className="grid gap-3">
          <button className={`text-left p-4 rounded-lg shadow-sm border transition-all ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600 border-gray-600 hover:border-blue-500" : "bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-400"}`}>
            <span className="text-2xl">📤</span>
            <p className={`font-semibold mt-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Upload Course Materials</p>
            <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Add PDFs, videos, and resources</p>
          </button>
        </div>
      </div>
    </div>
  </div>)
};

export default FacultyDashboard