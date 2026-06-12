export default function Navbar({ children, col }) {
  return (
    <nav className={`
      /* Structure & Position */
      w-full sticky top-20 z-30 mb-6
      /* Design Premium */
      bg-white/70 backdrop-blur-xl border-b border-slate-300
      /* Flexibilité */
      flex items-center justify-between py-4 px-2
      ${col && 'flex-col md:flex-row gap-4 md:gap-0'}
    `}>
      {children}
    </nav>
  )
}

Navbar.Left = function ({ children }) {
  return (
    <div className="flex items-center gap-4 flex-1 justify-center md:justify-start">
      {children}
    </div>
  )
}

Navbar.Center = function ({ children }) {
  return (
    <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide px-4">
      {children}
    </div>
  )
}

Navbar.Right = function ({ children }) {
  return (
    <div className="flex items-center justify-end gap-3 flex-1">
      {children}
    </div>
  )
}