import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, m } from 'motion/react';
import {
  ArrowLeft, ChevronRight, Download, FileSpreadsheet, Filter, LogOut, Menu, Pencil, Plus, Printer,
  RefreshCw, Search, Trash2, UserRound, WifiOff, X,
} from 'lucide-react';
import { Appname } from '../../constants/constants';
import { useNavigationPages } from '../../constants/pages';
import { useAuth } from '../../context/AuthContext';
import useShowConfirm from '../../hooks/UseShowConfirm';
import useOfflineStatus from '../../hooks/useOfflineStatus';
import useInstallPrompt from '../../hooks/useInstallPrompt';
import { startAutoSync } from '../../utils/offline/sync';
import { isOnline, isServerReachable } from '../../utils/offline/status';
import { toast } from 'sonner';
import Sidebar from '../layout/Sidebar';
import BottomDock from '../layout/BottomDock';
import CommandPalette from '../layout/CommandPalette';
import { activePage } from '../layout/navIcons';
import TopProgress from '../ui/TopProgress';
import { EASE_OUT, popIn } from '../motion/variants';

const COLLAPSED_KEY = 'edunote_sidebar_collapsed';

const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
};

// Initiales de l'avatar (« Ngono Marie » → « NM »)
const initialsOf = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'E';

/**
 * Cadre de l'application : photo de fond sous un voile bleu nuit, barre latérale
 * et barre du haut en verre, pages posées dessus. Les pages déclarent leurs
 * actions (ajouter, imprimer, actualiser…) via le contexte de l'Outlet.
 */
