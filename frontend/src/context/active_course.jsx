import React, { createContext, useContext, useState } from "react";

const ActiveCourseContext = createContext();
export const useActiveCourse = () => useContext(ActiveCourseContext);
export const ActiveCourseProvider = ({ children }) => {
  
  const [activeCourse, setActiveCourse] = useState("");
  return (
    <ActiveCourseContext.Provider value={{ activeCourse, setActiveCourse }}>
      {children}
    </ActiveCourseContext.Provider>
  );
};
