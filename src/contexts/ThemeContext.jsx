import { createContext, useContext } from 'react';

const ThemeContext = createContext({
  theme: 'night',
  changeTheme: () => {},
  toggleTheme: () => {},
  availableThemes: [],
});

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;