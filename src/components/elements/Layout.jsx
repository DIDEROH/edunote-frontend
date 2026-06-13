import { useRef, useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { HomeIcon, Menu, X, Briefcase, FlaskConical, BookOpen, Award, User, Phone } from 'lucide-react';
import Logo from './Logo';
import SidebarItem from '../SidebarItem';
import { useAuth } from '../../context/AuthContext';
import { Appname } from '../../utils/constants';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const mainRef = useRef(null);
  const location = useLocation();
  const { roles } = useAuth();

  const isAdmin = Array.isArray(roles) && roles.includes('Admin');
  const isTeacher = Array.isArray(roles) && roles.includes('Teacher');
  const isDirector = Array.isArray(roles) && roles.includes('Director');

  // Scroll to top on route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);


  // Ferme le sidebar sur mobile après un clic
  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const iconMap = {
    HomeIcon: <HomeIcon size={22} />,
    Dashboard: <HomeIcon size={22} />,
    Students: <BookOpen size={22} />,
    Bulletins: <Award size={22} />,
    Effectifs: <Briefcase size={22} />,
    School: <FlaskConical size={22} />,
    Teachers: <User size={22} />,
    Reports: <Award size={22} />,
    Contact: <Phone size={22} />,
  };

  const pages = [
    { name: 'Tableau de bord', to: '/edunote', icon: 'HomeIcon' },
    { name: 'Étudiants', to: '/edunote/students', icon: 'Students' },
    { name: 'Bulletins', to: '/edunote/bulletins', icon: 'Bulletins' },
  ];

  if (isAdmin) {
    pages.push(
      { name: 'Effectifs', to: '/edunote/effectifs', icon: 'Effectifs' },
      { name: 'Écoles', to: '/edunote/school', icon: 'School' }
    );
  }

  if (isTeacher) {
    pages.push(
      { name: 'Saisie des notes', to: '/edunote/marks/entry', icon: 'Settings' },
      { name: 'Hub des notes', to: '/edunote/marks/hub', icon: 'Bulletins' }
    );
  }

  if (isDirector) {
    pages.push(
      { name: 'Directeurs', to: '/edunote/directors/list', icon: 'Teachers' },
      { name: 'Performances', to: '/edunote/director/performances', icon: 'Reports' }
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex overflow-hidden font-sans transition-colors duration-300">
      
      <div className="fixed inset-0 overflow-hidden -z-10 opacity-30">
        <div className="neon-blob absolute top-[-5%] left-[-5%] w-125 h-125 bg-primary/20 blur-[120px] rounded-full"></div>
        <div className="neon-blob absolute bottom-[-5%] right-[-5%] w-150 h-150 bg-secondary/10 blur-[150px] rounded-full"></div>
      </div>

      <aside className={`
          fixed lg:relative inset-y-0 left-0 z-50
          flex flex-col w-64 lg:w-20 lg:hover:w-64 
          transition-all duration-500 ease-in-out 
          bg-base-200/95 lg:bg-base-200/40 backdrop-blur-xl border-r border-base-content/10 group
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Bouton de fermeture du menu latéral */}
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className={`lg:hidden hover:scale-125 absolute top-7 btn btn-circle btn-base-300 ${isSidebarOpen ? "translate-x-68" : "translate-x-20"} p-2 hover:text-primary transition cursor-pointer duration-600`}
        >
          <X size={24} />
        </button>

        {/* Logo et noms de la barre latérale */}
        <div className="group p-6 mb-6 flex items-center justify-center pointer">
          <Logo className={`w-12 group-hover:scale-0 transition duration-300 ${isSidebarOpen ? "scale-0" : ""}`} />
          <div className={`invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-500 w-full h-10 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center font-bold text-secondary-content shrink-0 shadow-lg -translate-x-10 ${isSidebarOpen ? "opacity-100 visible" : ""}`}>
            {Appname}
          </div>
        </div>

        {/* Zonne où je mappe tous mes liens  */}
        <nav className="flex-1 px-4 space-y-6 overflow-x-hidden overflow-y-auto pb-5">
          {pages.map((page, index) => (
            <SidebarItem 
              key={index} 
              icon={iconMap[page.icon]} 
              label={page.name} 
              to={page.to} 
              active={location.pathname === page.to} 
              onClick={closeSidebarOnMobile}
            />
          ))}
        </nav>

        {/* Zone de raccourcis */}
        <div className="p-6 border-t border-base-content/5">
          <SidebarItem 
            icon={iconMap.Dashboard} 
            label="Retour au tableau de bord" 
            to="/edunote" 
            active={location.pathname === '/edunote'} 
            onClick={closeSidebarOnMobile}
          />
        </div>

      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main ref={mainRef} className="flex-1 h-screen overflow-y-auto relative custom-scrollbar">

        {/* le header */}
        <header className="sticky top-0 z-40 w-full px-4 h-15 flex items-center justify-between bg-base-100/50 backdrop-blur-md border-b border-base-content/5">
          <div className='flex items-center gap-3 w-full'>

            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 lg:hidden hover:bg-primary hover:text-primary-content transition-all group btn btn-ghost btn-circle"
            >
              <Menu size={20} className="group-hover:rotate-12 transition-transform" />
            </button>


            {/* BARRE DE RECHERCHE POUR UNE UTILISATION ULTERIEURE */}
            {/* <div className={`relative transition-all duration-500 ease-out flex items-center ${isSearchOpen ? 'flex-1 mx-4' : 'w-10'}`}>
              <button onClick={toggleSearch} className="p-2 hover:bg-base-content/10 rounded-full z-10 transition-colors cursor-pointer">
                {isSearchOpen ? <X size={24} /> : <Search size={24} />}
              </button>
              <input 
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher..."
                className={`absolute left-0 pl-12 pr-6 py-2 bg-base-200 border border-base-content/10 rounded-full outline-none focus:border-primary/50 transition-all duration-500 ${isSearchOpen ? 'w-full opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}
              />
            </div> */}
            
          </div>
          

        </header>

        {/* Zonne d'aafichage de mes pages */}
        <Outlet />
        
      </main>

    </div>
  );
}