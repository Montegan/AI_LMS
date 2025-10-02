import React from 'react';
import { createContext, useState, useEffect, useContext } from 'react';

// --- 1. Theme Context ---
const ThemeContext = createContext('light');

// --- 2. Custom Hook ---
export const useTheme=()=>{
    return useContext(ThemeContext);
}

// --- 3. Theme Provider ---
export const ThemeProvider = ({children}) => {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []); 

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };
    
    const value = {theme, toggleTheme};
    
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// --- 4. Export ThemeProvider ---