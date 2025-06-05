import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [utaColors, setUtaColors] = useState({
    primary: '#8B0000',
    secondary: '#B71C1C',
    light: '#E53935',
    dark: '#4A0000',
    gold: '#FFD700',
    white: '#FFFFFF',
    grayDark: '#2E2E2E',
    grayLight: '#F5F5F5'
  });

  // Cargar tema guardado al inicializar
  useEffect(() => {
    const savedTheme = localStorage.getItem('uta-theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  // Aplicar tema al documento
  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.style.setProperty('--uta-background', '#1A1A1A');
      root.style.setProperty('--uta-surface', '#2E2E2E');
      root.style.setProperty('--uta-text-primary', '#FFFFFF');
      root.style.setProperty('--uta-text-secondary', '#CCCCCC');
    } else {
      root.style.setProperty('--uta-background', '#F5F5F5');
      root.style.setProperty('--uta-surface', '#FFFFFF');
      root.style.setProperty('--uta-text-primary', '#2E2E2E');
      root.style.setProperty('--uta-text-secondary', '#666666');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('uta-theme', newTheme);
    applyTheme(newTheme);
  };

  const updateUtaColors = (newColors) => {
    setUtaColors(prev => ({ ...prev, ...newColors }));
    
    // Aplicar nuevos colores al CSS
    const root = document.documentElement;
    Object.entries(newColors).forEach(([key, value]) => {
      const cssVar = `--uta-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });
  };

  const value = {
    theme,
    utaColors,
    toggleTheme,
    updateUtaColors,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};