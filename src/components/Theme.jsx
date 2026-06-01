import { useTheme } from '../contexts/ThemeContext.jsx';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();


  return (
    <label className="swap swap-rotate">
      {/* Checkbox masquée qui contrôle l'état */}
      <input
        type="checkbox"
        onChange={toggleTheme}
        checked={theme === "night"}
      />

      {/* Icône soleil */}
      <svg
        className="swap-on h-6 w-6"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="yellow"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 
             6.364l-1.414-1.414M6.05 6.05L4.636 
             4.636m12.728 0l-1.414 1.414M6.05 
             17.95l-1.414 1.414M12 8a4 4 0 100 
             8 4 4 0 000-8z"
        />
      </svg>

      {/* Icône lune */}
      <svg
        className="swap-off h-6 w-6"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#0284CA"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 12.79A9 9 0 1111.21 
             3a7 7 0 009.79 9.79z"
        />
      </svg>
    </label>
  );
};

export default ThemeToggle;