export default function Toggle({ label, checked, onChange }) {
  return (
    <div className="form-control">
      <label className="label cursor-pointer gap-4">
        {label && <span className="label-text">{label}</span>} 
        <input 
          type="checkbox" 
          className="toggle toggle-accent toggle-xs"
          checked={checked}        // État piloté par le parent
          onChange={(e) => onChange(e.target.checked)} // Déclenche la fonction
        />
      </label>
    </div>
  )
}