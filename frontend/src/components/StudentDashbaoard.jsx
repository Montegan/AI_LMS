import React from 'react'
import { auth, db } from '../firebase_config';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import Loading from '../components/Loading';
import { useAuth } from '../context/auth_context';
import { FaBookOpen, FaCommentDots, FaHeadphones, FaPodcast, FaUserCheck } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import FeatureButton from '../components/FeatureButton';
import { useTheme } from '../context/Theme';
const StudentDashbaoard = ({ selectedCourse, setSelectedCourse, courses }) => {
  
  const { theme } = useTheme();
    
    return (

      <main className={`flex-1 h-full overflow-y-auto ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        <div className="p-8">
          <section className="space-y-4 mb-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>My Courses</h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Select a course to launch features.</p>
              </div>
              <input 
                placeholder="Search courses..." 
                className={`w-72 border rounded-md p-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`} 
              />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => (
                <div key={c.id} className={`rounded-2xl min-h-64 shadow-lg border-2 transition p-6 flex flex-col gap-12 ${
                  selectedCourse===c.id
                    ? theme === 'dark' 
                      ? 'border-blue-500 bg-gray-700' 
                      : 'border-blue-500 bg-blue-50'
                    : theme === 'dark'
                      ? 'border-gray-600 bg-gray-700'
                      : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col items-start gap-2">
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{c.name}</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{c.instructor} · {c.term}</p>
                    </div>
                    <button
                      className={`rounded-xl px-3 py-1 text-sm transition-colors ${
                        selectedCourse===c.id
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : theme === 'dark'
                            ? 'bg-gray-600 hover:bg-gray-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                      onClick={() => setSelectedCourse(c.id)}
                    >
                      {selectedCourse=== c.id ? "Selected" : "Open"}
                    </button>
                  </div>

                  {/* Feature buttons appear when course is selected (course-scoped only) */}
                  {selectedCourse===c.id && (
                    <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-6">
                      <FeatureButton icon={<FaBookOpen />} label="Resources" />
                      <FeatureButton icon={<FaCommentDots />} label="AI Chat" />
                      <FeatureButton icon={<FaHeadphones />} label="Voice Chat" />
                      <FeatureButton icon={<MdEmail/>} label="Email" />
                      <FeatureButton icon={<FaPodcast />} label="Podacstify" />
                      <FeatureButton icon={<FaUserCheck />} label="Attendance" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    )
  }

export default StudentDashbaoard