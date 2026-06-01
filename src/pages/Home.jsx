import { useEffect, useRef, useState } from 'react';
// Icônes mises à jour pour correspondre au développement web
import { Phone, DollarSign, ChevronRight, Code2, Server, Layout, Database, Rocket, Globe, Smartphone, ArrowRight, CheckCircle2, Quote, Terminal } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAnimations } from '../utils/animations';
import Robot from '/robots/robot.webp'
import Community from '/welcome.webp'
import Coding from '/robots/coding.webp'
import Logo from '/logo.webp'
import Durinfo from '/durinfo2.webp'
import socialProofData from '../json/langages.json';
import PageHelmet from '../components/PageHelmet';
import { useTranslation } from 'react-i18next';
import { api } from '../utils/AxiosClient';
import { Card1, Card2, Card3 } from '../components/CardsComponents';
import { Title1, TitleGradient, TitleUnderline, TitleTrack } from '../components/TitleComponents';
import { ListChecked } from '../components/ListsComponents';
import { Code1 } from '../components/CodesComponents';
import { CtaNeon, CtaDark, CtaPrimary, CtaBorder } from '../components/ButtonsComponents';
import { LinkArrowRight, LinkBtn } from '../components/LinksComponents';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ==========================================
// DONNÉES JSON (Mock Database) - Orienté WEB
// ==========================================

