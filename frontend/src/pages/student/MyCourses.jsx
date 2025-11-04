import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Clock, Award, ChevronRight, FileText } from 'lucide-react';
import { useTheme } from '../../context/Theme';
import { useAuth } from '../../context/auth_context';
import { db } from '../../firebase_config';
import { collection, query, limit, onSnapshot, getDoc, doc, getDocs } from 'firebase/firestore';
import StudentCourseMaterials from './StudentCourseMaterials';

export default function MyCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseMaterialCounts, setCourseMaterialCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const { user } = useAuth();

  // Fetch enrolled courses from Firestore
  useEffect(() => {
    if (!user) return;

    const enrolledRef = collection(db, 'users', user.uid, 'enrolled_courses');
    const enrolledQuery = query(enrolledRef, limit(50));
    
    const unsubscribe = onSnapshot(enrolledQuery, async (snapshot) => {
      const coursePromises = snapshot.docs.map(async (docSnap) => {
        const courseRef = doc(db, 'courses', docSnap.id);
        try {
          const courseSnapshot = await getDoc(courseRef);
          if (courseSnapshot.exists()) {
            return { id: courseSnapshot.id, ...courseSnapshot.data() };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching course ${docSnap.id}:`, error);
          return null;
        }
      });

      const coursesData = await Promise.all(coursePromises);
      const validCourses = coursesData.filter(course => course !== null);
      setEnrolledCourses(validCourses);
      
      // Fetch material counts for each course
      const counts = {};
      for (const course of validCourses) {
        try {
          const materialsRef = collection(db, 'materials', course.id, 'weeks');
          const materialsSnapshot = await getDocs(materialsRef);
          counts[course.id] = materialsSnapshot.size;
        } catch (error) {
          console.error(`Error fetching materials count for ${course.id}:`, error);
          counts[course.id] = 0;
        }
      }
      setCourseMaterialCounts(counts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // If a course is selected, show the materials view
  if (selectedCourse) {
    return <StudentCourseMaterials course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
  }

  const totalCredits = enrolledCourses.reduce((sum, course) => sum + (course.credits || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className={`rounded-xl shadow-lg border p-6 ${theme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700" : "bg-gradient-to-br from-white to-gray-50 border-gray-200"}`}>
        <h2 className={`text-2xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          My Courses
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-blue-900/20 border border-blue-800/30" : "bg-blue-50 border border-blue-200"}`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-blue-900/50" : "bg-blue-100"}`}>
                <BookOpen className={`w-6 h-6 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
              </div>
              <div>
                <p className={`text-sm ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>Enrolled Courses</p>
                <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {enrolledCourses.length}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-purple-900/20 border border-purple-800/30" : "bg-purple-50 border border-purple-200"}`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-purple-900/50" : "bg-purple-100"}`}>
                <Award className={`w-6 h-6 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`} />
              </div>
              <div>
                <p className={`text-sm ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}>Total Credits</p>
                <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {totalCredits}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-green-900/20 border border-green-800/30" : "bg-green-50 border border-green-200"}`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-green-900/50" : "bg-green-100"}`}>
                <FileText className={`w-6 h-6 ${theme === "dark" ? "text-green-400" : "text-green-600"}`} />
              </div>
              <div>
                <p className={`text-sm ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>Total Materials</p>
                <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {Object.values(courseMaterialCounts).reduce((sum, count) => sum + count, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className={`ml-3 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Loading courses...</span>
        </div>
      ) : enrolledCourses.length === 0 ? (
        <div className={`text-center py-12 rounded-xl border-2 border-dashed ${
          theme === "dark" ? "border-gray-700 bg-gray-800/50" : "border-gray-300 bg-gray-50"
        }`}>
          <BookOpen className={`w-16 h-16 mx-auto mb-4 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
          <p className={`text-lg font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            No courses enrolled yet
          </p>
          <p className={`text-sm mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
            Visit the Course Enrollment section to enroll in courses.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className={`group rounded-xl border-2 p-6 cursor-pointer transition-all duration-300 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20"
                  : "bg-white border-gray-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/20"
              }`}
            >
              {/* Course Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-blue-900/30" : "bg-blue-100"}`}>
                  <BookOpen className={`w-6 h-6 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`} />
              </div>

              {/* Course Info */}
              <div className="mb-4">
                <h3 className={`text-lg font-bold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {course.name}
                </h3>
                <p className={`text-sm font-semibold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                  {course.code}
                </p>
              </div>

              {/* Course Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className={`w-4 h-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                  <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {course.professor || 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                  <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {course.schedule || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FileText className={`w-4 h-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                  <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {courseMaterialCounts[course.id] || 0} materials
                  </span>
                </div>
              </div>

              {/* Credits Badge */}
              <div className="mt-4 pt-4 border-t" style={{
                borderColor: theme === "dark" ? "#374151" : "#e5e7eb"
              }}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Credits
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"
                  }`}>
                    {course.credits || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
