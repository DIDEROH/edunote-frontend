import { useEffect, useMemo, useState } from 'react';
import ThemeContext from '../contexts/ThemeContext.jsx';

const STORAGE_KEY = 'durinfo_theme';
const DEFAULT_THEME = 'light';

// Tous les thèmes disponibles dans DaisyUI
export const AVAILABLE_THEMES = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate',
  'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden',
  'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black',
  'luxury', 'dracula', 'exodia', 'business', 'acid', 'lemonade', 'night',
  'coffee', 'winter', 'dim', 'nord', 'sunset'
];

export default function ThemeProvider({ children }) {
  // On initialise directement avec la valeur du localStorage ou par défaut
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && AVAILABLE_THEMES.includes(stored) ? stored : DEFAULT_THEME;
  });

  // On ne garde qu'un seul useEffect pour synchroniser le DOM et le Storage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const changeTheme = (newTheme) => {
    if (AVAILABLE_THEMES.includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'night' : 'light'));
  };

  const contextValue = useMemo(() => ({ theme, changeTheme, toggleTheme, availableThemes: AVAILABLE_THEMES }), [theme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
