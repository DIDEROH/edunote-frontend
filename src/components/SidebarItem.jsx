import React from 'react'
import { Link } from 'react-router-dom'

export default function SidebarItem({ icon, label, to, active = false, onClick }) {
  return (
    <Link 
        to={to || "#"} 
        onClick={onClick}
        className={`flex items-center gap-4 cursor-pointer group/item relative py-2 transition-colors
        ${active ? 'text-primary' : 'text-base-content/60 hover:text-base-content'}`}
    >
        <div className={`shrink-0 transition-all duration-300 group-hover/item:scale-110 group-hover/item:text-primary ${active ? 'scale-110' : ''}`}>
        {icon}
        </div>
        <span className="text-sm font-bold opacity-100 lg:opacity-0 lg:group-hover:opacity-100 group-hover/item:text-primary transition-all duration-500 whitespace-nowrap">
        {label}
        </span>
        {active && (
        <div className="absolute -left-4 w-1.5 h-8 bg-primary rounded-r-full shadow-[0_0_15px_rgba(var(--p),0.5)]" />
        )}
    </Link>
  )
}
