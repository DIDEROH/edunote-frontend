import { useRef } from "react"
import { Outlet } from "react-router-dom"
import { useAnimations } from "../utils/animations"
import { RxCross2 } from "react-icons/rx"
import LogoComponent from "./Logo"

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

      {/* CONTENT */}
      <div className="drawer-content flex flex-col min-h-screen">

        {/* NAVBAR */}
        <div className="navbar bg-base-100 shadow-md sticky top-0 z-30">

          {/* LEFT */}
          <div className="navbar-start">
            <label
              htmlFor="sidebar-drawer"
              className="btn btn-ghost btn-circle lg:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
          </div>

          {/* CENTER */}
          <div className="navbar-center">
            <h1 className="text-xl font-black text-primary lg:hidden">
              EduNote
            </h1>
          </div>

          {/* RIGHT */}
          <div className="navbar-end gap-1">
            <LogoComponent size="sm" />
          </div>

        </div>

        {/* PAGE CONTENT */}
        <Outlet />
      </div>

      {/* SIDEBAR */}
      <div className="drawer-side z-40">
        <label
          htmlFor="sidebar-drawer"
          className="drawer-overlay"
        ></label>

        <aside className="w-72 min-h-full bg-base-200 border-r border-base-300 flex flex-col">

          {/* Logo */}
          <div className="py-4 px-6 border-b-4 border-base-300 relative flex items-center gap-4">
            <h2 className="text-2xl font-bold text-primary">
              EduNote
            </h2>

            <button
              type="button"
              className="absolute right-4 text-gray-500 hover:text-error transition lg:hidden"
              onClick={() => {
                drawerRef.current.checked = false;
              }}
            >
              <RxCross2 className="w-6 h-6" />
            </button>
          </div>

          {/* Menu */}
          <ul className="menu flex-1 py-4 px-2 gap-1">

            <li>
              <a className="active">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 10l9-7 9 7v10a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1V10z"
                  />
                </svg>

                Tableau de bord
              </a>
            </li>

            <li>
              <a>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2 12h2m16 0h2M12 2v2m0 16v2"
                  />
                </svg>

                Paramètres
              </a>
            </li>

            <li>
              <a>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H9"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 20H6a2 2 0 01-2-2V6a2 2 0 012-2h7"
                  />
                </svg>

                Déconnexion
              </a>
            </li>

          </ul>

          {/* Footer */}
          <div className="p-4 border-t border-base-300 text-center text-sm text-gray-500">
            © 2026 EduNote <span className="text-xs italic block text-primary/50">by Durinfo +237 650 626 366</span>
          </div>

        </aside>

      </div>

    </div>
  )
}

export default Layout