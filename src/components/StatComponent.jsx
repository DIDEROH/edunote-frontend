export default function StatComponent({ children }) {
  return (
    <div className="stats shadow bg-slate-300 overflow-hidden w-max max-w-80">
        <div className="stat">
           {children}
        </div>
    </div>
  )
}

StatComponent.Title = function ({ children }) {
  return <div className="stat-title text-indigo-700 font-bold">{children}</div>
}
StatComponent.Value = function ({ children }) {
  return <div className="stat-value text-indigo-800">{children}</div>
}
StatComponent.Desc = function ({ children }) {
  return <div className="stat-desc">{children}</div>
}