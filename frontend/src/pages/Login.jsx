import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "../firebase_config";
import { signInWithPopup } from "firebase/auth";
import { useAuth } from "../context/auth_context";
import { FcGoogle } from "react-icons/fc";
import { Sparkles, GraduationCap, Brain, Zap, Shield } from "lucide-react";
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
        <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-[#020d1a] via-[#051a36] to-[#030f20]">
          {/* Animated background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>
          
          <div className="relative z-10 h-full flex">
            {/* Left side - Visual Elements & Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
              {/* Animated geometric shapes - even more dispersed */}
              <div className="absolute top-8 left-8 w-64 h-64 border-2 border-blue-600/15 rounded-3xl rotate-12 animate-[pulse_6s_ease-in-out_infinite]"></div>
              <div className="absolute top-16 right-8 w-48 h-48 border-2 border-blue-500/15 rounded-full animate-[pulse_7s_ease-in-out_infinite] delay-300"></div>
              <div className="absolute bottom-8 left-12 w-56 h-56 border-2 border-sky-600/15 rounded-2xl -rotate-12 animate-[pulse_8s_ease-in-out_infinite] delay-700"></div>
              <div className="absolute top-[8%] right-[15%] w-32 h-32 border-2 border-indigo-500/10 rounded-lg rotate-45 animate-[pulse_9s_ease-in-out_infinite] delay-200"></div>
              <div className="absolute bottom-[10%] right-[8%] w-40 h-40 border-2 border-blue-500/10 rounded-3xl -rotate-6 animate-[pulse_10s_ease-in-out_infinite] delay-500"></div>
              <div className="absolute top-[75%] right-[20%] w-36 h-36 border-2 border-sky-500/10 rounded-full rotate-90 animate-[pulse_11s_ease-in-out_infinite] delay-400"></div>

              {/* Glowing orbs - positioned further away with darker blue tones */}
              <div className="absolute top-[5%] left-[8%] w-96 h-96 bg-blue-600/8 rounded-full blur-3xl animate-[pulse_10s_ease-in-out_infinite]"></div>
              <div className="absolute bottom-[8%] right-[5%] w-80 h-80 bg-sky-500/8 rounded-full blur-3xl animate-[pulse_12s_ease-in-out_infinite] delay-1000"></div>
              <div className="absolute top-[90%] left-[15%] w-72 h-72 bg-indigo-600/8 rounded-full blur-3xl animate-[pulse_9s_ease-in-out_infinite] delay-500"></div>
              <div className="absolute top-[3%] right-[18%] w-64 h-64 bg-blue-500/8 rounded-full blur-3xl animate-[pulse_11s_ease-in-out_infinite] delay-800"></div>

              {/* Floating icons - positioned further in corners */}
              <div className="absolute top-[8%] left-[5%] animate-[pulse_6s_ease-in-out_infinite] delay-100">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600/12 to-sky-600/12 border border-blue-500/20 backdrop-blur-sm">
                  <Brain className="w-12 h-12 text-blue-400" />
                </div>
              </div>
              
              <div className="absolute bottom-[8%] right-[5%] animate-[pulse_7s_ease-in-out_infinite] delay-500">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600/12 to-blue-600/12 border border-indigo-500/15 backdrop-blur-sm">
                  <Sparkles className="w-12 h-12 text-blue-300" />
                </div>
              </div>

              <div className="absolute top-[5%] right-[8%] animate-[pulse_8s_ease-in-out_infinite] delay-700">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-600/12 to-blue-600/12 border border-sky-500/20 backdrop-blur-sm">
                  <Zap className="w-12 h-12 text-sky-400" />
                </div>
              </div>

              {/* Centered branding */}
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 p-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-sky-500 blur-2xl opacity-40 animate-[pulse_10s_ease-in-out_infinite]"></div>
                  <div className="relative bg-gradient-to-br from-blue-700 to-sky-600 p-6 rounded-3xl shadow-xl shadow-blue-600/20">
                    <Brain className="w-20 h-20 text-white" />
                  </div>
                </div>
                
                <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-300 via-sky-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
                  IA.AI
                </h1>
                
                <div className="flex flex-col items-center gap-3 px-8 py-5 rounded-2xl bg-gradient-to-br from-blue-950/60 to-indigo-950/40 backdrop-blur-md border border-blue-600/15 w-[420px] h-[140px] shadow-lg shadow-blue-700/5">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-[3px] bg-gradient-to-b from-blue-500 to-sky-600 rounded-full"></div>
                    <h3 className="text-blue-300 font-semibold tracking-wide text-lg">Transforming Education</h3>
                    <div className="h-5 w-[3px] bg-gradient-to-b from-sky-600 to-blue-500 rounded-full"></div>
                  </div>
                  <div className="h-[60px] w-full flex items-center justify-center">
                    <TextAnimation />
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Login Card (50% width) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
                <div className="relative group">
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 rounded-[28px] blur-xl opacity-25 group-hover:opacity-40 transition duration-1000"></div>

                  {/* Login card */}
                  <div className="relative bg-slate-950/95 backdrop-blur-xl border border-blue-900/20 rounded-[28px] p-8 lg:p-14 shadow-2xl w-full max-w-[560px]">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-blue-600/10 to-transparent rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-44 h-44 bg-gradient-to-tr from-indigo-600/10 to-transparent rounded-full blur-2xl"></div>

                    <div className="relative space-y-8">
                      {/* Header */}
                      <div className="text-center space-y-3">
                        <div className="flex justify-center">
                          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600/15 to-sky-600/15 border border-blue-500/20">
                            <Sparkles className="w-8 h-8 text-blue-400" />
                          </div>
                        </div>
                        <h3 className="text-4xl font-semibold text-white tracking-tight">Welcome Back</h3>
                        <p className="text-base text-slate-300">Sign in to access your intelligent academic workspace</p>
                      </div>

                      {/* Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-slate-900 text-gray-400">Secure Sign In</span>
                        </div>
                      </div>

                      {/* Google Sign In Button */}
                      <button
                        onClick={loginWithGoogle}
                        className="group/btn relative w-full overflow-hidden rounded-xl bg-white hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-purple-600/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center gap-4 px-8 py-5">
                          <FcGoogle className="w-7 h-7" />
                          <span className="text-lg font-semibold text-neutral-900 tracking-wide uppercase">
                            Continue with Google
                          </span>
                        </div>
                      </button>

                      {/* Info text */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400 justify-center">
                          <Shield className="w-4 h-4 text-blue-400" />
                          <span>Protected by enterprise-grade security</span>
                        </div>
                        
                        <p className="text-xs text-center text-slate-400">
                          By signing in, you agree to our Terms of Service and Privacy Policy
                        </p>
                      </div>

                      {/* SFBU Badge */}
                      <div className="pt-6 border-t border-white/10">
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <GraduationCap className="w-5 h-5 text-blue-400" />
                          <span className="text-slate-300">San Francisco Bay University</span>
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
