export default function InputComponent({
  req, type, placeholder, valeur, name, onAction, icone, nom, register, errors
}) {
  const isHookForm = Boolean(register);

  // 1. Définition des règles de validation avec messages personnalisés
  const validationRules = {
    required: req ? "Ce champ est obligatoire" : false,
    // On peut ajouter des validations automatiques selon le type
    ...(type === 'email' && {
      pattern: { value: /^\S+@\S+$/i, message: "Email invalide" }
    }),
    ...(type === 'tel' && {
        minLength: { value: 9, message: "Numéro trop court" }
    })
  };

  const inputProps = isHookForm
    ? register(name, validationRules) // On passe les règles ici
    : {
        value: valeur || "",
        onChange: (e) => onAction && onAction(e)
      };

  // 2. Extraction du message d'erreur
  // Hook Form stocke l'erreur dans errors[name]
  const errorMsg = isHookForm ? errors?.[name]?.message : null;

  return (
    <div className="space-y-1.5 w-full text-left">
      <label className="text-xs font-medium text-base-content/60 ml-0.5">
        {nom} {req && <span className="text-error">*</span>}
      </label>

      <div className="relative">
        {icone && (
          <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 ${errorMsg ? 'text-error' : 'text-base-content/40'}`}>
            {icone}
          </div>
        )}

        <input
          {...inputProps}
          type={type}
          name={name}
          placeholder={placeholder}
          className={`w-full ${icone ? 'pl-10' : 'px-3.5'} pr-3.5 py-3 rounded-md outline-none text-sm text-base-content font-medium
            ${errorMsg ? 'bg-error/10' : 'bg-base-100'}`}
        />
      </div>

      {/* 3. Affichage visuel du message */}
      {errorMsg && (
        <p className="text-xs text-error ml-0.5">
          {errorMsg}
        </p>
      )}
    </div>
  );
}