export default function Layout() {
  const location = useLocation();
  const pages = useNavigationPages();
  const active = activePage(pages, location.pathname);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  // Page défilée : la barre du haut devient opaque (un panneau blanc peut passer dessous)
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);

  // Actions de la barre du haut partagées avec la page affichée
  const [navbarActions, setNavbarActions] = useState({});
  // Bouton « Actualiser » : fonction de rechargement enregistrée par la page (hook useNavbarRefresh)
  const [navbarRefresh, setNavbarRefresh] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Contexte stable : les pages ne sont pas re-rendues à chaque rendu du Layout
  const outletContext = useMemo(() => ({ setNavbarActions, setNavbarRefresh }), []);

  const { offline, pending, syncing, sync } = useOfflineStatus();
  const { installable, install } = useInstallPrompt();
  const { logout, userName, userEmail, user } = useAuth();
  const showConfirm = useShowConfirm();

  useEffect(() => startAutoSync(), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Retour en haut de page à chaque changement de page
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  // Recherche rapide : Ctrl + K (ou ⌘ + K)
  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Menu utilisateur : fermé par un clic à l'extérieur ou Échap
  useEffect(() => {
    if (!userMenu) return undefined;
    const onDown = (event) => {
      if (!userMenuRef.current?.contains(event.target)) setUserMenu(false);
    };
    const onKey = (event) => event.key === 'Escape' && setUserMenu(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [userMenu]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((value) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, value ? '0' : '1');
      } catch {
        // Stockage indisponible : le choix vaut pour cette visite
      }
      return !value;
    });
  }, []);

  const handleRefresh = async () => {
    if (!navbarRefresh || refreshing) return;
    setRefreshing(true);
    try {
      // Durée minimale pour que l'animation reste perceptible quand la réponse est immédiate
      await Promise.all([navbarRefresh(), new Promise((resolve) => setTimeout(resolve, 500))]);
      if (!isOnline() || !isServerReachable()) {
        toast.info("Hors ligne : les données affichées sont les dernières enregistrées sur cet appareil.");
      }
    } catch (error) {
      toast.error(error?.message || "Impossible d'actualiser les données.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogOut = () => {
    setUserMenu(false);
    showConfirm({
      title: "Déconnexion",
      message: pending > 0
        ? `${pending} enregistrement(s) fait(s) hors ligne n'ont pas encore été envoyé(s) et seront retirés de la file d'attente (vos brouillons de notes restent sur cet appareil). Voulez-vous vraiment vous déconnecter ?`
        : "Voulez-vous vraiment vous déconnecter ?",
      onSuccess: () => { logout(); },
      onError: () => {},
    });
  };

  const actions = [
    ['onSearch', 'Rechercher', Search],
    ['onDelete', 'Supprimer', Trash2],
    ['onEdit', 'Modifier', Pencil],
    ['onAdd', 'Ajouter', Plus],
    ['onImport', 'Importer depuis Excel', FileSpreadsheet],
    ['onFilter', 'Filtrer', Filter],
  ];

  return (
    <div className="on-dark relative min-h-dvh" style={{ "--content-left": collapsed ? "6.5rem" : "17.5rem" }}>
      <div className="app-backdrop" aria-hidden="true" />
      <TopProgress />

      {/* Barre latérale (ordinateur) */}
      <aside
        className={`glass-panel fixed inset-y-3 left-3 z-40 hidden rounded-2xl transition-[width] duration-300 ease-[var(--ease-smooth)] lg:block ${collapsed ? 'w-20' : 'w-64'}`}
      >
        <Sidebar pages={pages} active={active} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
      </aside>

      {/* Tiroir du menu (téléphone, tablette) */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <m.div
              className="fixed inset-0 z-50 bg-night/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <m.aside
              className="glass-panel fixed inset-y-3 left-3 z-50 w-72 rounded-2xl bg-night/90 lg:hidden"
              initial={{ x: '-110%' }}
              animate={{ x: 0 }}
              exit={{ x: '-110%' }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              <button type="button" onClick={() => setDrawerOpen(false)} className="ui-icon-btn absolute top-4 right-3 text-white/70" aria-label="Fermer le menu">
                <X size={18} />
              </button>
              <Sidebar pages={pages} active={active} mobile onNavigate={() => setDrawerOpen(false)} />
            </m.aside>
          </>
        )}
      </AnimatePresence>

      <div className={`flex min-h-dvh flex-col transition-[padding] duration-300 ease-[var(--ease-smooth)] ${collapsed ? 'lg:pl-26' : 'lg:pl-70'}`}>
        {/* Barre du haut */}
        <header className="sticky top-0 z-30 px-3 pt-3 md:px-6 lg:pr-6 lg:pl-0">
          <div className={`glass-panel flex h-14 items-center gap-2 px-2.5 transition-[background-color,box-shadow] duration-300 sm:px-3 ${scrolled ? "bg-night/95 shadow-2xl shadow-black/50" : ""}`}>
            <button type="button" onClick={() => setDrawerOpen(true)} className="ui-icon-btn lg:hidden" aria-label="Ouvrir le menu">
              <Menu size={19} />
            </button>

            {/* Fil d'Ariane */}
            <nav className="hidden min-w-0 items-center gap-1.5 text-[13px] md:flex" aria-label="Fil d'Ariane">
              <Link to="/home" className="text-white/50 transition-colors hover:text-white">{Appname}</Link>
              {active && (
                <>
                  <ChevronRight size={14} className="text-white/30" />
                  <span className="truncate font-medium text-white">{active.name}</span>
                </>
              )}
            </nav>

            {/* Recherche rapide */}
            <button type="button" onClick={() => setPaletteOpen(true)}
              className="ml-1 hidden items-center gap-2 rounded-full bg-white/6 py-1.5 pr-1.5 pl-3 text-xs text-white/50 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white/80 sm:flex md:ml-4">
              <Search size={14} />
              <span>Rechercher une page</span>
              <kbd className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/60">Ctrl K</kbd>
            </button>

            <div className="ml-auto flex items-center gap-1">
              {/* Hors ligne et enregistrements en attente */}
              {offline && (
                <span className="ui-chip bg-warning/15 text-warning" title="Pas de connexion au serveur">
                  <WifiOff size={12} /> <span className="hidden sm:inline">Hors ligne</span>
                </span>
              )}
              {pending > 0 && (
                <button
                  type="button"
                  onClick={() => sync()}
                  disabled={offline || syncing}
                  className="ui-chip bg-primary/15 text-primary transition-colors hover:bg-primary/25 disabled:cursor-not-allowed"
                  title={offline ? "Envoi automatique au retour du réseau" : "Synchroniser maintenant"}
                >
                  <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
                  {pending} <span className="hidden sm:inline">en attente</span>
                </button>
              )}

              <button type="button" onClick={() => setPaletteOpen(true)} className="ui-icon-btn sm:hidden" aria-label="Rechercher une page">
                <Search size={17} />
              </button>

              {/* Actions de la page */}
              {actions.map(([key, title, Icon]) => navbarActions[key] && (
                <button key={key} type="button" onClick={() => navbarActions[key]()} className="ui-icon-btn" title={title}>
                  <Icon size={17} />
                </button>
              ))}
              {navbarRefresh && (
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="ui-icon-btn disabled:cursor-wait"
                  title={refreshing ? "Actualisation..." : "Actualiser les données"}
                  aria-label="Actualiser les données"
                >
                  <RefreshCw size={17} className={refreshing ? 'animate-spin text-glow-cyan' : ''} />
                </button>
              )}
              {navbarActions.onPrint && (
                <button type="button" onClick={() => navbarActions.onPrint()} className="ui-icon-btn" title="Imprimer">
                  <Printer size={17} />
                </button>
              )}
              {navbarActions.onBack && (
                <button type="button" onClick={() => navbarActions.onBack()} className="ui-icon-btn" title="Retour">
                  <ArrowLeft size={17} />
                </button>
              )}

              {/* Utilisateur */}
              <div ref={userMenuRef} className="relative ml-1">
                <button
                  type="button"
                  onClick={() => setUserMenu((open) => !open)}
                  className="grid size-9 place-items-center rounded-full bg-linear-to-br from-glow-indigo to-primary text-xs font-semibold text-white ring-2 ring-white/15 transition-transform hover:scale-105"
                  aria-label="Mon compte"
                  aria-expanded={userMenu}
                >
                  {initialsOf(userName)}
                </button>

                <AnimatePresence>
                  {userMenu && (
                    <m.div
                      variants={popIn}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="surface absolute right-0 mt-2 w-72 origin-top-right overflow-hidden"
                    >
                      <div className="flex items-center gap-3 border-b border-base-300 p-4">
                        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-linear-to-br from-glow-indigo to-primary text-sm font-semibold text-white">
                          {initialsOf(userName)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{userName}</p>
                          <p className="truncate text-xs text-base-content/55">{userEmail || user?.phone}</p>
                        </div>
                      </div>
                      <div className="space-y-0.5 p-2">
                        <Link to="/profile" onClick={() => setUserMenu(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-base-content/80 transition-colors hover:bg-base-100 hover:text-base-content">
                          <UserRound size={16} className="text-base-content/50" /> Mon profil
                        </Link>
                        {installable && (
                          <button type="button" onClick={() => { setUserMenu(false); install(); }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-base-content/80 transition-colors hover:bg-base-100 hover:text-base-content">
                            <Download size={16} className="text-base-content/50" /> Installer l'application
                          </button>
                        )}
                        <button type="button" onClick={handleLogOut}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-error transition-colors hover:bg-error/8">
                          <LogOut size={16} /> Déconnexion
                        </button>
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 px-3 pt-5 pb-28 md:px-6 lg:pr-6 lg:pb-10 lg:pl-0">
          {offline && (
            <div className="glass-panel mb-5 flex items-start gap-3 px-4 py-3 text-sm text-white/80">
              <WifiOff size={16} className="mt-0.5 shrink-0 text-warning" />
              <p>
                <strong className="font-medium text-white">Vous êtes hors ligne.</strong>{' '}
                Vous consultez les dernières données enregistrées sur cet appareil. Les notes saisies
                seront envoyées automatiquement au retour du réseau ; les autres modifications demandent une connexion.
              </p>
            </div>
          )}
          <m.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
          >
            <Outlet context={outletContext} />
          </m.div>
        </main>
      </div>

      <BottomDock pages={pages} active={active} onOpenMenu={() => setDrawerOpen(true)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} pages={pages} />
    </div>
  );
}
