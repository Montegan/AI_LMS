import React from 'react'
import Sidebar from '../components/Sidebar'
import { useTheme } from '../context/Theme'
import { useAuth } from '../context/auth_context';
import Loading from "../components/Loading";
import { useState } from 'react';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase_config';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase_config';
import axios from 'axios';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsFillSendFill } from 'react-icons/bs';
import { FaMicrophone } from 'react-icons/fa';
import { CgAttachment } from 'react-icons/cg';
import { useEffect } from 'react';
import {IoMdAddCircle} from 'react-icons/io';
import { MdGTranslate } from "react-icons/md";
import { RiUserVoiceFill } from "react-icons/ri";
import { MdEmail } from "react-icons/md";
import { FaPodcast } from "react-icons/fa6";
import MediaSelector from "../components/chatui_components/MediaSelector";

// Message Load Component (replacing shadcn Message_load)
const MessageLoad = ({ items }) => {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col gap-4 p-4">
      {items.human_message && (
        <div className="flex justify-end">
          <div className={` p-3 rounded-lg max-w-[70%] ${theme === 'dark' ? 'bg-[#91bcd675] text-[#ffffff]' : 'bg-[#929292] text-[#000000]'}`}>
            {items.human_message}
          </div>
        </div>
      )}
      {items.ai_message && (
        <div className="flex justify-start">
          <div className={` p-3 rounded-lg max-w-[70%] ${theme === 'dark' ? 'bg-[#43505568] text-[#ffffff]' : 'bg-[#8a8a8a5a] text-[#222222]'}`}>
            {items.ai_message}
          </div>
        </div>
      )}
    </div>
  );
};

// Chat Input Component (replacing shadcn ChatInput)
const ChatInput = ({ currentTab, language }) => {
  const [inputMessage, setInputMessage] = useState("");
  const { user } = useAuth();
  const { theme } = useTheme();

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentTab) return;

    const currentuser = user.uid;
    const send_ref = collection(
      db,
      "users",
      currentuser,
      "tab_id",
      currentTab,
      "messages"
    );

    await addDoc(send_ref, {
      userId: currentuser,
      human_message: inputMessage,
      created_at: serverTimestamp(),
    });

    // Here you would typically send to your AI backend
    // const response = await sendToAI(inputMessage, language);
    
    setInputMessage("");
  };

  return (
    <div className="flex gap-2 items-center justify-center flex-1">
      <input
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        placeholder="Type your message..."
        className={`flex-1 p-3 ${theme === 'dark' ? 'bg-gray-800 text-[#ffffff]' : 'bg-gray-50 text-[#000000]'} rounded-lg border border-gray-600 focus:outline-none focus:border-[#00416B]`}
      />
      <button
        onClick={handleSendMessage}
        className={`flex items-center text-[1.5rem] justify-center h-10 w-[100px]  p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-50 hover:text-[#1e38a2]':'text-gray-800 hover:text-[#1e38a2]' }`
      }      >
        <BsFillSendFill />
      </button>
    </div>
  );
};

// Media Selector Component (replacing shadcn Media_selector)
// const MediaSelector = ({ setMediaSelector, mediaSelector }) => {
//   if (!mediaSelector) return null;

//   return (
//     <div className="absolute bottom-20 left-4 bg-[#2a2a2a] border border-gray-600 rounded-lg p-4 shadow-lg">
//       <div className="flex flex-col gap-2">
//         <button className="text-white hover:text-[#00416B] transition-colors">
//           Upload File
//         </button>
//         <button className="text-white hover:text-[#00416B] transition-colors">
//           Upload Image
//         </button>
//         <button className="text-white hover:text-[#00416B] transition-colors">
//           Upload Audio
//         </button>
//       </div>
//     </div>
//   );
// };

