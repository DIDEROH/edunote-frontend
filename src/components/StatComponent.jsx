export default function StatComponent({ children }) {
  return (
    <div className="stats bg-base-200 rounded-md overflow-hidden w-max max-w-80">
        <div className="stat">
           {children}
        </div>
    </div>
  )
}

StatComponent.Title = function ({ children }) {
  return <div className="stat-title text-base-content/60 font-medium">{children}</div>
}
StatComponent.Value = function ({ children }) {
  return <div className="stat-value text-primary">{children}</div>
}
StatComponent.Desc = function ({ children }) {
  return <div className="stat-desc">{children}</div>
}