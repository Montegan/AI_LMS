import React, { createContext, useContext, useState, useEffect } from "react";

const ActiveCourseContext = createContext();
export const useActiveCourse = () => useContext(ActiveCourseContext);

export const ActiveCourseProvider = ({ children }) => {
  // Initialize state from localStorage if available, otherwise empty
  const [activeCourse, setActiveCourseState] = useState(() => {
    // Try to get the stored course from localStorage
    const storedCourse = localStorage.getItem('activeCourse');
    if (storedCourse) {
      try {
        // Parse the stored JSON
        return JSON.parse(storedCourse);
      } catch (error) {
        console.error('Error parsing stored course:', error);
        return "";
      }
    }
    return "";
  });

  // Custom setter that updates both state and localStorage
  const setActiveCourse = (course) => {
    setActiveCourseState(course);
    // Store in localStorage
    if (course) {
      localStorage.setItem('activeCourse', JSON.stringify(course));
    } else {
      localStorage.removeItem('activeCourse');
    }
  };

  // Log when active course changes
  useEffect(() => {
    if (activeCourse) {
      console.log('Active course set to:', activeCourse.name || activeCourse.id || activeCourse);
    }
  }, [activeCourse]);

  return (
    <ActiveCourseContext.Provider value={{ activeCourse, setActiveCourse }}>
      {children}
    </ActiveCourseContext.Provider>
  );
};
