import { useState, useEffect } from 'react';
import { Plus, Minus, Clock, User, BookOpen, Calendar, Eye } from 'lucide-react';
import { enrolledCourses as initialEnrolled, availableCourses as initialAvailable } from '../data/mockData';
import { useTheme } from '../../context/Theme';
import { useAuth } from '../../context/auth_context';
import { db } from '../../firebase_config';
import { collection, query, limit, onSnapshot, getDoc, doc } from 'firebase/firestore';
import StudentCourseMaterials from './StudentCourseMaterials';

export default function ClassEnrollment() {
  const [enrolled, setEnrolled] = useState([]);
  const [available, setAvailable] = useState([]);
  const [activeTab, setActiveTab] = useState('enrolled');
  const [selectedCourse, setSelectedCourse] = useState(null);
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
      setEnrolled(validCourses);
    });

    return () => unsubscribe();
  }, [user]);

  const handleEnroll = (course) => {
    const newEnrollment = {
      ...course,
      enrollmentDate: new Date().toISOString().split('T')[0],
      attendancePercentage: 0
    };
    
    setEnrolled([...enrolled, newEnrollment]);
    setAvailable(available.filter(c => c.id !== course.id));
  };

  const handleDrop = (courseId) => {
    const droppedCourse = enrolled.find(c => c.id === courseId);
    if (droppedCourse) {
      const { enrollmentDate, attendancePercentage, ...courseData } = droppedCourse;
      setAvailable([...available, courseData]);
      setEnrolled(enrolled.filter(c => c.id !== courseId));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalCredits = enrolled.reduce((sum, course) => sum + (course.credits || 0), 0);

  // If a course is selected, show the materials view
  if (selectedCourse) {
    return <StudentCourseMaterials course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
  }

  return (
    <div className={`space-y-6 ${theme === "dark" ? "bg-gradient-to-b from-black to-gray-900" : "bg-white"}`}>
      <div className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className={`p-6 ${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Enrollment Summary</h3>
            <span className={`px-3 py-1 rounded-full text-base font-medium ${theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800"}`}>
              {totalCredits} Total Credits
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === "dark" ? "bg-blue-900/20 text-blue-300" : "bg-blue-50 text-blue-900"}`}>
              <BookOpen className="w-5 h-5" />
              <div>
                <p className={`text-sm ${theme === "dark" ? "text-blue-400" : "opacity-80"}`}>Enrolled Courses</p>
                <p className="text-xl font-medium">{enrolled.length}</p>
              </div>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === "dark" ? "bg-green-900/20 text-green-300" : "bg-green-50 text-green-900"}`}>
              <Plus className="w-5 h-5" />
              <div>
                <p className={`text-sm ${theme === "dark" ? "text-green-400" : "opacity-80"}`}>Available Courses</p>
                <p className="text-xl font-medium">{available.length}</p>
              </div>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === "dark" ? "bg-purple-900/20 text-purple-300" : "bg-purple-50 text-purple-900"}`}>
              <Calendar className="w-5 h-5" />
              <div>
                <p className={`text-sm ${theme === "dark" ? "text-purple-400" : "opacity-80"}`}>Total Credits</p>
                <p className="text-xl font-medium">{totalCredits}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className={`flex gap-2 p-1 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'enrolled'
                ? theme === "dark" ? 'bg-gray-700 shadow-sm text-white' : 'bg-white shadow-sm text-gray-900'
                : theme === "dark" ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Enrolled Courses
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'available'
                ? theme === "dark" ? 'bg-gray-700 shadow-sm text-white' : 'bg-white shadow-sm text-gray-900'
                : theme === "dark" ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Available Courses
          </button>
        </div>
        
        {activeTab === 'enrolled' && (
          <div className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <div className={`p-6 ${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
              <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>My Enrolled Courses</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                      <th className={`text-left py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Course</th>
                      <th className={`text-left py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Professor</th>
                      <th className={`text-left py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Schedule</th>
                      <th className={`text-left py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Credits</th>
                      <th className={`text-left py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Enrolled Date</th>
                      <th className={`text-right py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolled.map(course => (
                      <tr key={course.id} className={`border-b ${theme === "dark" ? "border-gray-700 hover:bg-gray-700/50" : "border-gray-200 hover:bg-gray-50"}`}>
                        <td className="py-3 px-4">
                          <div>
                            <p className={`font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>{course.name}</p>
                            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{course.code}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <User className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                            <span className={theme === "dark" ? "text-gray-200" : "text-gray-900"}>{course.professor}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Clock className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                            <span className={theme === "dark" ? "text-gray-200" : "text-gray-900"}>{course.schedule}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 border rounded text-sm ${theme === "dark" ? "border-gray-600 text-gray-300" : "border-gray-300 text-gray-700"}`}>{course.credits}</span>
                        </td>
                        <td className={`py-3 px-4 ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>{formatDate(course.enrollmentDate)}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => setSelectedCourse(course)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View Materials
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {enrolled.length === 0 && (
                <div className={`text-center py-8 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No courses enrolled yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'available' && (
          <div className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <div className={`p-6 ${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
              <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Available Courses</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                      <th className={`text-left py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Course</th>
                      <th className={`text-left py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Professor</th>
                      <th className={`text-left py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Schedule</th>
                      <th className={`text-left py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Credits</th>
                      <th className={`text-right py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {available.map(course => (
                      <tr key={course.id} className={`border-b ${theme === "dark" ? "border-gray-700 hover:bg-gray-700/50" : "border-gray-200 hover:bg-gray-50"}`}>
                        <td className="py-3 px-4">
                          <div>
                            <p className={`font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>{course.name}</p>
                            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{course.code}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <User className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                            <span className={theme === "dark" ? "text-gray-200" : "text-gray-900"}>{course.professor}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Clock className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                            <span className={theme === "dark" ? "text-gray-200" : "text-gray-900"}>{course.schedule}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 border rounded text-sm ${theme === "dark" ? "border-gray-600 text-gray-300" : "border-gray-300 text-gray-700"}`}>{course.credits}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleEnroll(course)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-1 ml-auto"
                          >
                            <Plus className="w-4 h-4" />
                            Enroll
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {available.length === 0 && (
                <div className={`text-center py-8 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>All available courses are enrolled.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
