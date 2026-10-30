import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/** Champ de texte avec libellé, icône et bouton « afficher le mot de passe » */
export default function TextInput({ label, icon: Icon, error, id, className = "", ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = props.type === "password";
  const inputType = isPasswordType && showPassword ? "text" : props.type;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="ui-label">
          {label}
        </label>
      )}
      <div className={`ui-field flex items-center gap-2.5 ${error ? "ui-field-error" : ""}`}>
        {Icon && <Icon size={16} className={`shrink-0 ${error ? "text-error" : "text-base-content/40"}`} />}

        <input
          id={id}
          {...props}
          type={inputType}
          className="w-full bg-transparent text-sm text-base-content outline-none placeholder:text-base-content/40"
        />

        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="shrink-0 text-base-content/40 transition-colors duration-150 hover:text-base-content focus:outline-none"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-error">{error.message}</p>}
    </div>
  );
}
