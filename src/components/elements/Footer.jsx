import React from 'react';
import { Mail, ArrowUpRight, Server, ServerCog } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FaGithub, FaFacebook, FaYoutube, FaLinkedin } from 'react-icons/fa6'; 
import Logo from './Logo';
import { LinkGhost, LinksSimple } from '../LinksComponents';

const Footer = () => {
  const { t } = useTranslation('common');
  const socialLinks = [
    {
      icon: <FaYoutube className="w-6 h-6 hover:text-red-500 cursor-pointer transition-colors" />,
      url: 'https://www.youtube.com/@DiderohDurelAyile-b1z'
    },
    {
      icon: <FaGithub className="w-6 h-6 hover:text-primary cursor-pointer transition-colors" />,
      url: 'https://github.com/DIDEROH'
    },
    {
      icon: <FaLinkedin className="w-6 h-6 hover:text-blue-400 cursor-pointer transition-colors" />,
      url: 'https://www.linkedin.com/in/dideroh-durel-ayile-785594372/'
    },
    {
      icon: <FaFacebook className="w-6 h-6 hover:text-blue-600 cursor-pointer transition-colors" />,
      url: 'https://facebook.com/DURINFO'
    }
  ];
  const services = [
    {
      name: t('footer.services.saas'),
      url: '#'
    },
    {
      name: t('footer.services.apis'),
      url: '#'
    },
    {
      name: t('footer.services.dashboards'),
      url: '#'
    },
    {
      name: t('footer.services.seo'),
      url: '#'
    }
  ];
  const ecosystem = [
    {
      name: t('footer.ecosystem.portfolio'),
      url: '#'
    },
    {
      name: t('footer.ecosystem.lab'),
      url: '#'
    },
    {
      name: t('footer.ecosystem.academy'),
      url: '#'
    },
    {
      name: t('footer.ecosystem.contact'),
      url: '#'
    }
  ];

  return (
    <footer className="bg-slate-900 border-t border-base-content/10 pt-20 pb-10 text-sm text-slate-400">
      <div className="text-sm max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        
        {}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <Logo />
            </div>
            <span className="text-xl font-black text-primary-content tracking-tighter">DURINFO</span>
          </div>
          <p className="leading-relaxed max-w-xs">
            {t('footer.description')}
          </p>
          <div className="flex gap-4">
            {socialLinks.map((link, index) => (
              <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        {}
        <div className="text-xs">
          <h4 className="font-black mb-6 uppercase tracking-widest text-slate-200">{t('footer.servicesTitle')}</h4>
          <ul className="space-y-4">
            {services.map((service, index) => (
              <li key={index}>
                <LinkGhost text={service.name} link={service.url} hoverColor="primary" />
              </li>
            ))}
          </ul>
        </div>

        {}
        <div className="text-xs">
          <h4 className="font-black mb-6 uppercase tracking-widest text-slate-200">{t('footer.ecosystemTitle')}</h4>
          <ul className="space-y-4 ">
            {ecosystem.map((item, index) => (
              <li key={index}>
                <LinksSimple text={item.name} link={item.url} hoverColor="primary" />
              </li>
            ))}
          </ul>
        </div>

        {}
        <div className="space-y-6">
          <h4 className="font-black mb-6 uppercase tracking-widest text-slate-200 text-xs">{t('footer.availabilityTitle')}</h4>
          <p className="text-slate-400">{t('footer.availabilityText')}</p>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-emerald-400 font-bold text-xs uppercase tracking-tighter">
            <span className="relative flex h-4 w-4 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className='animate-pulse'>{t('footer.available')}</span>
          </div>
          <div className="pt-2">
            <a href="mailto:contact@durinfo.com" className="flex items-center gap-2 hover:text-slate-200 transition-colors">
              <Mail size={16} className="text-primary" />
              contact@durinfo.com
            </a>
          </div>
        </div>
      </div>

      {}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-[0.2em]">
        <p>{t('footer.copyright')}</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-slate-200 transition-colors">{t('footer.privacy')}</a>
          <a href="#" className="hover:text-slate-200 transition-colors">{t('footer.legal')}</a>
        </div>
        <p className="text-slate-400">
          {t('footer.by')} <span className="text-slate-200 font-bold">{t('footer.author')}</span>
        </p>
      </div>

    </footer>
  );
};

export default Footer;