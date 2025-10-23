import { Calendar, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { enrolledCourses, attendanceRecords } from '../data/mockData';
import { useTheme } from '../../context/Theme';

export default function AttendanceTracker() {
  const { theme } = useTheme();
  const getStatusBadge = (status) => {
    const styles = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800'
    };
    
    const labels = {
      present: 'Present',
      absent: 'Absent',
      late: 'Late'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`flex flex-col gap-4 max-h-[calc(100vh-35vh)] h-[calc(100vh-40vh)] ${theme === "dark" ? "bg-gradient-to-b from-black to-gray-900" : "bg-white"}`}>
      {/* Overall Attendance Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        {enrolledCourses.map(course => (
          <div key={course.id} className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <div className={`p-4 ${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
              <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{course.name}</h3>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{course.code} • {course.professor}</p>
            </div>
            <div className="p-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Attendance Rate</span>
                  <div className="flex items-center gap-2">
                    {course.attendancePercentage >= 75 ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>{course.attendancePercentage}%</span>
                  </div>
                </div>
                <div className={`w-full rounded-full h-2 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
                  <div 
                    className={`h-2 rounded-full transition-all ${theme === "dark" ? "bg-blue-500" : "bg-blue-600"}`}
                    style={{ width: `${course.attendancePercentage}%` }}
                  ></div>
                </div>
                <div className={`flex items-center gap-4 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{course.schedule}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.credits} credits</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Attendance Records */}
      <div className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className={`p-6 ${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
          <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Recent Attendance Records</h3>
        </div>
        <div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                  <th className={`text-left py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Date</th>
                  <th className={`text-left py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Course</th>
                  <th className={`text-left py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Status</th>
                  <th className={`text-right py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map(record => {
                  const attendanceRate = ((record.attendedClasses / record.totalClasses) * 100).toFixed(1);
                  return (
                    <tr key={record.id} className={`border-b ${theme === "dark" ? "border-gray-700 hover:bg-gray-700/50" : "border-gray-200 hover:bg-gray-50"}`}>
                      <td className={`py-3 px-4 ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>{formatDate(record.date)}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className={theme === "dark" ? "text-gray-200" : "text-gray-900"}>{record.courseName}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>{attendanceRate}%</span>
                        <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          {record.attendedClasses}/{record.totalClasses}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
