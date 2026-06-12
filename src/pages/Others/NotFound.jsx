import React from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../components/Logo'
import { ArrowLeftCircleIcon, HomeIcon } from '@heroicons/react/24/outline'

 function NotFound() {
  const navigate = useNavigate()
  const handleRetour = () => {
    navigate(-1)
  }

  return (
    <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8 h-screen">
      <div className="text-center">
        <Logo className="mx-auto w-50 rounded-full mb-2" />
        <div className="text-4xl font-black text-indigo-400">404</div>
        <h1 className="mt-4 text-xs font-black tracking-tight text-balance">
          Page Introuvable
        </h1>
        <p className=" text-xs font-medium text-pretty text-indigo-400">
          Nous sommes désolé, nous n'avons pas trouvé la page que vous souhaitez consulter.
        </p>
        <div className="mt-6 flex items-center text-xs justify-center gap-10 font-semibold flex-wrap">
          <button onClick={handleRetour} className='text-primary cursor-pointer hover:scale-95 transition inline-flex items-center gap-1'>
            <ArrowLeftCircleIcon className='w-4 inline-block'/> Retour 
          </button>

          <a
            href="/"
            className="text-green-700 cursor-pointer hover:scale-95 transition inline-flex items-center gap-1"
          >
            <HomeIcon className='w-4 inline-block'/> Accueil
          </a>
        </div>
      </div>
    </main>
  )
}


export default NotFound