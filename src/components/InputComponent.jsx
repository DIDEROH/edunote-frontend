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
    <div className="space-y-2 w-full text-left">
      <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 tracking-wider">
        {nom} {req && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative group">
        {icone && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errorMsg ? 'text-red-400' : 'text-slate-400 group-focus-within:text-indigo-500'}`}>
            {icone}
          </div>
        )}
        
        <input
          {...inputProps}
          type={type}
          name={name}
          placeholder={placeholder}
          className={`w-full ${icone ? 'pl-11' : 'px-4'} pr-4 py-3.5 rounded-2xl transition-all outline-none text-slate-700 font-medium 
            ${errorMsg 
              ? 'bg-red-50 border-red-200 focus:border-red-500' 
              : 'bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
            } border-2`}
        />
      </div>

      {/* 3. Affichage visuel du message */}
      {errorMsg && (
        <p className="text-[10px] font-bold text-red-500 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          {errorMsg}
        </p>
      )}
    </div>
  );
}