import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function TextInput({ label, icon: Icon, error, id, className = "", ...props }) {
  // État interne pour gérer la visibilité du mot de passe
  const [showPassword, setShowPassword] = useState(false);

  // On détecte si l'input est initialement un mot de passe
  const isPasswordType = props.type === "password";

  // Le type final de l'input dépend de l'état showPassword
  const inputType = isPasswordType && showPassword ? "text" : props.type;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-400">
          {label}
        </label>
      )}
      <div
        className={`flex items-center gap-3 border-b px-3 py-2 transition ${
          error ? "border-rose-500" : "border-slate-200 bg-transparent"
        }`}
      >
        {Icon && <Icon size={18} className={`text-slate-400 ${error ? "text-rose-500" : ""}`} />}
        
        <input
          id={id}
          {...props}
          type={inputType} // On applique le type dynamique ici
          className="w-full bg-transparent outline-none text-sm text-slate-200 placeholder:text-slate-400"
        />

        {/* On affiche l'icône cliquable uniquement si type="password" a été passé en prop */}
        {isPasswordType && (
          <button
            type="button" // Important pour éviter de soumettre le formulaire
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-slate-200 transition focus:outline-none"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-rose-600 italic">{error.message}</p>}
    </div>
  );
}
