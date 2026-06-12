import { NavLink } from "react-router-dom"

export default function DrawerLink({ to, children, className = "" }) {
  const closeDrawer = () => {
    const drawer = document.getElementById("my-drawer-4")
    if (drawer) drawer.checked = false
  }

  const lnkActive = "bg-primary text-primary-content font-semibold"
    const lnkNoActive = "hover:bg-slate-200"


  return (
    <NavLink
      to={to}
      onClick={closeDrawer}
      className={({ isActive }) =>
        `${isActive ? lnkActive : lnkNoActive} ${className}`
      }
    >
      {children}
    </NavLink>
  )
}
