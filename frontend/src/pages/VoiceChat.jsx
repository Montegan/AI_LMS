import { useEffect, useRef, useState } from "react";
import axios from "axios";
import logo_image from "../assets/SFBU_Logo.png";
import { useNavigate } from "react-router-dom";
import { BsChatLeftTextFill } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { FaPodcast } from "react-icons/fa6";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/Theme";

function VoiceChat() {
  const [status, setStatus] = useState("");
  const [clicked, setClicked] = useState(false);
  const { theme } = useTheme();
  const send_mess = async () => {
    setClicked(!clicked);
    console.log(clicked);
    const item = await axios.post("http://127.0.0.1:5000/voice", {
      clicked: clicked,
    });
    console.log(item);
    setStatus(item.data);
  };
  const audio_ref = useRef(null);
  const navigate = useNavigate();
  return (
    <div className={`w-full h-[100vh] flex ${theme === "dark" ? "bg-gradient-to-b from-black to-gray-900" : "bg-white"}`}>
      <Sidebar />
     <div className="relative h-[100vh] w-full flex flex-col p-6 justify-start items-center">

      <h1 className={`text-[3rem] font-bold mt-[50px] ${theme === "dark" ? "text-[#BC955c]" : "text-gray-900"}`}>
        SFBU VOICE
      </h1>
      <button
        className={
          clicked
            ? "h-[200px] w-[200px] animate-pulse mt-[100px]"
            : "mt-[100px] h-[200px] w-[200px]"
        }
        htmlFor="player_icon"
      >
        <img
          className="h-[200px] w-[200px]"
          src={logo_image}
          onClick={send_mess}
        />
      </button>
      <span className={`mt-[10px] opacity-45 ${theme === "dark" ? "text-slate-50" : "text-gray-700"}`}>
        CLick Logo to speak
      </span>
      {/* <audio
        id="player_icon"
        className="hidden"
        src={sound}
        controls
        autoPlay
        ref={audio_ref}
      ></audio> */}
     </div>
    </div>
  );
}

export default VoiceChat;

// useEffect(() => {
//   // console.log(audio_ref.ended);
//   // if (audio_ref.ended) {
//   //   console.log("audio finished playing ");
//   // }
//   setStatus(audio_ref.current.currentTime);
//   console.log(audio_ref);
// }, [status]);

// const send_mess = () => {
//   console.log("clicked talk button");
// };
