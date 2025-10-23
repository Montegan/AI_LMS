import { useState } from 'react';
import { UserCheck, Users, BookOpen, Calendar, Clock, Scan, History, User } from 'lucide-react';
import { mockProfessor, professorCourses, mockStudents } from '../data/mockData.js';
import FacialRecognitionAttendance from './FacialRecognitionAttendance';
import AttendanceHistory from './AttendanceHistory';
import ProfessorProfile from './ProfessorProfile';
import { useTheme } from '../../context/Theme';
import FacultySidebar from '../../components/FacultySidebar';
export default function ProfessorDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedCourse, setSelectedCourse] = useState(professorCourses[0].id);
  const [attendanceData, setAttendanceData] = useState(
    mockStudents.map(s => ({ ...s, status: 'present' }))
  );

  const updateAttendance = (studentId, status) => {
    setAttendanceData(prev => 
      prev.map(student => 
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const currentCourse = professorCourses.find(c => c.id === selectedCourse);
  const presentCount = attendanceData.filter(s => s.status === 'present').length;
  const absentCount = attendanceData.filter(s => s.status === 'absent').length;
  const { theme } = useTheme();

  return (
    <div className="flex h-[100vh] w-[100vw]">
      <FacultySidebar/>
      <div className={`rounded-lg shadow-lg ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className={`p-6 ${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            <UserCheck className="w-6 h-6" />
            Professor Portal - {mockProfessor.name}
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className={`grid w-full grid-cols-5 gap-2 p-1 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'profile'
                    ? theme === "dark" ? 'bg-gray-600 shadow-sm text-white' : 'bg-white shadow-sm text-gray-900'
                    : theme === "dark" ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('ai-attendance')}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'ai-attendance'
                    ? theme === "dark" ? 'bg-gray-600 shadow-sm text-white' : 'bg-white shadow-sm text-gray-900'
                    : theme === "dark" ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Scan className="w-4 h-4" />
                AI Attendance
              </button>
              <button
                onClick={() => setActiveTab('manual-attendance')}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'manual-attendance'
                    ? theme === "dark" ? 'bg-gray-600 shadow-sm text-white' : 'bg-white shadow-sm text-gray-900'
                    : theme === "dark" ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Manual Attendance
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'history'
                    ? theme === "dark" ? 'bg-gray-600 shadow-sm text-white' : 'bg-white shadow-sm text-gray-900'
                    : theme === "dark" ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <History className="w-4 h-4" />
                History
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'courses'
                    ? theme === "dark" ? 'bg-gray-600 shadow-sm text-white' : 'bg-white shadow-sm text-gray-900'
                    : theme === "dark" ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                My Courses
              </button>
            </div>

            <div>
              {activeTab === 'profile' && <ProfessorProfile />}
              
              {activeTab === 'ai-attendance' && (
                <div className="space-y-6">
                  <div className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                    <div className={`p-6 ${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
                      <h3 className={`text-xl font-bold flex items-center gap-2 mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        <Scan className="w-5 h-5" />
                        AI-Powered Facial Recognition Attendance
                      </h3>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        Select a course and take a class photo to automatically detect student attendance
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="max-w-sm">
                          <label className={`text-sm font-medium mb-2 block ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Select Course</label>
                          <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                          >
                            {professorCourses.map(course => (
                              <option key={course.id} value={course.id}>
                                {course.code} - {course.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {currentCourse && (
                          <div className={`flex items-center gap-6 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {currentCourse.schedule}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {currentCourse.enrolledStudents} students enrolled
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <FacialRecognitionAttendance />
                </div>
              )}

              {activeTab === 'manual-attendance' && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                      <div className={`p-4 ${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
                        <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Select Course</h3>
                      </div>
                      <div className="p-4">
                        <select
                          value={selectedCourse}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                        >
                          {professorCourses.map(course => (
                            <option key={course.id} value={course.id}>
                              {course.code} - {course.name}
                            </option>
                          ))}
                        </select>
                        {currentCourse && (
                          <div className={`mt-4 space-y-2 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {currentCourse.schedule}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {currentCourse.enrolledStudents} students enrolled
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                      <div className={`p-4 ${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
                        <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Today's Attendance</h3>
                        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          {new Date().toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                            <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Present</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                            <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Absent</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{attendanceData.length}</div>
                            <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Total</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                    <div className={`p-6 ${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
                      <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Student Attendance</h3>
                    </div>
                    <div className="p-6">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                              <th className={`text-left py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Student ID</th>
                              <th className={`text-left py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Name</th>
                              <th className={`text-left py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Attendance Rate</th>
                              <th className={`text-left py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Today's Status</th>
                              <th className={`text-right py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendanceData.map(student => (
                              <tr key={student.id} className={`border-b ${theme === "dark" ? "border-gray-700 hover:bg-gray-700/50" : "border-gray-200 hover:bg-gray-50"}`}>
                                <td className={`py-3 px-4 font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>{student.id}</td>
                                <td className={`py-3 px-4 ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>{student.name}</td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    {student.attendanceRate}%
                                  </div>
                                </td>
                                <td className="py-3 px-4">{getStatusBadge(student.status)}</td>
                                <td className="py-3 px-4 text-right space-x-2">
                                  <button
                                    onClick={() => updateAttendance(student.id, 'present')}
                                    className={`px-3 py-1 text-sm rounded-md ${
                                      student.status === 'present'
                                        ? 'bg-blue-600 text-white'
                                        : theme === "dark" ? 'border border-gray-600 hover:bg-gray-700 text-gray-300' : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                                    }`}
                                  >
                                    Present
                                  </button>
                                  <button
                                    onClick={() => updateAttendance(student.id, 'absent')}
                                    className={`px-3 py-1 text-sm rounded-md ${
                                      student.status === 'absent'
                                        ? 'bg-red-600 text-white'
                                        : theme === "dark" ? 'border border-gray-600 hover:bg-gray-700 text-gray-300' : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                                    }`}
                                  >
                                    Absent
                                  </button>
                                  <button
                                    onClick={() => updateAttendance(student.id, 'late')}
                                    className={`px-3 py-1 text-sm rounded-md ${
                                      student.status === 'late'
                                        ? 'bg-gray-600 text-white'
                                        : theme === "dark" ? 'border border-gray-600 hover:bg-gray-700 text-gray-300' : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                                    }`}
                                  >
                                    Late
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && <AttendanceHistory />}

              {activeTab === 'courses' && (
                <div className="grid gap-4">
                  {professorCourses.map(course => (
                    <div key={course.id} className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                      <div className={`p-6 ${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{course.name}</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800"}`}>
                            {course.code}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === "dark" ? "bg-blue-900/20 text-blue-300" : "bg-blue-50 text-blue-900"}`}>
                            <Calendar className="w-5 h-5" />
                            <div>
                              <p className={`text-sm ${theme === "dark" ? "text-blue-400" : "opacity-80"}`}>Schedule</p>
                              <p className="font-medium">{course.schedule}</p>
                            </div>
                          </div>
                          <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === "dark" ? "bg-green-900/20 text-green-300" : "bg-green-50 text-green-900"}`}>
                            <Users className="w-5 h-5" />
                            <div>
                              <p className={`text-sm ${theme === "dark" ? "text-green-400" : "opacity-80"}`}>Enrolled Students</p>
                              <p className="text-xl font-medium">{course.enrolledStudents}</p>
                            </div>
                          </div>
                          <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === "dark" ? "bg-purple-900/20 text-purple-300" : "bg-purple-50 text-purple-900"}`}>
                            <BookOpen className="w-5 h-5" />
                            <div>
                              <p className={`text-sm ${theme === "dark" ? "text-purple-400" : "opacity-80"}`}>Total Classes</p>
                              <p className="text-xl font-medium">{course.totalClasses}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
