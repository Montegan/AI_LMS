import React from "react";
import { useTheme } from "../context/Theme";

const Loading = () => {
    const { theme } = useTheme();
  return (
    <div className={`h-[100vh] w-full flex items-center justify-center ${ theme === 'dark' ? 'bg-gray-800' : 'bg-gray-600' }` }>
      <div className=" w-[10vw] flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          <circle
            fill="#1f2937"
            stroke="#1f2937"
            stroke-width="10"
            r="10"
            cx="40"
            cy="65"
          >
            <animate
              attributeName="cy"
              calcMode="spline"
              dur="1"
              values="65;135;65;"
              keySplines=".5 0 .5 1;.5 0 .5 1"
              repeatCount="indefinite"
              begin="-.4"
            ></animate>
          </circle>
          <circle
            fill="#f9fafb"
            stroke="#f9fafb"
            stroke-width="10"
            r="10"
            cx="100"
            cy="65"
          >
            <animate
              attributeName="cy"
              calcMode="spline"
              dur="1"
              values="65;135;65;"
              keySplines=".5 0 .5 1;.5 0 .5 1"
              repeatCount="indefinite"
              begin="-.2"
            ></animate>
          </circle>
          <circle
            fill="#1f2937"
            stroke="#1f2937"
            stroke-width="10"
            r="10"
            cx="160"
            cy="65"
          >
            <animate
              attributeName="cy"
              calcMode="spline"
              dur="1"
              values="65;135;65;"
              keySplines=".5 0 .5 1;.5 0 .5 1"
              repeatCount="indefinite"
              begin="0"
            ></animate>
          </circle>
          <circle
            fill="#f9fafb"
            stroke="#f9fafb"
            stroke-width="10"
            r="10"
            cx="100"
            cy="65"
          >
            <animate
              attributeName="cy"
              calcMode="spline"
              dur="1"
              values="65;135;65;"
              keySplines=".5 0 .5 1;.5 0 .5 1"
              repeatCount="indefinite"
              begin="-.2"
            ></animate>
          </circle>
        </svg>
      </div>
    </div>
  );
};

export default Loading;
