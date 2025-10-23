import { useState } from 'react';
import { Calendar, Search, Edit3, Filter, Download, Save, X } from 'lucide-react';

const mockAttendanceHistory = [
  {
    id: 'att_001',
    date: '2024-03-20',
    courseId: 'CS101',
    courseName: 'Introduction to Computer Science',
    courseCode: 'CS 101',
    method: 'AI',
    totalStudents: 5,
    presentCount: 4,
    absentCount: 1,
    lateCount: 0,
    students: [
      { id: 'STU001', name: 'Alex Johnson', status: 'present', confidence: 95, timestamp: '09:02' },
      { id: 'STU002', name: 'Emma Wilson', status: 'present', confidence: 92, timestamp: '09:01' },
      { id: 'STU003', name: 'Michael Brown', status: 'absent' },
      { id: 'STU004', name: 'Sarah Davis', status: 'present', confidence: 88, timestamp: '09:03' },
      { id: 'STU005', name: 'James Miller', status: 'present', confidence: 91, timestamp: '09:00' }
    ]
  },
  {
    id: 'att_002',
    date: '2024-03-18',
    courseId: 'CS101',
    courseName: 'Introduction to Computer Science',
    courseCode: 'CS 101',
    method: 'Manual',
    totalStudents: 5,
    presentCount: 5,
    absentCount: 0,
    lateCount: 0,
    students: [
      { id: 'STU001', name: 'Alex Johnson', status: 'present', timestamp: '09:00' },
      { id: 'STU002', name: 'Emma Wilson', status: 'present', timestamp: '08:58' },
      { id: 'STU003', name: 'Michael Brown', status: 'present', timestamp: '09:02' },
      { id: 'STU004', name: 'Sarah Davis', status: 'present', timestamp: '09:01' },
      { id: 'STU005', name: 'James Miller', status: 'present', timestamp: '08:59' }
    ]
  },
  {
    id: 'att_003',
    date: '2024-03-15',
    courseId: 'CS201',
    courseName: 'Data Structures',
    courseCode: 'CS 201',
    method: 'AI',
    totalStudents: 4,
    presentCount: 3,
    absentCount: 0,
    lateCount: 1,
    students: [
      { id: 'STU002', name: 'Emma Wilson', status: 'present', confidence: 94, timestamp: '14:01' },
      { id: 'STU003', name: 'Michael Brown', status: 'late', confidence: 87, timestamp: '14:15' },
      { id: 'STU004', name: 'Sarah Davis', status: 'present', confidence: 92, timestamp: '14:00' },
      { id: 'STU005', name: 'James Miller', status: 'present', confidence: 89, timestamp: '13:59' }
    ]
  },
  {
    id: 'att_004',
    date: '2024-03-13',
    courseId: 'CS201',
    courseName: 'Data Structures',
    courseCode: 'CS 201',
    method: 'AI',
    totalStudents: 4,
    presentCount: 2,
    absentCount: 1,
    lateCount: 1,
    students: [
      { id: 'STU002', name: 'Emma Wilson', status: 'present', confidence: 96, timestamp: '14:02' },
      { id: 'STU003', name: 'Michael Brown', status: 'absent' },
      { id: 'STU004', name: 'Sarah Davis', status: 'late', confidence: 85, timestamp: '14:20' },
      { id: 'STU005', name: 'James Miller', status: 'present', confidence: 93, timestamp: '14:01' }
    ]
  },
  {
    id: 'att_005',
    date: '2024-03-11',
    courseId: 'CS101',
    courseName: 'Introduction to Computer Science',
    courseCode: 'CS 101',
    method: 'Manual',
    totalStudents: 5,
    presentCount: 3,
    absentCount: 2,
    lateCount: 0,
    students: [
      { id: 'STU001', name: 'Alex Johnson', status: 'present', timestamp: '09:01' },
      { id: 'STU002', name: 'Emma Wilson', status: 'absent' },
      { id: 'STU003', name: 'Michael Brown', status: 'absent' },
      { id: 'STU004', name: 'Sarah Davis', status: 'present', timestamp: '09:00' },
      { id: 'STU005', name: 'James Miller', status: 'present', timestamp: '08:58' }
    ]
  }
];

