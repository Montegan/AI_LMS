import React, { useState, useEffect, useContext, createContext } from 'react';
import { app, auth, db, provider } from "./firebase_config";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { AuthProvider } from "./context/auth_context";

import { useAuth } from "./context/auth_context";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import Login from "./pages/Login.jsx";
import { Homepage } from './pages/Homepage.jsx';
import {Routes, Route } from 'react-router-dom';
import Chatbot from "./pages/Chatbot.jsx";
import VoiceChat from "./pages/VoiceChat.jsx";
import EmailService from "./pages/Emailservices.jsx";
import Podcast from "./pages/Podcast.jsx";
import Student from "./pages/Student.jsx";
import Teacher from "./pages/Faculty.jsx";
import Protected_routes from './utils/Protected_routes.jsx';
import Forbiden from "./pages/Forbiden.jsx";
import StudentAttendance from "./pages/StudentAttendance.jsx";
import FacultyAttendance from "./pages/FacultyAttendance.jsx";
// --- 4. Main Application Component ---
export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route
      path="/"
      element={<Login/>}
    />
    
    {/* Protected Routes */}
    <Route element={<Protected_routes/>}>
   <Route
      path="/homepage"
      element={<Homepage/>}
    />
    
    <Route
      path="/ChatBot"
      element={<Chatbot/>}
    />
    <Route
      path="/VoiceChat"
      element={<VoiceChat/>}
    />
    <Route path="/EmailService" element={<EmailService/>} />

    <Route
      path="/Podcast"
      element={<Podcast/>}
    />

    <Route
      path="/student_attendance"
      element={<StudentAttendance/>}
    />
     <Route
      path="/faculty_attendance"
      element={<FacultyAttendance/>}
    />
    <Route path="/student" element={<Student/>} />
    <Route path="/teacher" element={<Teacher/>} />
      </Route>

      <Route path="*" element={<Forbiden/>} />
    
  </Routes>
        
  );
}



