import React from 'react'
import Sidebar from '../components/Sidebar'
import { useTheme } from '../context/Theme';
const StudentAttendance = () => {
    const { theme } = useTheme();
    return (
      <div className={`w-full h-[100vh] flex ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <Sidebar/>
  </div>
    )
}

export default StudentAttendance


  