const Chatbot = () => {
  const { theme } = useTheme();
  const { user, loading, error } = useAuth();
  const [messages, setMessages] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [currentTab, setCurrentTab] = useState("");
  const [mediaSelector, setMediaSelector] = useState(false);
  const [Micon, setMicon] = useState(false);
  const [language, setLanguage] = useState("English");
  const [tab_title, setTabTitle] = useState({ message: "" });
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const handdle_logout = async () => {
    const signed_out = await signOut(auth);
    console.log(user.proactiveRefresh.isRunning);
    console.log(signed_out);
    navigate("/");
  };

  // Navigate to /ChatBot if the user is logged in
  useEffect(() => {
    if (user == null) {
      navigate("/");
    }
    console.log(user);
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      const current_user = user.uid;
      const collection_tab = collection(db, "owner", current_user, "tabs");
      const tabs_query = query(
        collection_tab,
        orderBy("created_at", "desc"),
        limit(50)
      );
      const unsubscribeTabs = onSnapshot(tabs_query, (snapshot) => {
        setTabs(snapshot.docs.map((mac) => mac.id));
        snapshot.docs.map((mac) => {
          const message_fetch = collection(
            db,
            "users",
            current_user,
            "tab_id",
            mac.id,
            "messages"
          );
          const message_query = query(
            message_fetch,
            orderBy("created_at"),
            limit(50)
          );
          onSnapshot(message_query, (snapshot) => {
            setMessages(snapshot.docs.map((doc) => doc.data()));
            var names = snapshot.docs.map((doc) => doc.data());
            console.log("thus is the value of names");
            console.log(names);
            snapshot.docs.map((docs) =>
              setTabTitle((prev) => ({
                ...prev,
                [mac.id]: names[0].human_message,
              }))
            );
          });
        });
        console.log("I was able to load");
        console.log(snapshot.docs.map((doc) => doc.id));
      });

      console.log(currentTab);
      console.log(user);
      return () => {
        unsubscribeTabs();
      };
    }
  }, []);

  const handleTabCreate = async (e) => {
    const current_user = user.uid;
    const collection_ref = collection(db, "owner", current_user, "tabs");
    const q = await addDoc(collection_ref, {
      user_id: current_user,
      created_at: serverTimestamp(),
    });
    setCurrentTab(q.id);
    const tabs_query = query(
      collection_ref,
      orderBy("created_at", "desc"),
      limit(50)
    );
    onSnapshot(tabs_query, (snapshot) => {
      setTabs(snapshot.docs.map((doc) => doc.id));
      console.log(snapshot.docs.map((doc) => doc.id));
    });

    handeActiveTab(q.id);
    console.log(q.id);
  };

  const handeActiveTab = (active_id) => {
    const current_user = user.uid;
    const active_tab = active_id;
    const send_ref = collection(
      db,
      "users",
      current_user,
      "tab_id",
      active_tab,
      "messages"
    );
    const tabs_query = query(send_ref, orderBy("created_at"), limit(50));
    onSnapshot(tabs_query, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
      console.log(snapshot.docs.map((doc) => doc.id));
    });
  };

  const handleAttach = () => {
    console.log("attach button clicked");
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAudio = async () => {
    console.log(Micon);
    const currentuser = user.uid;
    const backendMessage = await axios.post(
      "http://127.0.0.1:5000/process_audio",
      { currentuser: currentuser, currentTab: currentTab },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    backendMessage && setMicon(false);

    console.log(backendMessage.data.data);
    const recorded_text = backendMessage.data.data;
  };

  return (
    <div className={`w-full h-[100vh] flex ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <Sidebar/>

      {loading ? (
        <Loading />
      ) : (
        <>
          {error ? (
            <h1 className="text-red-500 text-center p-8">Encountered error while logging in</h1>
          ) : (
            <div className="flex w-[80vw] flex-1">
              {/* Left Sidebar - Chat Tabs */}
              <div className={`h-[100vh] relative w-[20vw] max-w-[20vw] items-center overflow-y-scroll [scrollbar-width:none] [-ms-overflow-style:none] flex flex-col gap-2 ${
                theme === 'dark' 
                  ? 'bg-gray-900 border-r border-gray-700' 
                  : 'bg-white border-r border-gray-200'
              }`}>
                <div className={`flex w-[20vw] max-w-[20vw] items-center justify-center p-2 border-b mb-2 gap-3 ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                <button
                  className={`w-[260px] mb-2 max-w-[260px] p-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    theme === 'dark'
                      ? 'text-white hover:bg-gray-700 bg-gray-800'
                      : 'text-gray-900 hover:bg-gray-100 bg-gray-50'
                  }`}
                  onClick={(e) => handleTabCreate(e)}
                >
                  <IoMdAddCircle /> New
                </button>
                </div>
                
                
                
                <div className="h-[80vh] w-[260px] overflow-y-scroll [scrollbar-width:none] [-ms-overflow-style:none] max-w-[260px] flex flex-col gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      id={tab}
                      onClick={(e) => {
                        setCurrentTab(e.target.id);
                        handeActiveTab(e.target.id);
                        console.log("current tab is " + e.target.id);
                      }}
                      className={`max-w-[260px] px-6 py-2 rounded-xl font-medium text-sm transition-all duration-200 ease-in-out shadow-sm hover:shadow-md truncate ${
                        theme === 'dark'
                          ? 'text-gray-300 bg-gray-800 hover:bg-gray-700 focus:bg-gray-600 focus:text-white'
                          : 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:bg-blue-100 focus:text-blue-900'
                      }`}
                    >
                      {tab_title[tab] ? tab_title[tab] : "New Tab Created..."}
                    </button>
                  ))}
                </div>

                {/* <button
                  onClick={handdle_logout}
                  className="fixed bottom-0 bg-[tomato] text-black font-extrabold text-4xl w-[20vw] max-w-full p-2 hover:bg-red-600 transition-colors"
                >
                  <CiLogout />
                </button> */}
              </div>

              {/* Main Chat Area */}
              <div className={`h-[100vh] w-[80vw] flex gap-3 flex-col items-center pb-3 pt-2 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                {/*top section*/}
                <div className={`h-[60px] border-b-2 border-opacity-10 w-[73vw] relative pb-2 ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  {/* <div className="relative min-h-[35px] flex gap-16 items-center w-full">
                    <MdEmail
                      className={`cursor-pointer transition-colors ${
                        theme === 'dark' 
                          ? 'text-gray-400 hover:text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      size={23}
                      onClick={() => navigate("/EmailService")}
                    />
                    <RiUserVoiceFill
                      className={`cursor-pointer transition-colors ${
                        theme === 'dark' 
                          ? 'text-gray-400 hover:text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      size={23}
                      onClick={() => navigate("/VoiceChat")}
                    />
                    <FaPodcast
                      className={`cursor-pointer transition-colors ${
                        theme === 'dark' 
                          ? 'text-gray-400 hover:text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      size={23}
                      onClick={() => navigate("/Podcast")}
                    />
                  </div> */}

                  <div
                    className={
                      currentTab !== ""
                        ? "p-1 w-fit flex items-center  absolute right-0 top-2"
                        : "hidden"
                    }
                  >
                    <label htmlFor="language">
                      <MdGTranslate className={`text-[2rem] opacity-40 transition-colors ${
                        theme === 'dark' 
                          ? 'text-gray-300 hover:text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`} />
                    </label>
                    <select
                      name="language"
                      id="language"
                      className={`rounded-lg focus:outline-none ml-3 p-1 w-[10vw] transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-white border border-gray-600'
                          : 'bg-white text-gray-900 border border-gray-300'
                      }`}
                      value={language}
                      onChange={(e) => {
                        setLanguage(e.target.value);
                        console.log(e.target.value);
                      }}
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Tagalog">Tagalog</option>
                      <option value="Vietnamese">Vietnamese</option>
                      <option value="Arabic">Arabic</option>
                      <option value="French">French</option>
                      <option value="Albanian">Albanian</option>
                      <option value="Armenian">Armenian</option>
                      <option value="Azerbaijani">Azerbaijani</option>
                      <option value="Belarusian">Belarusian</option>
                      <option value="Bengali">Bengali</option>
                      <option value="Bosnian">Bosnian</option>
                      <option value="Brazilian Portuguese">Brazilian Portuguese</option>
                      <option value="Bulgarian">Bulgarian</option>
                      <option value="Catalan">Catalan</option>
                      <option value="Croatian">Croatian</option>
                      <option value="Czech">Czech</option>
                      <option value="Danish">Danish</option>
                      <option value="Dutch">Dutch</option>
                      <option value="Estonian">Estonian</option>
                      <option value="Finnish">Finnish</option>
                      <option value="Galician">Galician</option>
                      <option value="Georgian">Georgian</option>
                      <option value="German">German</option>
                      <option value="Greek">Greek</option>
                      <option value="Gujarati">Gujarati</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Hungarian">Hungarian</option>
                      <option value="Indonesian">Indonesian</option>
                      <option value="Irish">Irish</option>
                      <option value="Italian">Italian</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Korean">Korean</option>
                      <option value="Latvian">Latvian</option>
                      <option value="Lithuanian">Lithuanian</option>
                      <option value="Macedonian">Macedonian</option>
                      <option value="Malay">Malay</option>
                      <option value="Maltese">Maltese</option>
                      <option value="Mandarin Chinese">Mandarin Chinese</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Moldovan">Moldovan</option>
                      <option value="Mongolian">Mongolian</option>
                      <option value="Montenegrin">Montenegrin</option>
                      <option value="Nepali">Nepali</option>
                      <option value="Norwegian">Norwegian</option>
                      <option value="Pashto">Pashto</option>
                      <option value="Persian (Farsi)">Persian (Farsi)</option>
                      <option value="Polish">Polish</option>
                      <option value="Portuguese">Portuguese</option>
                      <option value="Punjabi">Punjabi</option>
                      <option value="Romanian">Romanian</option>
                      <option value="Russian">Russian</option>
                      <option value="Serbian">Serbian</option>
                      <option value="Sinhala">Sinhala</option>
                      <option value="Slovak">Slovak</option>
                      <option value="Slovene">Slovene</option>
                      <option value="Ukrainian">Ukrainian</option>
                      <option value="Urdu">Urdu</option>
                      <option value="Uzbek">Uzbek</option>
                      <option value="Vietnamese">Vietnamese</option>
                      <option value="Welsh">Welsh</option>
                    </select>
                  </div>
                </div>

                  {/*chat area*/}
                <div className={`relative h-[90vh] w-[73vw]  overflow-y-scroll overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] flex flex-col gap-10 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  {tabs.length > 0 && currentTab != "" ? (
                    messages.map((items, index) => (
                      <MessageLoad key={index} items={items} />
                    ))
                  ) : (
                    <button
                      className="absolute top-[40vh] bg-[#00416B] left-[28vw] text-white p-4 rounded-lg hover:bg-[#003a5c] transition-colors"
                      onClick={(e) => handleTabCreate(e)}
                    >
                      Create New Tab
                    </button>
                  )}
                  <MediaSelector
                    setMediaSelector={setMediaSelector}
                    mediaSelector={mediaSelector}
                  />
                  <div ref={chatEndRef}></div>
                </div>
                {/*media selector, chat input and microphone section*/}
                {currentTab != "" && (
                  <div className={`flex w-[73vw] ${theme === 'dark' ? 'bg-[#171f2a]' : 'bg-[#b9b9b9]'} p-2 items-center justify-center gap-2`}>
                    <button
                      className={`flex items-center text-[1.2rem] justify-center h-10 w-[100px]  p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-50 hover:text-[#1e38a2]':'text-gray-800 hover:text-[#1e38a2]' }`
                      }
                      onClick={() => {
                        setMediaSelector(!mediaSelector);
                      }}
                    >
                      <CgAttachment />
                    </button>
                    <button
                      onClick={() => {
                        setMicon(!Micon);
                        console.log(Micon);
                        handleAudio();
                      }}
                      className={
                        Micon
                          ? "text-red-500 flex items-center justify-center text-[1.2rem]  h-10 w-[100px] p-2 rounded-lg"
                          : `flex items-center justify-center text-[1.2rem] h-10 w-[100px]  p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-50 hover:text-[#1e38a2]':'text-gray-800 hover:text-[#1e38a2]' }`
                      }
                    >
                      <FaMicrophone />
                    </button>
                    <ChatInput currentTab={currentTab} language={language} />
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Chatbot;