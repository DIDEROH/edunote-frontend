import { useRef, useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom'; // 👈 Ajout de useNavigate pour le bouton retour
import { Menu, X, Search, User2, Pencil, Plus, Filter, Printer, ArrowLeft, Trash2, WifiOff, RefreshCw, Download, FileSpreadsheet } from 'lucide-react';
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
import useOfflineStatus from '../../hooks/useOfflineStatus';
import useInstallPrompt from '../../hooks/useInstallPrompt';
import { startAutoSync } from '../../utils/offline/sync';
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

  // Mode hors ligne : état de connexion, saisies en attente, installation
  const { offline, pending, syncing, sync } = useOfflineStatus();
  const { installable, install } = useInstallPrompt();

  useEffect(() => startAutoSync(), []);

  // Gestion de la deconnexion
  const { logout, userName, userEmail } = useAuth();
  const showConfirm = useShowConfirm();
  const handleLogOut = () => {
    setUserCard(false);
    showConfirm({
      title: "Déconnexion",
      message: pending > 0
        ? `${pending} enregistrement(s) fait(s) hors ligne n'ont pas encore été envoyé(s) et seront retirés de la file d'attente (vos brouillons de notes restent sur cet appareil). Voulez-vous vraiment vous déconnecter ?`
        : "Voulez-vous vraiment vous déconnecter ?",
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


  // Ferme le sidebar sur mobile après un clic (et la carte utilisateur si elle est ouverte)
  const closeSidebarOnMobile = () => {
    setUserCard(false);
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
    <div className="min-h-screen bg-base-100 text-base-content flex overflow-hidden">

      <aside className={`
          fixed lg:relative inset-y-0 left-0 z-50
          flex flex-col w-64 lg:w-15 lg:hover:w-64
          transition-all duration-300 ease-in-out
          bg-base-200 group
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
          onMouseOver={() => {setShowDetails(true)}}
          onMouseLeave={() => {setShowDetails(false)}}
      >

        {/* Bouton de fermeture du menu latéral */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className={`lg:hidden absolute top-7 btn btn-circle btn-ghost ${isSidebarOpen ? "translate-x-68" : "translate-x-20"} p-2 hover:text-primary transition-colors duration-150 cursor-pointer`}
        >
          <X size={24} />
        </button>

        {/* Logo et noms de la barre latérale */}
        <div className="group px-3 py-2 mb-3 flex items-center justify-center pointer">
          <Logo className={`w-10 ml-8 group-hover:scale-0 transition duration-150 ${isSidebarOpen ? "scale-0" : ""}`} />
          <div className={`invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 w-full h-10 bg-primary rounded-md flex items-center justify-center font-semibold text-primary-content shrink-0 -translate-x-10 ${isSidebarOpen ? "opacity-100 visible" : ""}`}>
            {Appname}
          </div>
        </div>

        {/* Zonne où je mappe tous mes liens  */}
        <nav className="flex-1 px-4 space-y-2 overflow-x-hidden overflow-y-auto pb-5">
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
        <div className="p-6 text-[11px] text-base-content/60 font-medium">
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
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main ref={mainRef} className="flex-1 h-screen overflow-y-auto relative custom-scrollbar">

        {/* le header */}
        <header className="sticky top-0 z-40 w-full px-4 h-13 flex items-center justify-between bg-base-200">
          <div className='flex items-center justify-between gap-3 w-full'>

            {/* cadre du bouton de menu et la barre de recherche  */}
            <div className='flex items-center w-full'>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 lg:hidden hover:bg-primary hover:text-primary-content transition-colors btn btn-ghost btn-circle"
              >
                <Menu size={20} />
              </button>

            </div>

            {/* Indicateurs hors ligne : connexion et enregistrements en attente */}
            {(offline || pending > 0) && (
              <div className="flex items-center gap-1.5 shrink-0">
                {offline && (
                  <span className="inline-flex items-center gap-1.5 rounded-sm bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning" title="Pas de connexion au serveur">
                    <WifiOff size={13} />
                    <span className="hidden sm:inline">Hors ligne</span>
                  </span>
                )}
                {pending > 0 && (
                  <button
                    onClick={() => sync()}
                    disabled={offline || syncing}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors duration-150 hover:bg-primary/15 disabled:cursor-not-allowed"
                    title={offline ? "Envoi automatique au retour du réseau" : "Synchroniser maintenant"}
                  >
                    <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
                    {pending} <span className="hidden sm:inline">en attente</span>
                  </button>
                )}
              </div>
            )}

            {/* 🟢 BLOC DES QUATRE ICÔNES DYNAMIQUES DEMANDÉES (S'affichent uniquement si la page active les définit) */}
            <div className="flex items-center gap-1.5 mr-2">
              {navbarActions.onSearch && (
                <button onClick={() => navbarActions.onSearch()} className="p-2 hover:bg-base-300 rounded-md text-base-content/70 hover:text-primary transition-colors cursor-pointer" title="Rechercher">
                  <Search size={17} />
                </button>
              )}
              {navbarActions.onDelete && (
                <button onClick={() => navbarActions.onDelete()} className="p-2 hover:bg-base-300 rounded-md text-base-content/70 hover:text-primary transition-colors cursor-pointer" title="Supprimer">
                  <Trash2 size={17} />
                </button>
              )}
              {navbarActions.onEdit && (
                <button onClick={() => navbarActions.onEdit()} className="p-2 hover:bg-base-300 rounded-md text-base-content/70 hover:text-primary transition-colors cursor-pointer" title="Modifier">
                  <Pencil size={17} />
                </button>
              )}
              {navbarActions.onAdd && (
                <button onClick={() => navbarActions.onAdd()} className="p-2 hover:bg-base-300 rounded-md text-base-content/70 hover:text-primary transition-colors cursor-pointer" title="Ajouter">
                  <Plus size={17} />
                </button>
              )}
              {navbarActions.onImport && (
                <button onClick={() => navbarActions.onImport()} className="p-2 hover:bg-base-300 rounded-md text-base-content/70 hover:text-primary transition-colors cursor-pointer" title="Importer depuis Excel">
                  <FileSpreadsheet size={17} />
                </button>
              )}
              {navbarActions.onFilter && (
                <button onClick={() => navbarActions.onFilter()} className="p-2 hover:bg-base-300 rounded-md text-base-content/70 hover:text-primary transition-colors cursor-pointer" title="Filtrer">
                  <Filter size={17} />
                </button>
              )}
              {navbarActions.onPrint && (
                <button onClick={() => navbarActions.onPrint()} className="p-2 hover:bg-base-300 rounded-md text-base-content/70 hover:text-primary transition-colors cursor-pointer" title="Imprimer">
                  <Printer size={17} />
                </button>
              )}
              {navbarActions.onBack && (
                <button onClick={() => navbarActions.onBack()} className="p-2 hover:bg-base-300 rounded-md text-base-content/70 hover:text-primary transition-colors cursor-pointer" title="Retour">
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
          {offline && (
            <div className="mb-4 flex items-start gap-3 rounded-md bg-warning/10 px-4 py-3 text-sm text-base-content/80">
              <WifiOff size={16} className="mt-0.5 shrink-0 text-warning" />
              <p>
                <strong className="font-medium text-base-content">Vous êtes hors ligne.</strong>{' '}
                Vous consultez les dernières données enregistrées sur cet appareil. Les notes saisies
                seront envoyées automatiquement au retour du réseau ; les autres modifications demandent une connexion.
              </p>
            </div>
          )}
          <Outlet context={{ setNavbarActions }} />
        </div>

      </main>


      {/* Le Bloc pour afficher le mini profil utilisateur */}
      <div
        className={`
          absolute right-0 top-14 z-50
          w-72
          rounded-md
          bg-base-200
          overflow-hidden
          transition-opacity duration-150
          ${
            userCard
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
      >
        {/* Avatar + Infos */}
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-base-300 flex items-center justify-center">
            <User2 size={28} className="text-primary" />
          </div>

          <h3 className="mt-3 font-semibold text-sm text-base-content">
            {userName}
          </h3>

          <p className="text-xs text-base-content/60 mt-1 truncate">
            {userEmail}
          </p>

          {/* Actions */}
          <div className="mt-5 space-y-2">
            <LinkGhost
              link="/profile"
              onAction={() => setUserCard(false)}
              color="
                flex items-center justify-center gap-2
                w-full py-2.5 rounded-md
                bg-primary/10 hover:bg-primary/15
                text-primary font-medium
                transition-colors text-xs
              "
            >
              <Pencil size={16} />
              Modifier le profil
            </LinkGhost>

            {installable && (
              <button
                type="button"
                onClick={() => { setUserCard(false); install(); }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-base-100 hover:bg-base-300 text-base-content font-medium transition-colors duration-150 text-xs"
              >
                <Download size={16} />
                Installer l'application
              </button>
            )}

            <LinkGhost
              onAction={handleLogOut}
              color="
                flex items-center justify-center gap-2
                w-full py-2.5 rounded-md
                bg-error/10 hover:bg-error/15
                text-error font-medium
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