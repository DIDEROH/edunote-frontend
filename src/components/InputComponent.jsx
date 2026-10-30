export default function InputComponent({
  req, type, placeholder, valeur, name, onAction, icone, nom, register, errors
}) {
  const isHookForm = Boolean(register);

  // Règles de validation avec messages personnalisés
  const validationRules = {
    required: req ? "Ce champ est obligatoire" : false,
    ...(type === 'email' && {
      pattern: { value: /^\S+@\S+$/i, message: "Email invalide" }
    }),
    ...(type === 'tel' && {
      minLength: { value: 9, message: "Numéro trop court" }
    })
  };

  const inputProps = isHookForm
    ? register(name, validationRules)
    : {
        value: valeur || "",
        onChange: (e) => onAction && onAction(e)
      };

  // Hook Form stocke l'erreur dans errors[name]
  const errorMsg = isHookForm ? errors?.[name]?.message : null;

  return (
    <div className="w-full text-left">
      <label className="ui-label">
        {nom} {req && <span className="text-error">*</span>}
      </label>

      <div className="relative">
        {icone && (
          <div className={`pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 transition-colors duration-150 ${errorMsg ? 'text-error' : 'text-base-content/40'}`}>
            {icone}
          </div>
        )}

        <input
          {...inputProps}
          type={type}
          name={name}
          placeholder={placeholder}
          className={`ui-field ${icone ? 'pl-10' : ''} ${errorMsg ? 'ui-field-error' : ''}`}
        />
      </div>

      {errorMsg && (
        <p className="mt-1.5 text-xs text-error">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
