import React from "react";

export default function TextInput({ label, icon: Icon, error, id, className = "", ...props }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div
        className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition ${
          error ? "border-rose-500 bg-rose-50" : "border-slate-200 bg-slate-50"
        }`}
      >
        {Icon && <Icon size={18} className={`text-slate-400 ${error ? "text-rose-500" : ""}`} />}
        <input
          id={id}
          className="w-full bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-600">{error.message}</p>}
    </div>
  );
}