const courses = [
  { id: 'CS101', name: 'Introduction to Computer Science', code: 'CS 101' },
  { id: 'CS201', name: 'Data Structures', code: 'CS 201' }
];

export default function AttendanceHistory() {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredRecords = mockAttendanceHistory.filter(record => {
    const matchesSearch = record.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.date.includes(searchTerm);
    const matchesCourse = courseFilter === 'all' || record.courseId === courseFilter;
    const matchesMethod = methodFilter === 'all' || record.method === methodFilter;
    
    return matchesSearch && matchesCourse && matchesMethod;
  });

  const updateStudentStatus = (studentId, newStatus) => {
    if (!editingRecord) return;
    
    const updatedRecord = {
      ...editingRecord,
      students: editingRecord.students.map(student => 
        student.id === studentId ? { ...student, status: newStatus } : student
      )
    };
    
    updatedRecord.presentCount = updatedRecord.students.filter(s => s.status === 'present').length;
    updatedRecord.absentCount = updatedRecord.students.filter(s => s.status === 'absent').length;
    updatedRecord.lateCount = updatedRecord.students.filter(s => s.status === 'late').length;
    
    setEditingRecord(updatedRecord);
  };

  const saveChanges = () => {
    console.log('Saving changes:', editingRecord);
    setIsEditDialogOpen(false);
    setEditingRecord(null);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </h3>
        </div>
        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by course, code, or date..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Course</label>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Method</label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Methods</option>
                <option value="AI">AI Recognition</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Attendance Records</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Method</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Present</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Absent</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Late</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Rate</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(record => {
                  const attendanceRate = ((record.presentCount / record.totalStudents) * 100).toFixed(1);
                  return (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{formatDate(record.date)}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{record.courseName}</p>
                          <p className="text-sm text-gray-500">{record.courseCode}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          record.method === 'AI' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {record.method}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium text-green-600">{record.presentCount}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium text-red-600">{record.absentCount}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium text-yellow-600">{record.lateCount}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium">{attendanceRate}%</span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRecord(record);
                            setIsViewDialogOpen(true);
                          }}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setEditingRecord(record);
                            setIsEditDialogOpen(true);
                          }}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          <Edit3 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No attendance records found.</p>
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {isViewDialogOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Attendance Details</h3>
                <button
                  onClick={() => setIsViewDialogOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-medium">{selectedRecord.courseName}</p>
                  <p className="text-sm text-gray-500">{selectedRecord.courseCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(selectedRecord.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Method</p>
                  <p className="font-medium">{selectedRecord.method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Attendance Rate</p>
                  <p className="font-medium">{((selectedRecord.presentCount / selectedRecord.totalStudents) * 100).toFixed(1)}%</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-4">Student Details</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Student</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Status</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Time</th>
                        {selectedRecord.method === 'AI' && (
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Confidence</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRecord.students.map(student => (
                        <tr key={student.id} className="border-b">
                          <td className="py-2 px-3">
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-gray-500">{student.id}</p>
                            </div>
                          </td>
                          <td className="py-2 px-3">{getStatusBadge(student.status)}</td>
                          <td className="py-2 px-3">{student.timestamp || '-'}</td>
                          {selectedRecord.method === 'AI' && (
                            <td className="py-2 px-3">
                              {student.confidence ? `${student.confidence}%` : '-'}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditDialogOpen && editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h3 className="text-xl font-bold">Edit Attendance</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-medium">{editingRecord.courseName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(editingRecord.date)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-4">Update Student Status</h4>
                <div className="space-y-3">
                  {editingRecord.students.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStudentStatus(student.id, 'present')}
                          className={`px-3 py-1 text-sm rounded-md ${
                            student.status === 'present'
                              ? 'bg-green-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => updateStudentStatus(student.id, 'absent')}
                          className={`px-3 py-1 text-sm rounded-md ${
                            student.status === 'absent'
                              ? 'bg-red-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => updateStudentStatus(student.id, 'late')}
                          className={`px-3 py-1 text-sm rounded-md ${
                            student.status === 'late'
                              ? 'bg-yellow-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Late
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <button
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingRecord(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={saveChanges}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
