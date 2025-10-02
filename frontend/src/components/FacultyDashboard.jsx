import React from 'react'
import { useAuth } from '../context/auth_context';

const FacultyDashboard = () => {
    const { user } = useAuth();
    return(
  <div className="text-black">
    <h3 className="text-2xl font-bold text-white mb-4 text-center ">Faculty Dashboard</h3>
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
      <p className="text-lg">Welcome, {user.displayName}!</p>
      <button className="w-full text-left p-4 bg-white rounded-lg shadow-sm hover:bg-blue-50">📤 Upload Course Materials</button>
      <button className="w-full text-left p-4 bg-white rounded-lg shadow-sm hover:bg-blue-50">🤖 Use AI to Create a Quiz</button>
    </div>
  </div>)
};

export default FacultyDashboard