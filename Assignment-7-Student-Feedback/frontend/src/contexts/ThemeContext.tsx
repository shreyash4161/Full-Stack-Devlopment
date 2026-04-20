import React, { createContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme');
    return (stored as Theme) || 'system';
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    let actualTheme = theme;

    if (theme === 'system') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    const isCurrentlyDark = actualTheme === 'dark';
    setIsDark(isCurrentlyDark);

    if (isCurrentlyDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    handleSetTheme(isDark ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme: handleSetTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
