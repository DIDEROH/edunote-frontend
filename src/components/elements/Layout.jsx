import { useRef, useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom'; // 👈 Ajout de useNavigate pour le bouton retour
import { Menu, X, Search, User2, Pencil, Plus, Filter, Printer, ArrowLeft, Trash2 } from 'lucide-react';
import { FiLogOut, FiInfo } from 'react-icons/fi';
import { LuBookMarked, LuCalendarRange, LuChartColumnIncreasing, LuClipboardPen, LuFileText, LuLayoutDashboard, LuPresentation, LuSettings, LuUserRound, LuUsers } from 'react-icons/lu';
import { TbSchool } from 'react-icons/tb';
import { PiStudent } from 'react-icons/pi';
import Logo from './Logo';
import SidebarItem from '../SidebarItem';
import { Appname, SIZE_ICON, VERSION } from '../../constants/constants';
import  { useNavigationPages } from '../../constants/pages';
import { useAuth } from '../../context/AuthContext';
import useShowConfirm from '../../hooks/UseShowConfirm';
import { LinkGhost } from '../ui/LinksComponents';



export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const mainRef = useRef(null);
  const location = useLocation();

  // Gestion de l'affichage des details
  const [showDetails, setShowDetails] = useState(false);

  // 🟢 Gestion des actions dynamiques de la Navbar partagées avec l'Outlet
  const [navbarActions, setNavbarActions] = useState({});
  

  // Gestion de la carte utilisateur
  const [userCard, setUserCard] = useState(false)

  const handleShowUserCard = () => {
    setUserCard(prev => !prev);
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
    Dashboard: <LuLayoutDashboard size={SIZE_ICON} />,
    Students: <PiStudent size={SIZE_ICON} />,
    ReportCard: <LuFileText size={SIZE_ICON} />,
    Teachers: <LuPresentation size={SIZE_ICON} />,
    Terms: <LuCalendarRange size={SIZE_ICON} />,
    Schools: <TbSchool size={SIZE_ICON} />,
    Classrooms: <LuUsers size={SIZE_ICON} />,
    Subjects: <LuBookMarked size={SIZE_ICON} />,
    Others: <LuSettings size={SIZE_ICON} />,
    Personnel: <LuUserRound size={SIZE_ICON} />,
    MarkEntry: <LuClipboardPen size={SIZE_ICON} />,
    HubMark: <LuChartColumnIncreasing size={SIZE_ICON} />
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
            <FiInfo size={15} />

            <div
              className={`
                overflow-hidden
                transition-all duration-300 ease-in-out
                ${
                  showDetails
                    ? "max-w-xs opacity-100 translate-x-0"
                    : "max-w-0 opacity-0 -translate-x-2"
                }
              `}
            >
              <div className="text-center min-w-30 whitespace-nowrap">
                <p>{Appname} Version {VERSION}</p>
                <p className="italic">Par Durinfo</p>
                <a href="tel:+237697630127">
                  +237 697 630 127
                </a>
              </div>
            </div>
          </div>
        </div>

      </aside>

      {/* Div d'espace pour fermer la sidebar en cliqunat hors de la zone */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main ref={mainRef} className="flex-1 h-screen overflow-y-auto relative custom-scrollbar">

        {/* le header */}
        <header className="sticky top-0 z-40 w-full px-4 h-13 flex items-center justify-between bg-base-100/50 backdrop-blur-md border-b border-base-content/5">
          <div className='flex items-center justify-between gap-3 w-full'>

            {/* cadre du bouton de menu et la barre de recherche  */}
            <div className='flex items-center w-full'>
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 lg:hidden hover:bg-primary hover:text-primary-content transition-all group btn btn-ghost btn-circle"
              >
                <Menu size={20} className="group-hover:rotate-12 transition-transform" />
              </button>

            </div>

            {/* 🟢 BLOC DES QUATRE ICÔNES DYNAMIQUES DEMANDÉES (S'affichent uniquement si la page active les définit) */}
            <div className="flex items-center gap-1.5 mr-2">
              {navbarActions.onSearch && (
                <button onClick={() => navbarActions.onSearch()} className="p-2 hover:bg-base-content/10 rounded-full text-base-content/80 hover:text-primary transition-colors cursor-pointer" title="Rechercher">
                  <Search size={17} />
                </button>
              )}
              {navbarActions.onDelete && (
                <button onClick={() => navbarActions.onDelete()} className="p-2 hover:bg-base-content/10 rounded-full text-base-content/80 hover:text-primary transition-colors cursor-pointer" title="Supprimer">
                  <Trash2 size={17} />
                </button>
              )}
              {navbarActions.onEdit && (
                <button onClick={() => navbarActions.onEdit()} className="p-2 hover:bg-base-content/10 rounded-full text-base-content/80 hover:text-primary transition-colors cursor-pointer" title="Modifier">
                  <Pencil size={17} />
                </button>
              )}
              {navbarActions.onAdd && (
                <button onClick={() => navbarActions.onAdd()} className="p-2 hover:bg-base-content/10 rounded-full text-base-content/80 hover:text-primary transition-colors cursor-pointer" title="Ajouter">
                  <Plus size={17} />
                </button>
              )}
              {navbarActions.onFilter && (
                <button onClick={() => navbarActions.onFilter()} className="p-2 hover:bg-base-content/10 rounded-full text-base-content/80 hover:text-primary transition-colors cursor-pointer" title="Filtrer">
                  <Filter size={17} />
                </button>
              )}
              {navbarActions.onPrint && (
                <button onClick={() => navbarActions.onPrint()} className="p-2 hover:bg-base-content/10 rounded-full text-base-content/80 hover:text-primary transition-colors cursor-pointer" title="Imprimer">
                  <Printer size={17} />
                </button>
              )}
              {navbarActions.onBack && (
                <button onClick={() => navbarActions.onBack()} className="p-2 hover:bg-base-content/10 rounded-full text-base-content/80 hover:text-primary transition-colors cursor-pointer" title="Retour">
                  <ArrowLeft size={17} />
                </button>
              )}
            </div>

            {/* Cadre de l'ivone de l'utilisateur  */}
            <div>
              <button className='btn btn-circle btn-ghost' onClick={handleShowUserCard}>
                <User2 size={17} />
              </button>
            </div>
            
          </div>
          
        </header>
        
        {/* Zonne d'aafichage de mes pages */}
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet context={{ setNavbarActions }} />
        </div>
        
      </main>


      {/* Le Bloc pour afficher le mini profil utilisateur */}
      <div
        className={`
          absolute right-0 top-14 z-50
          w-80
          rounded-xl
          border border-base-300/50
          bg-base-100/95
          backdrop-blur-md
          shadow-2xl
          overflow-hidden
          transition-all duration-300
          ${
            userCard
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 -translate-y-5 scale-95 pointer-events-none"
          }
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-20" />

        {/* Avatar */}
        <div className="flex justify-center -mt-10">
          <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-white">
            <User2 size={40} className="text-blue-600" />
          </div>
        </div>

        {/* Infos */}
        <div className="px-6 pb-6 pt-4 text-center">
          <h3 className="font-bold text-sm text-base-content">
            {userName}
          </h3>

          <p className="text-xs text-base-content/60 mt-1 truncate">
            {userEmail}
          </p>

          {/* Actions */}
          <div className="mt-6 space-y-2">
            <LinkGhost
              link="/user"
              color="
                flex items-center justify-center gap-2
                w-full py-3 rounded-xl
                bg-blue-50 hover:bg-blue-100
                text-blue-600 font-medium
                transition-colors text-xs
              "
            >
              <Pencil size={16} />
              Modifier le profil
            </LinkGhost>

            <LinkGhost
              onAction={handleLogOut}
              color="
                flex items-center justify-center gap-2
                w-full py-3 rounded-xl
                bg-red-50 hover:bg-red-100
                text-red-500 font-medium
                transition-colors text-xs
              "
            >
              <FiLogOut size={16} />
              Déconnexion
            </LinkGhost>
          </div>
        </div>
      </div>

    </div>
  );
}