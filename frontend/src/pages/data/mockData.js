export const mockStudent = {
  id: 'STU001',
  name: 'Alex Johnson',
  email: 'alex.johnson@university.edu',
  phone: '+1 (555) 123-4567',
  address: '123 Campus Drive, University City, UC 12345',
  profilePic: 'https://images.unsplash.com/photo-1729824186570-4d4aede00043?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwcHJvZmlsZSUyMGF2YXRhcnxlbnwxfHx8fDE3NTg0MzE5MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  role: 'student'
};

export const mockProfessor = {
  id: 'PROF001',
  name: 'Dr. Sarah Williams',
  email: 'sarah.williams@university.edu',
  phone: '+1 (555) 987-6543',
  address: '456 Faculty Lane, University City, UC 12345',
  role: 'professor'
};

export const availableCourses = [
  {
    id: 'CS101',
    name: 'Introduction to Computer Science',
    code: 'CS 101',
    professor: 'Dr. Sarah Williams',
    schedule: 'MWF 9:00-10:00 AM',
    credits: 3
  },
  {
    id: 'MATH201',
    name: 'Calculus II',
    code: 'MATH 201',
    professor: 'Dr. Michael Brown',
    schedule: 'TTh 11:00-12:30 PM',
    credits: 4
  },
  {
    id: 'ENG102',
    name: 'English Composition',
    code: 'ENG 102',
    professor: 'Prof. Emily Davis',
    schedule: 'MWF 2:00-3:00 PM',
    credits: 3
  },
  {
    id: 'HIST150',
    name: 'World History',
    code: 'HIST 150',
    professor: 'Dr. James Wilson',
    schedule: 'TTh 9:30-11:00 AM',
    credits: 3
  }
];

export const enrolledCourses = [
  {
    id: 'CS101',
    name: 'Introduction to Computer Science',
    code: 'CS 101',
    professor: 'Dr. Sarah Williams',
    schedule: 'MWF 9:00-10:00 AM',
    credits: 3,
    enrollmentDate: '2024-08-28',
    attendancePercentage: 87.5
  },
  {
    id: 'MATH201',
    name: 'Calculus II',
    code: 'MATH 201',
    professor: 'Dr. Michael Brown',
    schedule: 'TTh 11:00-12:30 PM',
    credits: 4,
    enrollmentDate: '2024-08-28',
    attendancePercentage: 92.3
  }
];

export const attendanceRecords = [
  {
    id: '1',
    courseId: 'CS101',
    courseName: 'Introduction to Computer Science',
    date: '2024-09-18',
    status: 'present',
    totalClasses: 40,
    attendedClasses: 35
  },
  {
    id: '2',
    courseId: 'CS101',
    courseName: 'Introduction to Computer Science',
    date: '2024-09-16',
    status: 'present',
    totalClasses: 39,
    attendedClasses: 34
  },
  {
    id: '3',
    courseId: 'CS101',
    courseName: 'Introduction to Computer Science',
    date: '2024-09-13',
    status: 'absent',
    totalClasses: 38,
    attendedClasses: 33
  },
  {
    id: '4',
    courseId: 'MATH201',
    courseName: 'Calculus II',
    date: '2024-09-19',
    status: 'present',
    totalClasses: 26,
    attendedClasses: 24
  },
  {
    id: '5',
    courseId: 'MATH201',
    courseName: 'Calculus II',
    date: '2024-09-17',
    status: 'late',
    totalClasses: 25,
    attendedClasses: 23
  }
];

export const mockStudents = [
  { id: 'STU001', name: 'Alex Johnson', attendanceRate: 87.5 },
  { id: 'STU002', name: 'Emma Wilson', attendanceRate: 95.0 },
  { id: 'STU003', name: 'Michael Brown', attendanceRate: 72.5 },
  { id: 'STU004', name: 'Sarah Davis', attendanceRate: 89.3 },
  { id: 'STU005', name: 'James Miller', attendanceRate: 91.7 }
];

export const professorCourses = [
  {
    id: 'CS101',
    name: 'Introduction to Computer Science',
    code: 'CS 101',
    schedule: 'MWF 9:00-10:00 AM',
    enrolledStudents: 28,
    totalClasses: 40
  },
  {
    id: 'CS201',
    name: 'Data Structures',
    code: 'CS 201',
    schedule: 'TTh 2:00-3:30 PM',
    enrolledStudents: 22,
    totalClasses: 30
  }
];
