import { useRef } from "react"
import { Outlet, NavLink } from "react-router-dom"
import { useAnimations } from "../utils/animations"
import { RxHome } from "react-icons/rx"
import { FiFileText, FiPrinter } from "react-icons/fi"
import { MdPeople, MdOutlineSchool } from "react-icons/md"
import { FaChalkboardTeacher } from "react-icons/fa"
import { BiBook } from "react-icons/bi"
import { AiOutlineBarChart, AiOutlineSetting } from "react-icons/ai"
import LogoComponent from "./Logo"
import FloatingActions from "./FloatingActions"
import { useHasRole } from "../hooks/UseHasRole"

const SidebarItems = [
  { icon: RxHome, to: "/edunote", text: "Tableau de bord", roles: ["Admin", "Director", "Teacher"] },
  { icon: FiFileText, to: "/edunote/bulletins", text: "Bulletins", roles: ["Admin", "Director"] },

  // Students & personnel
  { icon: MdPeople, to: "/edunote/students", text: "Étudiants", roles: ["Admin", "Director"] },
  { icon: MdPeople, to: "/edunote/add-student", text: "Ajouter un étudiant", roles: ["Admin", "Director"] },
  { icon: MdPeople, to: "/edunote/personnel", text: "Personnels", roles: ["Admin"] },

  // Academic / classes
  { icon: BiBook, to: "/edunote/subjects", text: "Matières", roles: ["Admin"] },
  { icon: MdOutlineSchool, to: "/edunote/school", text: "École / Paramètres", roles: ["Admin", "Director"] },
  { icon: AiOutlineBarChart, to: "/edunote/stats", text: "Statistiques", roles: ["Admin"] },

  // Teachers
  { icon: FaChalkboardTeacher, to: "/edunote/teachers/list", text: "Enseignants", roles: ["Admin", "Director"] },

  // Misc
  { icon: AiOutlineSetting, to: "/edunote/skills", text: "Compétences", roles: ["Admin"] },
]

function Layout() {
  const containerRef = useRef(null)
  const drawerRef = useRef(null)
  useAnimations(containerRef)

  return (
    <div ref={containerRef} className="drawer lg:drawer-open">
      <input
        ref={drawerRef}
        id="sidebar-drawer"
        type="checkbox"
        className="drawer-toggle"
      />

      <div className="drawer-content flex flex-col min-h-screen bg-[url('/gestion.webp')] bg-fixed bg-center bg-cover">

        <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 bg-white/50 px-4 py-3 backdrop-blur-sm lg:px-6 sticky top-0 z-100">
          <div className="flex items-center gap-3">
            <label htmlFor="sidebar-drawer" className="btn btn-ghost btn-circle lg:hidden p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
            <div className="flex items-center gap-3">
              <LogoComponent className="w-12" />
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">EduNote</p>
                <h1 className="text-xs font-semibold text-slate-900">Solution de gestion scolaire</h1>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-slate-500 text-sm">
            <FiPrinter className="h-5 w-5" />
            <span>Actions rapides</span>
          </div>
        </div>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>

      </div>

      <div className="drawer-side z-40">
        <label htmlFor="sidebar-drawer" className="drawer-overlay"></label>

        <aside className="w-64 min-h-full bg-white/90 border-r border-slate-200 relative flex flex-col">
          <div className="py-5 px-6 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Menu</h2>
          </div>

          <ul className="menu flex flex-col gap-2 p-4 text-[10px]">
            {SidebarItems?.map((item) => {
              const Icon = item.icon
              // Vérifier les rôles si fournis
              if (item.roles && item.roles.length > 0) {
                const allowed = item.roles.some((r) => useHasRole(r))
                if (!allowed) return null
              }

              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 text-sm font-medium transition-all w-full lg:text-[10px] ${
                        isActive ? 'border-l-4 border-blue-500 bg-blue-200 text-slate-950' : 'text-slate-700 hover:border-l-4 hover:border-blue-500 hover:bg-blue-50'
                      }`
                    }
                  >
                    <Icon size={17} />
                    {item.text}
                  </NavLink>
                </li>
              )
            })}
          </ul>

          <div className="mt-auto p-4 text-xs text-slate-500 text-center flex flex-col gap-1">
            © 2026 EduNote
            <span className="italic font-mono text-[0.8em]">
              Par DURINFO &nbsp;|&nbsp;
              <a href="tel:+237697630127" target="_blank" rel="noopener noreferrer">
                Tel : +237 697 63 01 27
              </a>
            </span>
          </div>
        </aside>
      </div>

      <FloatingActions />
    </div>
  )
}

export default Layout