export default function Home() {
  const container = useRef(null);
  const { t } = useTranslation('home');
  const [achievements, setAchievements] = useState([]);


  const loadAchievements = async () => {
    try {
      const { data } = await api.get('/achievements/latest');
      setAchievements(data);
    } catch (error) {
      console.error('Unable to load achievements:', error);
    }
  };

  const pillarsData = [
    {
      id: "frontend",
      title: t('hero.cards.web.title'),
      description: t('hero.cards.web.subtitle'),
      icon: Layout,
      linkText: t('hero.cards.web.linkText'),
      color: "from-violet-500 to-blue-500"
    },
    {
      id: "backend",
      title: t('hero.cards.backend.title'),
      description: t('hero.cards.backend.subtitle'),
      icon: Database,
      linkText: t('hero.cards.backend.linkText'),
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "solutions",
      title: t('hero.cards.solutions.title'),
      description: t('hero.cards.solutions.subtitle'),
      icon: Rocket,
      linkText: t('hero.cards.solutions.linkText'),
      color: "from-pink-500 to-rose-500"
    }
  ];


  const technicalList = [
    t('technical.list.scalable'),
    t('technical.list.security'),
    t('technical.list.seo'),
    t('technical.list.cleanCode')
  ];

  const dataDevs = [
    {
      title: "Débutants",
      desc: "Découvre le développement étape par étape dans une ambiance motivante.",
      glow: "cyan",
    },
    {
      title: "Passionnés",
      desc: "Travaille sur des projets modernes et améliore rapidement tes compétences.",
      glow: "violet",
    },
    {
      title: "Experts",
      desc: "Partage ton expérience et aide la nouvelle génération de développeurs.",
      glow: "pink",
    },
  ]

  useEffect(() => {
    loadAchievements()
  }, [])

  // Utilisation du système d'animations unifié
  useAnimations(container);

  return (
    <div ref={container} className="w-full overflow-x-hidden">
      <PageHelmet
        title={t('meta.title')}
        description={t('meta.description')}
        keywords={t('meta.keywords')}
        ogTitle={t('meta.ogTitle')}
        ogDescription={t('meta.ogDescription')}
        ogImage="/logo.webp"
      />

      {/* Hero Section */}
      <header
        className="relative overflow-hidden bg-base-100"
        style={{
          backgroundImage: "url('/bg_primary.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-base-100/95 via-base-100/60 to-base-100/95" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="animate-plasma-orb absolute left-1/4 top-16 w-52 h-52 rounded-full bg-primary/50 blur-3xl"></div>
          <div className="animate-plasma-orb absolute right-10 top-24 w-44 h-44 rounded-full bg-accent/40 blur-3xl"></div>
          <div className="animate-plasma-orb absolute bottom-16 left-10 w-72 h-72 rounded-full bg-secondary/40 blur-3xl"></div>
        </div>

        <div className="mx-auto max-w-7xl animate-reveal relative z-10 px-6 py-20 md:py-24 lg:px-12 grid gap-12 xl:grid-cols-[minmax(420px,1fr)_420px] items-center">

          <div className="space-y-8 text-base-content z-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-primary">
              {t('hero.badge')}
            </span>

            <div className="space-y-6">

              <h4 className="animate-text-split text-xl font-black tracking-tight text-base-content ">
                {t('hero.subtitlePrefix')} <span className="text-primary ">{t('hero.subtitleHighlight')}</span>
              </h4>

              <h1 className="text-7xl md:text-9xl font-black my-8 tracking-tighter leading-none text-center flex">
                {/* texte a mettre pour l'aficher sans neon */}
                <span className=" text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] filter drop-shadow-[0_0_20px_oklch(var(--p)/0.4)] animate-text-infinite">DURINFO</span>
              </h1>
             
              <p className="max-w-2xl text-lg text-base-content/85 leading-relaxed">
                {t('hero.text')}
              </p>

            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <CtaPrimary text={t('hero.ctaProject')} icon={ChevronRight} />
              <CtaDark text={t('hero.ctaPortfolio')} icon={Code2} />
            </div>

          </div>

          {}
          <div className="hidden xl:grid relative rounded p-6 shadow-2xl shadow-base-300/40 backdrop-blur-xl gap-3 sm:grid-cols-2 xl:grid-cols-1">           
            <img src={Coding} alt="DURINFO hero robots" className="rounded" />
          </div>

        </div>

      </header>
      
      {/* Services en premiers */}
      <section className="mx-auto max-w-7xl md:px-4 md:py-20 lg:px-12">
        
        <div className='animate-bento-card grid justify-items-center md:grid-cols-2 mb-5 bg-gradient-to-b md:bg-gradient-to-r from-black from-53% to-blue-400 md:rounded-xl p-8 md:p-12 gap-8'>
          <div className="relative mb-16 text-amber-50">
            <TitleUnderline text={t('expertise.heading')} tcolor={t('expertise.highlight')} color={'amber-50'} />
            <p className="text-md text-justify">
              {t('expertise.text')}
            </p>
            <div className="relative flex overflow-hidden py-10">
              <div className="flex flex-wrap justify-center whitespace-nowrap gap-16 transition-all">
                {socialProofData.map((tech, index) => (
                  <div key={index} className='flex flex-col min-w-15 items-center justify-center'>
                    <img src={tech.logo || Logo} className="w-12 h-12" alt={tech.langage} />
                    <span className="text-xl font-bold text-cyan-400/70 font-mono">
                      {tech.langage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          <img src={Robot} alt={t('expertise.imageAlt')} className="animate-slide-right max-h-100 animate-bento-card" />
        </div>

        <div className="grid gap-8 md:grid-cols-3 p-6 lg:p-12">
          {pillarsData.map((pillar) => (
            <Card1 key={pillar.id} data={pillar} btn={<LinkArrowRight text={"En savoir plus"} abs />} />
          ))}
        </div>
      </section>

      {/* Au coeur du Code */}
      <section className="py-24 md:pt-0">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 grid gap-16 lg:grid-cols-2 items-center">
          <div className="animate-reveal space-y-8 text-sm">
            <TitleTrack text={t('technical.heading')} />
            <TitleUnderline text={t('technical.titlePrefix')} tcolor={t('technical.titleHighlight')} />
            <p className="text-base-content/70 leading-relaxed">
              {t('technical.text')}
            </p>
            <ul className="space-y-4">
              {technicalList.map((item, i) => (
                <ListChecked key={i} text={item} />
              ))}
            </ul>
          </div>

          {/* Faux éditeur de code / Mockup Web */}
          <Code1 animation="animate-slide-right" />
          
        </div>
      </section>

      {/* Appel a l'action de commande de site web */}
      <section className="relative overflow-hidden py-32 bg-base-950/50"> 
        
        {/* Fondu de transition - Haut */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-base-950 to-transparent z-10 pointer-events-none"></div>

        {/* Effets Néon Flous (Glow) */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-fuchsia-500 rounded-full blur-[150px] opacity-55 pointer-events-none"></div>

        {/* Vos calques d'origine */}
        <div className="absolute inset-0 bg-primary/10"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 mix-blend-overlay"></div>
        
        <div className="mx-auto max-w-4xl px-6 lg:px-12 relative z-20 text-center animate-reveal"> {/* z-10 passé en z-20 */}
          <TitleGradient text={t('contact.headline')} />
          <p className="text-xl text-base-content/90 mb-10 max-w-2xl mx-auto">
            {t('contact.text')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CtaNeon text={t('contact.ctaContact')} icon={Phone} />
            <CtaBorder text={t('contact.ctaPrices')} icon={DollarSign} />
          </div>
        </div>

        {/* Fondu de transition - Bas */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-base-950 to-transparent z-10 pointer-events-none"></div>
      </section>

      {/* Rejoindre la communauté */}
      <section className="relative overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute inset-0  overflow-hidden">
          
          {/* Glow */}
          <div className="absolute top-[-120px] left-[10%] h-[260px] w-[260px] rounded-full bg-cyan-500/20 blur-[120px]" />
          
          <div className="absolute bottom-[-120px] right-[10%] h-[260px] w-[260px] rounded-full bg-violet-500/20 blur-[120px]" />

          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.04]">
            <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:45px_45px]" />
          </div>
        </div>

        <div className="relative z-10 mx-auto bg-[#050816]">
          
          {/* Main Container */}
          <div className="relative overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-2xl">
            
            {/* Inner Glow */}
            <div className="absolute inset-0">
              <div className="absolute left-0 top-0 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-14 px-6 py-16 text-center md:px-14 md:py-24">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 backdrop-blur-xl">
                
                <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
                <TitleTrack text={'Communauté ouverte à tous'} color={'cyan-300'} />
              </div>

              {/* Main Title */}
              <div className="max-w-5xl">

                <TitleGradient text={"Rejoins la communauté des développeurs "} />

                <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-white/65 md:text-xl">
                  Que tu sois débutant, passionné ou développeur expérimenté,
                  tu as ta place chez nous. Apprends, partage, collabore
                  et évolue avec une communauté moderne, ambitieuse
                  et accueillante.
                </p>
              </div>

              {/* Community Cards */}
              <div className="grid w-full gap-5 md:grid-cols-3">
                
                {dataDevs.map((item, index) => (
                  <Card2 key={index} title={item.title} desc={item.desc} glow="cyan" />
                ))}
              </div>

              {/* CTA Buttons */}
              <div className=" flex flex-col gap-5 sm:flex-row ">
                <CtaNeon text="Rejoindre maintenant" />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Mon dicton - Ultra Modern Neon UI */}
      <section className="relative overflow-hidden py-20 md:py-28">

        
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          
          {/* Neon Glow */}
          <div className="absolute top-[-120px] left-[-80px] h-[250px] w-[250px] rounded-full bg-cyan-500/20 blur-[120px]" />
          
          <div className="absolute bottom-[-120px] right-[-80px] h-[250px] w-[250px] rounded-full bg-violet-500/20 blur-[120px]" />

          {/* Grid Effect */}
          <div className="absolute inset-0 opacity-[0.04]">
            <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:45px_45px]" />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-6 lg:px-10">
          
          {/* Main Card */}
          <div className="
            group
            relative
            overflow-hidden
            rounded-[2rem]
            border
            border-white/10
            bg-[#050816]
            p-6
            backdrop-blur-2xl
            transition-all
            duration-500
            hover:border-cyan-400/30
            hover:bg-[#050816]/90
            md:p-12
          ">
            
            {/* Animated Glow */}
            <div className="
              absolute
              inset-0
              opacity-0
              transition-opacity
              duration-500
              group-hover:opacity-100
            ">
              <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl " />
            </div>

            {/* Mobile First Layout */}
            <div className="relative z-10 flex flex-col items-center text-center">
              
              {/* Avatar */}
              <div className="relative mb-8">
                
                {/* Neon Rings */}
                <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-500/20 blur-2xl" />

                <div className="
                  absolute
                  -inset-2
                  rounded-full
                  border
                  border-cyan-400/30
                " />

                <div className="
                  absolute
                  -inset-5
                  rounded-full
                  border
                  border-violet-500/20
                " />

                {/* Image */}
                <div className="
                  relative
                  flex
                  h-36
                  w-36
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border
                  border-white/10
                  bg-[#0B1120]
                  shadow-[0_0_40px_rgba(34,211,238,0.25)]
                  md:h-44
                  md:w-44
                  p-3
                ">
                  <img
                    src={Durinfo}
                    alt={t('quote.imageAlt')}
                    className="
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-500
                      group-hover:scale-110
                    "
                  />
                </div>
              </div>

              {/* Quote Icon */}
              <div className="
                mb-6
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                border
                border-cyan-400/20
                bg-cyan-400/10
                shadow-[0_0_30px_rgba(34,211,238,0.18)]
              ">
                <Quote
                  size={28}
                  className="text-cyan-300"
                />
              </div>

              {/* Quote Text */}
              <h3 className="
                max-w-4xl
                text-xl
                font-bold
                leading-[1.4]
                tracking-tight
                text-white
                sm:text-2xl
              ">
                <span className="
                  bg-gradient-to-r
                  from-cyan-300
                  via-white
                  to-violet-300
                  bg-clip-text
                  text-transparent
                ">
                  &quot;{t('quote.text')}&quot;
                </span>
              </h3>

              {/* Divider */}
              <div className="
                my-8
                h-[1px]
                w-32
                bg-gradient-to-r
                from-transparent
                via-cyan-400/60
                to-transparent
              " />

              {/* Author */}
              <div className="space-y-2">
                
                <p className="
                  text-sm
                  font-black
                  uppercase
                  tracking-[0.35em]
                  text-cyan-300
                ">
                  {t('quote.author')}
                </p>

                <p className="
                  text-sm
                  font-medium
                  text-white/60
                  md:text-base
                ">
                  {t('quote.role')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio des realisations  */}
      <section className="mx-auto max-w-7xl px-6 py-18 lg:px-12">
        <div className="animate-reveal flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <Title1 text={t('portfolio.heading')} />
            <p className="text-base-content/70 text-lg max-w-2xl">{t('portfolio.subheading')}</p>
          </div>
          <LinkArrowRight text={t('portfolio.cta')} color="primary" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {achievements?.map((project) => (
            <Card3
            key={project.id}
            title={project.translation.title}
            description={project.translation.description}
            image={project.image}
            language={project.langage}
            btn={<LinkBtn link={`/lab/${project.id}`} text={"Voir le projet"} />}
            />
          ))}
        </div>
      </section>
      
    </div>
  );
}