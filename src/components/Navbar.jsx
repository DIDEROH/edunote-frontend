import { Fragment } from 'react'

function Navbar({ children, className = '' }) {
  return (
    <header className={`w-full bg-white border-b border-slate-200 px-6 py-4 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {children}
      </div>
    </header>
  )
}

Navbar.Left = function NavbarLeft({ children, className = '' }) {
  return (
    <div className={`flex-1 min-w-0 ${className}`}>
      {children}
    </div>
  )
}

Navbar.Right = function NavbarRight({ children, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {children}
    </div>
  )
}

export default Navbar
