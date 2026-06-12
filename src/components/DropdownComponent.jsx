import React from 'react'

export default function DropdownComponent({ children }) {
  return (
    <div className="dropdown dropdown-end">
        {children}
    </div>
  )
}

DropdownComponent.Icon = function ({children}) {
    return <div tabIndex={0} role="button" className="btn btn-circle btn-xs m-1">
            {children}
        </div>  
}

DropdownComponent.Items = function ({children}) {
    return <ul tabIndex="-1" className="dropdown-content menu bg-slate-100 rounded-box z-1 w-52 p-2 shadow-sm text-xs gap-2.5">
            {children}
        </ul> 
}
