import { useMemo, useEffect, useState } from 'react';
import debounce from 'lodash.debounce';

export default function SearchBar({ action, }) {
  const [value, setValue] = useState("")

  // À l'intérieur de votre composant
  const debouncedAction = useMemo(
      () => debounce((event) => {
          if (typeof action === 'function') {
            
              action(event);
          }
      }, 500), // Délai de 500ms
      [action]
  );

  const handleChange = (e) => {
      const val = e.target.value
      setValue(val)
      debouncedAction(val);
  };

  // Nettoyage pour éviter les fuites de mémoire
  useEffect(() => {
      return () => debouncedAction.cancel();
  }, [debouncedAction]);

  return (
    <label className="input rounded-full outline-none border-none bg-slate-300">
        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2.5"
            fill="none"
            stroke="currentColor"
            >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
            </g>
        </svg>
        <input
          type="search"
          placeholder="Rechercher un élève..."
          value={value}
          onChange={handleChange}
        />
    </label>
  )
}