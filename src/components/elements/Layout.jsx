import { useRef, useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { HomeIcon, Menu, X, Briefcase, FlaskConical, BookOpen, Award, User, Phone, Search, User2, Pencil } from 'lucide-react';
import { FiLogOut, FiInbox, FiInfo } from 'react-icons/fi';
import Logo from './Logo';
import SidebarItem from '../SidebarItem';
import { Appname, SIZE_ICON, VERSION } from '../../constants/constants';
import  { useNavigationPages } from '../../constants/pages';
import { useAuth } from '../../context/AuthContext';
import useShowConfirm from '../../hooks/UseShowConfirm';
import { LinkGhost } from '../LinksComponents';



export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const mainRef = useRef(null);
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Gestion de l'affichage des details
  const [showDetails, setShowDetails] = useState(false);
  

  // Gestion de la carte utilisateur
  const [userCard, setUserCard] = useState(false)

  const handleShowUserCard = () => {
    setUserCard(prev => !prev);
  }

  const toggleSearch = () => {
    setIsSearchOpen(prev => !prev);
  }
  const pages = useNavigationPages();

  // Gestion de la deconnexion
  const { logout, userName, userEmail } = useAuth();
  const showConfirm = useShowConfirm();
  const handleLogOut = () => {
    showConfirm({
      title: "Déconnexion",
      message: "Voulez-vous vraiment vous déconnecter ?",
      onSuccess: () => {logout()},
      onError: () => {closeSidebarOnMobile()}
    })
  }


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
    HomeIcon: <HomeIcon size={SIZE_ICON} />,
    Logout: <FiLogOut size={SIZE_ICON} />,
    Dashboard: <HomeIcon size={SIZE_ICON} />,
    Students: <BookOpen size={SIZE_ICON} />,
    Bulletins: <Award size={SIZE_ICON} />,
    Effectifs: <Briefcase size={SIZE_ICON} />,
    School: <FlaskConical size={SIZE_ICON} />,
    Teachers: <User size={SIZE_ICON} />,
    Reports: <Award size={SIZE_ICON} />,
    Contact: <Phone size={SIZE_ICON} />,
  };

  return (
    <div className="relative min-h-screen bg-base-100 text-base-content flex overflow-hidden font-sans transition-colors duration-300">
      
      <div className="fixed inset-0 overflow-hidden -z-10 opacity-30">
        <div className="neon-blob absolute top-[-5%] left-[-5%] w-125 h-125 bg-primary/20 blur-[120px] rounded-full"></div>
        <div className="neon-blob absolute bottom-[-5%] right-[-5%] w-150 h-150 bg-secondary/10 blur-[150px] rounded-full"></div>
      </div>

      <aside className={`
          fixed lg:relative inset-y-0 left-0 z-50
          flex flex-col w-64 lg:w-15 lg:hover:w-64 
          transition-all duration-500 ease-in-out 
          bg-base-200/95 lg:bg-base-200/40 backdrop-blur-xl border-r border-base-content/10 group
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
          onMouseOver={() => {setShowDetails(true)}}
          onMouseLeave={() => {setShowDetails(false)}}
      >

        {/* Bouton de fermeture du menu latéral */}
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className={`lg:hidden hover:scale-125 absolute top-7 btn btn-circle btn-base-300 ${isSidebarOpen ? "translate-x-68" : "translate-x-20"} p-2 hover:text-primary transition cursor-pointer duration-600`}
        >
          <X size={24} />
        </button>

        {/* Logo et noms de la barre latérale */}
        <div className="group px-3 py-2 mb-3 flex items-center justify-center pointer">
          <Logo className={`w-10 ml-8 group-hover:scale-0 transition duration-300 ${isSidebarOpen ? "scale-0" : ""}`} />
          <div className={`invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-500 w-full h-10 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center font-bold text-secondary-content shrink-0 shadow-lg -translate-x-10 ${isSidebarOpen ? "opacity-100 visible" : ""}`}>
            {Appname}
          </div>
        </div>
        
        {/* Zonne où je mappe tous mes liens  */}
        <nav className="flex-1 px-4 space-y-4 overflow-x-hidden overflow-y-auto pb-5">
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

        {/* Zone de raccourcis pour afficher l'utilisateur */}
        <div className="p-6 border-t border-base-content/5 text-[10px] text-slate-600 font-semibold">
          <div className="flex items-center gap-3">
            <FiInfo size={15}/>
            {
              showDetails && (
                <div className='animate-reveal text-center min-w-30'>
                  <p>{Appname} Version {VERSION}</p>
                  <p className='itallic text-center'>Par Durinfo</p>
                  <a href="tel:+237697630127">+237 697 630 127</a>
                </div>
              )
            }
          </div>
        </div>

      </aside>

      {/* Div d'espace pour fermer la sidebar en cliqunat hors de la zone */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main ref={mainRef} className="flex-1 h-screen overflow-y-auto relative custom-scrollbar">

        {/* le header */}
        <header className="sticky top-0 z-40 w-full px-4 h-15 flex items-center justify-between bg-base-100/50 backdrop-blur-md border-b border-base-content/5">
          <div className='flex items-center justify-between gap-3 w-full'>

            {/* cadre du bouton de menu et la barre de recherche  */}
            <div className='flex items-center w-full'>
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 lg:hidden hover:bg-primary hover:text-primary-content transition-all group btn btn-ghost btn-circle"
              >
                <Menu size={20} className="group-hover:rotate-12 transition-transform" />
              </button>


              {/* BARRE DE RECHERCHE POUR UNE UTILISATION ULTERIEURE */}
              <div className={`relative transition-all duration-500 ease-out flex items-center ${isSearchOpen ? 'flex-1 mx-4' : 'w-10'}`}>
                <button onClick={toggleSearch} className="p-2 hover:bg-base-content/10 rounded-full z-10 transition-colors cursor-pointer">
                  {isSearchOpen ? <X size={24} /> : <Search size={24} />}
                </button>
                <input 
                  ref={searchInputRef}
                  type="text"
                  placeholder="Rechercher..."
                  className={`absolute left-0 pl-12 pr-6 py-2 bg-base-200 border border-base-content/10 rounded-full outline-none focus:border-primary/50 transition-all duration-500 ${isSearchOpen ? 'w-full opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}
                />
              </div>
            </div>

            {/* Cadre de l'ivone de l'utilisateur  */}
            <div>
              <button className='btn btn-circle btn-ghost' onClick={handleShowUserCard}>
                <User2 size={22} />
              </button>
            </div>
            
          </div>
          
        </header>
        
        {/* Zonne d'aafichage de mes pages */}
        <Outlet />
        
      </main>


      {/* Le Bloc pour afficher le mini profil utilisateur */}
      <div className={`absolute right-0 top-16 z-10 border border-base-300 px-6 py-2 rounded-md shadow-lg text-sm flex items-center gap-2 bg-base-100 w-75 flex-col transition-all duration-300 ${userCard ? "" : "-translate-y-full scale-0 "}`}>
          <div>
            <User2 size={60} color='blue' />
          </div>

          <div className='text-center mx-auto'>
            <p className='font-bold text-blue-700'>{userName}</p>
            <p className='italic text-blue-700 text-xs font-semibold'>{userEmail}</p>
            <div className='flex text-xs gap-2 my-4'>
              <LinkGhost color="text-blue-500" link={"/user"}>
                <Pencil size={15} color={"blue"} /> Modifier
              </LinkGhost>
              <LinkGhost color="text-red-400" onAction={handleLogOut}>
                <FiLogOut size={15} color={"red"} /> Déconnexion
              </LinkGhost>
            </div>
          </div>
      </div>

    </div>
  );
}