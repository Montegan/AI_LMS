import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "../firebase_config";
import { signInWithPopup } from "firebase/auth";
import { useAuth } from "../context/auth_context";
import { FcGoogle } from "react-icons/fc";
import { Sparkles, GraduationCap, Brain, Zap, Shield, Link2 } from "lucide-react";
import LoginIllustration from "../assets/login-illustration.png";
import Loading from "../components/Loading";

// Text animation component for rotating messages
const TextAnimation = () => {
  const messages = [
    "Empowering educators with AI-driven teaching tools.",
    "Helping students achieve academic excellence.",
    "Personalizing learning experiences for every student.",
    "Transforming education through intelligent technology.",
    "Creating smarter classrooms for the future.",
    "Streamlining administrative tasks for educators.",
  ];
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(80);
  useEffect(() => {
    let timer;
    const currentMessage = messages[index];
    if (isDeleting) {
      // Deleting text
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, typingSpeed / 2);
      } else {
        setIsDeleting(false);
        setIndex((prevIndex) => (prevIndex + 1) % messages.length);
        setTypingSpeed(80);
      }
    } else {
      // Typing text
      if (displayText.length < currentMessage.length) {
        timer = setTimeout(() => {
          setDisplayText(currentMessage.slice(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        // Pause before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    }
    return () => clearTimeout(timer);
  }, [displayText, index, isDeleting, messages, typingSpeed]);
  return (
    <p className="text-sm text-blue-200/90 text-center leading-relaxed h-[40px] w-full flex items-center justify-center">
      {displayText}
      <span className="ml-1 inline-block w-[2px] h-[14px] bg-blue-400 animate-blink"></span>
    </p>
  );
};

const Login = () => {
  const {loginWithGoogle, user, loading, isAuthenticated} = useAuth();
  const navigate = useNavigate();

  console.log(user);
  // Navigate to /student or /faculty if the user is logged in
  useEffect(() => {
    if (isAuthenticated) {
        navigate(user.role === 'faculty' ? '/teacher' : '/student');
    }
    else {
        navigate('/');
    }
}, [isAuthenticated]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-black">
          {/* Animated background grid */}
          {/* Floating orbs */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="relative z-10 h-full flex items-center justify-center p-8 lg:p-16">
            {/* Single centered card with proper margins for floating effect */}
            <div className="relative group max-w-7xl w-full mx-8 my-8" style={{maxWidth: 'calc(6rem * 16 + 100px)'}}>
              {/* Glow effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              {/* Main card */}
              <div className="relative h-[80vh] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                  {/* Left panel - Illustration (swapped position) */}
                  <div className="hidden lg:flex relative p-0 items-center justify-center overflow-hidden h-full" style={{backgroundColor: '#1e3a8a'}}>
                    {/* Background matching the image's blue tone */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900"></div> 
                    {/* Subtle decorative elements */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl"></div>     
                    <div className="relative z-10 flex flex-col h-full w-full items-center justify-between p-6 lg:p-8">
                      <div className="w-full flex-1 min-h-0 flex items-center justify-center">
                        <img 
                          src={LoginIllustration} 
                          alt="Login illustration" 
                          className="h-full w-full object-contain max-h-full filter drop-shadow-2xl" 
                        />
                      </div>    
                    </div>
                  </div>
                  {/* Right panel - Login form (swapped position) */}
                  <div className="p-6 lg:p-10 flex flex-col justify-center bg-slate-900/60 h-full overflow-y-auto">
                    <div className="max-w-md mx-auto w-full space-y-6">
                      {/* Header */}
                      <div className="text-center space-y-7">
                        <div className="flex justify-center items-center space-x-3">
                          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg">
                            <svg
                              viewBox="0 0 284 272"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-8 h-8 text-white fill-current"
                              aria-label="AILMS logo"
                            >
                              <path d="M58.9209 75.3281L131.753 225.298L283.386 170.164L58.9209 75.3281Z" fill="currentColor" />
                              <path d="M267.343 99.374L134.193 2.09246L11.7922 103.437L267.343 99.374Z" fill="currentColor" />
                              <path d="M9.92416 140L137.344 237.192L276.692 173.012L9.92416 140Z" fill="currentColor" />
                              <path d="M241.545 178.633L186.097 38.2392L146.53 182.983L241.545 178.633Z" fill="currentColor" />
                              <path d="M197.545 161.633L142.097 21.2392L102.53 165.983L197.545 161.633Z" fill="currentColor" />
                            </svg>
                          </div>
                          <h3 className="text-4xl text-center font-bold text-white tracking-tight">AILMS</h3>
                        </div>
                      </div>
                      {/* Account type selection */}
                      <div className="space-y-16">
                        <div className="space-y-4">
                        <p className="text-center lg:text-left text-slate-300 font-medium text-lg opacity-40 ">Choose Account :</p>
                        <div className="flex flex-col gap-5">
                          <button 
                            onClick={loginWithGoogle} 
                            className="w-full rounded-xl py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                          >
                            Teacher
                          </button>
                          <button 
                            onClick={loginWithGoogle} 
                            className="w-full rounded-xl py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                          >
                            Student
                          </button>
                        </div>
                        </div>
                      </div>
                      {/* Info text */}
                      {/* University Badge */}
                      <div className="pt-6 border-t border-slate-700/50">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
