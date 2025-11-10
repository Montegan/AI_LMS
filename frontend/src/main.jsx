import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from "./context/Theme";
import { AuthProvider } from "./context/auth_context";
import { BrowserRouter } from 'react-router-dom';
import { ActiveContextProvider } from "./context/active_nav_context";                     
import { ActiveCourseProvider } from "./context/active_course";
createRoot(document.getElementById('root')).render(
  
  <StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <ActiveCourseProvider>
      <ThemeProvider>
        <ActiveContextProvider>
        <App />
        </ActiveContextProvider>
      </ThemeProvider>
    </ActiveCourseProvider>
    </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
