import { ArrowLeftOnRectangleIcon, Squares2X2Icon, UserCircleIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { Outlet, useNavigate } from 'react-router-dom'
import NavbarAdmin from '../components/NavbarAdmin'
import Logo from '../components/Logo'
import { useHasRole } from '../hooks/UseHasRole'
import { useEffect, useState } from 'react'
import axiosClient from '../utils/AxiosClient'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const isAdmin = useHasRole('Admin')
  const [user, setUser] = useState(null)
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); 
    navigate("/login");
  };

  const fetchUser = async () => {
    axiosClient.get('/me')
      .then(({data}) => setUser(data))
      .catch((err) => console.error(err))
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    // <div className="drawer lg:drawer-open bg-slate-50 min-h-screen font-sans">
    <div className="drawer lg:drawer-open bg-[url(/gestion.webp)] bg-fixed bg-center bg-cover bg-no-repeat min-h-screen font-sans">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

      {/* 🌐 CONTENU PRINCIPAL */}
      <div className="drawer-content flex flex-col bg-slate-50/50">
        
        {/* 🔝 NAVBAR PREMIUM */}
        <nav className="h-20 w-full flex items-center justify-between px-8 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className='flex items-center gap-4 lg:hidden'>
            <label htmlFor="my-drawer-4" className="p-2 bg-slate-100 rounded-xl text-indigo-900 cursor-pointer">
              <Squares2X2Icon className='w-6' />
            </label>
            <Logo className="w-8" />
          </div>

          <div className='hidden lg:flex items-center gap-3 bg-slate-100/50 px-5 py-2.5 rounded-2xl border border-slate-200/50'>
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <UserCircleIcon className='w-5' />
              </div>
              <span className='text-[11px] font-black uppercase tracking-wider text-slate-700'>
                {user?.user?.first_name} {user?.user?.last_name}
              </span>
          </div>
          
          <div className='flex items-center gap-4'>
            
              <div className="aspect-square w-4 bg-emerald-600 rounded-full animate-pulse"></div>
            
            <button 
                className='group flex items-center gap-2 p-2.5 bg-red-100 hover:bg-red-600 text-slate-400 hover:text-red-50 cursor-pointer rounded-xl transition-all border border-slate-100 hover:border-red-100 shadow-sm'
                onClick={handleLogout}
            >
              <ArrowLeftOnRectangleIcon className='w-5' />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Quitter</span>
            </button>
          </div>
        </nav>

        {/* 💡 CONTENU DYNAMIQUE */}
        <div className="p-2 lg:p-4 flex-1">
          <div className="min-h-full">
            <Outlet />
             <p className="text-[9px] text-slate-100 bg-slate-800 font-black uppercase tracking-[2px]  gap-2 py-3 text-center rounded-lg">
                Edunote v2.0 •  par DURINFO <br /> <a href='tel:+237697630127'>+237 697 630 127</a>
             </p>
          </div>
          
        </div>
      </div>

      {/* 🧱 SIDEBAR DESIGN */}
      <div className="drawer-side z-50">
        <label htmlFor="my-drawer-4" className="drawer-overlay"></label>
        <div className="w-72 min-h-screen bg-white border-r border-slate-100 flex flex-col">
          
          {/* Logo Section */}
          <div className='flex items-center gap-4 mb-4'>
            <div className='p-2'>
                <Logo className="w-20" />
            </div>
            <div>
                <h1 className='text-xl font-black text-slate-800 tracking-tighter leading-none'>EduNote</h1>
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[3px]">Gestion Est</span>
            </div>
          </div>

          {/* Navigation Area */}
          <div className="flex-1 px-4 overflow-y-auto">
            <div className="space-y-1">
                 <NavbarAdmin />
            </div>
          </div>

          {/* User Profile Card Footer */}
          <div className="p-6 bg-slate-800 m-4 rounded-xl border border-slate-100">
             <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-200 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">
                    {user?.user?.first_name?.[0]}{user?.user?.last_name?.[0]}
                </div>
                <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-slate-200 uppercase truncate">
                        {user?.user?.first_name} {user?.user?.last_name}
                    </p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">
                        {isAdmin ? 'Administrateur' : 'Enseignant'}
                    </p>
                </div>
             </div>
          </div>

        </div>
      </div>

    </div>
  )
}

export default Dashboard