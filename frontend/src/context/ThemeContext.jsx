// frontend/src/context/ThemeContext.jsx

import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('rawat_theme') || 'dark');

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('rawat_theme', theme);
    // Apply theme class to HTML element for Tailwind CSS
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
