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
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-base-content/60">
          {label}
        </label>
      )}
      <div
        className={`flex items-center gap-3 rounded-md px-3.5 py-3 transition-colors duration-150 ${
          error ? "bg-error/10" : "bg-base-100"
        }`}
      >
        {Icon && <Icon size={16} className={`${error ? "text-error" : "text-base-content/40"}`} />}

        <input
          id={id}
          {...props}
          type={inputType} // On applique le type dynamique ici
          className="w-full bg-transparent outline-none text-sm text-base-content placeholder:text-base-content/40"
        />

        {/* On affiche l'icône cliquable uniquement si type="password" a été passé en prop */}
        {isPasswordType && (
          <button
            type="button" // Important pour éviter de soumettre le formulaire
            onClick={() => setShowPassword(!showPassword)}
            className="text-base-content/40 hover:text-base-content transition-colors duration-150 focus:outline-none"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-error">{error.message}</p>}
    </div>
  );
}
