import { Link } from 'react-router-dom'

export default function SidebarItem({ icon, label, to, active = false, onClick }) {
  return (
    <Link 
        to={to || "#"} 
        onClick={onClick}
        className={`flex items-center gap-3 cursor-pointer group/item relative py-1 transition-colors
        ${active ? 'text-primary' : 'text-base-content/60 hover:text-base-content'}`}
    >
        <div className="shrink-0 transition-colors duration-150 group-hover/item:text-primary">
        {icon}
        </div>
        <span className="text-xs font-medium opacity-100 lg:opacity-0 lg:group-hover:opacity-100 group-hover/item:text-primary transition-opacity duration-150 whitespace-nowrap">
        {label}
        </span>
        {active && (
        <div className="absolute -left-4 w-1 h-6 bg-primary rounded-r-sm" />
        )}
    </Link>
  )
}
