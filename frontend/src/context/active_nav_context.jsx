import React, { useState } from 'react'
import { createContext,useContext } from 'react'

const active_context = createContext();


export const useActiveContext = () => {
    return useContext(active_context);
}
    

export const ActiveContextProvider = ({children}) => {

    const [active, setActive] = useState('');
    const toggleActive = (tab) => {
        setActive(tab);
    }
    const value = {
        active,
        toggleActive
    }
  return <active_context.Provider value={value}>{children}</active_context.Provider>
  
}

