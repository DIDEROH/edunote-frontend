import React from 'react'

export default function BtnGoshtComponent({ children, action, css }) {
    const handleClick = (event) => {
        if (typeof action === 'function') {
            action(event); 
        }
    }
  return (
    <button className={`${css} btn btn-circle btn-ghost`} onClick={handleClick}>
        {children}
    </button>
  )
}
