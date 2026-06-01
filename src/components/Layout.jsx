import React, { useRef, useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon, Menu, Settings, X, Briefcase, FlaskConical, BookOpen, Award, User, Phone, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from './elements/Logo';
import { SIZE_ICON_LG } from '../utils/constants';
import SidebarItem from './SidebarItem';
import Footer from './elements/Footer';


export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const mainRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const token = localStorage.getItem('user_token_durinfo');

  // Scroll to top on route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const languages = [
    { code: 'fr', label: t('languages.fr'), flag: '🇫🇷' },
    { code: 'en', label: t('languages.en'), flag: '🇬🇧' },
  ];

  const changeLanguage = async (code) => {
    await i18n.changeLanguage(code);
    setIsLangModalOpen(false);
    window.location.reload(); // Recharge la page pour appliquer les changements de langue partout  
  };

  // Ferme le sidebar sur mobile après un clic
  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  // Les icones pour tous les liens 
  const iconMap = {
    HomeIcon: <HomeIcon size={22} />,
    Services: <Briefcase size={22} />,
    Lab: <FlaskConical size={22} />,
    Formations: <BookOpen size={22} />,
    Realisations: <Award size={22} />,
    APropos: <User size={22} />,
    Contact: <Phone size={22} />,
    Settings: <Settings size={22} />,
  };

  // Le tableua qui regroupe les noms des pages et les liens qui y mènent
  const pages = [
    { name: t('navigation.home'), to: "/", icon: "HomeIcon" },
    { name: t('navigation.services'), to: "/services", icon: "Services" },
    { name: t('navigation.lab'), to: "/lab", icon: "Lab" },
    { name: t('navigation.formations'), to: "/formations", icon: "Formations" },
    { name: t('navigation.realisations'), to: "/realisations", icon: "Realisations" },
    { name: t('navigation.apropos'), to: "/apropos", icon: "APropos" },
    { name: t('navigation.contact'), to: "/contact", icon: "Contact" },
  ];

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
        <div className="group p-6 mb-6 flex items-center justify-center">
          <Logo className={`w-12 group-hover:scale-0 transition duration-300 ${isSidebarOpen ? "scale-0" : ""}`} />
          <div className={`invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-500 w-full h-10 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center font-bold text-secondary-content shrink-0 shadow-lg -translate-x-10 ${isSidebarOpen ? "opacity-100 visible" : ""}`}>
            DURINFO
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

        {/* La zone de paramètres  */}
        <div className="p-6 border-t border-base-content/5">
          <SidebarItem 
            icon={iconMap.Settings} 
            label={t('navigation.settings')} 
            to="/settings" 
            active={location.pathname === '/settings'} 
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
          
          {/* Section du thème et du login */}
          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="btn btn-ghost btn-sm rounded-full p-2 hover:bg-base-300/50 transition-colors"
              title="Changer de thème"
            >
              <Palette size={20} />
            </button>

            <button
              type="button"
              onClick={() => setIsLangModalOpen(true)}
              className="btn btn-ghost btn-sm uppercase tracking-widest text-xs"
            >
              {languages.find((lang) => lang.code === i18n.language)?.flag || '🌐'}
            </button>

            {/* Faire disparaitre le bouton login si utilisateur connecte et afficher son nom */}
            {token ? (
              <div className="dropdown dropdown-end">
                {/* A Afficher si connecté */}
              </div>
            ) : (
              <button className="btn btn-ghost btn-sm uppercase tracking-widest text-xs" onClick={() => navigate('/login')}>{t('buttons.login')}</button>
            )}

          </div>

        </header>

        {/* Zonne d'aafichage de mes pages */}
        <Outlet />


              
        {/* Footer Institutionnel Rapide (à extraire dans un composant séparé plus tard) */}
        <Footer /> 
        
      </main>

      {isLangModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-base-content/10 bg-base-100 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-base-content/60">{t('layout.languageModalTitle')}</p>
                <h2 className="text-2xl font-bold">{t('layout.languageModalSubtitle')}</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsLangModalOpen(false)}
                className="btn btn-ghost btn-circle"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => changeLanguage(lang.code)}
                  className={`btn w-full justify-start gap-3 ${i18n.language === lang.code ? 'btn-primary text-primary-content' : 'btn-ghost'}`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <span className="block font-semibold">{lang.label}</span>
                    <span className="text-xs text-base-content/60 uppercase">{lang.code}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}