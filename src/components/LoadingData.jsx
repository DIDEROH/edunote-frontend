import React from 'react'

function LoadingData({texte}) {
  return (
    <div className="flex flex-col items-center py-6">
        <span className="loading loading-spinner loading-md text-primary"></span>
        <p className="text-sm text-base-content/60 mt-2 font-medium">
            {texte ? texte : "Chargement..."}
        </p>
    </div>
  )
}

export default LoadingData
