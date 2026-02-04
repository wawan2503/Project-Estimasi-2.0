import React, { useEffect, useState } from 'react';
import { ThemeContext } from './ThemeContextStore';

export const ThemeProvider = ({ children }) => {
  // Cek localStorage atau preferensi sistem saat pertama kali load
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Hapus class lama, tambah class baru
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    // Simpan ke memory browser
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
