import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect } from 'react';
import Splitting from 'splitting';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Animation des orbes plasma - mouvement aléatoire continu
 * Classe: animate-plasma-orb
 */
export const animatePlasmaOrbs = (selector = '.animate-plasma-orb') => {
  gsap.to(selector, {
    x: "random(-100, 100)",
    y: "random(-80, 80)",
    scale: "random(1.1, 1.3)",
    duration: "random(4, 8)",
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    stagger: { each: 0.5, from: "random" }
  });
};

/**
 * Animation du gradient de texte - défilement infini
 * Classe: animate-hero-gradient
 */
export const animateHeroGradient = (selector = '.animate-hero-gradient') => {
  gsap.to(selector, {
    backgroundPosition: "200% center",
    duration: 5,
    repeat: -1,
    ease: "none"
  });
};

/**
 * Animation de parallaxe au scroll
 * Classe: animate-parallax
 * Data attribute: data-parallax-speed (optionnel, défaut: 200)
 */
export const animateParallax = (selector = '.animate-parallax', scroller = 'main') => {
  const elements = gsap.utils.toArray(selector);

  elements.forEach((element) => {
    const speed = parseFloat(element.dataset.parallaxSpeed) || 200;

    gsap.to(element, {
      scrollTrigger: {
        trigger: element.closest('section') || element,
        scroller: element.closest(scroller) || scroller,
        start: "top top",
        end: "bottom top",
        scrub: true
      },
      y: speed,
      opacity: 0.2,
      scale: 0.9
    });
  });
};

/**
 * Animation de révélation - éléments qui apparaissent avec blur
 * Classe: animate-reveal
 * Data attribute: data-reveal-delay (optionnel)
 */
export const animateReveal = (selector = '.animate-reveal') => {
  const elements = gsap.utils.toArray(selector);

  gsap.set(elements, { y: 60, opacity: 0, filter: "blur(15px)" });

  gsap.to(elements, {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    duration: 1.2,
    stagger: 0.15,
    ease: "power4.out",
    delay: (index, element) => parseFloat(element.dataset.revealDelay) || 0.2
  });
};

/**
 * Animation des cartes bento au scroll
 * Classe: animate-bento-card
 */
export const animateBentoCards = (selector = '.animate-bento-card', scroller = 'main') => {
  const cards = gsap.utils.toArray(selector);

  cards.forEach((card) => {
    gsap.fromTo(card,
      { y: 80, opacity: 0, filter: "blur(10px)" },
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        scrollTrigger: {
          trigger: card,
          scroller: card.closest(scroller) || scroller,
          start: "top bottom-=15%",
          toggleActions: "play none none reverse",
          markers: false
        }
      }
    );
  });
};

/**
 * Animation slide-in/out depuis la droite
 * Classe: animate-slide-right
 */
export const animateSlideRight = (selector = '.animate-slide-right', scroller = 'main') => {
  const elements = gsap.utils.toArray(selector);

  elements.forEach((element) => {
    gsap.set(element, { x: 120, opacity: 0 });

    ScrollTrigger.create({
      trigger: element,
      scroller: element.closest(scroller) || scroller,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => gsap.to(element, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }),
      onLeave: () => gsap.to(element, { x: 120, opacity: 0, duration: 0.5, ease: 'power3.in' }),
      onEnterBack: () => gsap.to(element, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }),
      onLeaveBack: () => gsap.to(element, { x: 120, opacity: 0, duration: 0.5, ease: 'power3.in' })
    });
  });
};

/**
 * Animation slide-in/out depuis la droite
 * Classe: animate-slide-left
 */
export const animateSlideLeft = (selector = '.animate-slide-left', scroller = 'main') => {
  const elements = gsap.utils.toArray(selector);

  elements.forEach((element) => {
    gsap.set(element, { x: -120, opacity: 0 });

    ScrollTrigger.create({
      trigger: element,
      scroller: element.closest(scroller) || scroller,
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => gsap.to(element, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }),
      onLeave: () => gsap.to(element, { x: -120, opacity: 0, duration: 0.5, ease: 'power3.in' }),
      onEnterBack: () => gsap.to(element, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }),
      onLeaveBack: () => gsap.to(element, { x: -120, opacity: 0, duration: 0.5, ease: 'power3.in' })
    });
  });
};

/**
 * Animation de hover avec scale et glow
 * Classe: animate-hover-scale
 */
export const animateHoverScale = (selector = '.animate-hover-scale') => {
  const elements = gsap.utils.toArray(selector);

  elements.forEach((element) => {
    element.addEventListener('mouseenter', () => {
      gsap.to(element, {
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out"
      });
    });

    element.addEventListener('mouseleave', () => {
      gsap.to(element, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    });
  });
};

/**
 * Animation de pulse continue
 * Classe: animate-pulse-glow
 */
export const animatePulseGlow = (selector = '.animate-pulse-glow') => {
  gsap.to(selector, {
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
};

/**
 * Animation de texte infinie - ne s'arrête jamais
 * Classe: animate-text-infinite
 * Combine Splitting.js et GSAP pour des effets continus et lisibles
 */
export const animateTextInfinite = (selector = '.animate-text-infinite') => {
  const elements = gsap.utils.toArray(selector);

  elements.forEach((el) => {
    const chars = Splitting({ target: el, by: 'chars' })[0]?.chars;
    if (!chars) return;

    // 1. Animation de base : Une onde fluide et infinie
    const loop = gsap.to(chars, {
      y: -8,
      scale: 1.1,
      color: "#06b6d4", // Optionnel : change la couleur au sommet de l'onde
      duration: 1,
      stagger: {
        each: 0.1,
        repeat: -1,
        yoyo: true
      },
      ease: "sine.inOut"
    });

    // 2. Interaction Hover : On accélère et on amplifie
    el.addEventListener('mouseenter', () => {
      gsap.to(loop, { timeScale: 3, duration: 0.5 }); // Accélère l'onde
      gsap.to(chars, { textShadow: "0 0 15px rgba(6, 182, 212, 0.8)", duration: 0.3 });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(loop, { timeScale: 1, duration: 0.5 }); // Retour au calme
      gsap.to(chars, { textShadow: "none", duration: 0.3 });
    });

    // 3. Interaction Clic : Un "Pop" rapide de tout le mot
    el.addEventListener('mousedown', () => {
      gsap.fromTo(chars, 
        { scale: 0.8 }, 
        { scale: 1.3, duration: 0.2, stagger: 0.03, ease: "back.out(3)" }
      );
    });
  });
};


/**
 * Fonction d'initialisation des animations
 */
export const initAnimations = (container) => {
  // Plasma orbs
  if (container.querySelector('.animate-plasma-orb')) {
    animatePlasmaOrbs('.animate-plasma-orb');
  }

  // Hero gradient
  if (container.querySelector('.animate-hero-gradient')) {
    animateHeroGradient('.animate-hero-gradient');
  }

  // Parallax
  if (container.querySelector('.animate-parallax')) {
    animateParallax('.animate-parallax');
  }

  // Reveal animations
  if (container.querySelector('.animate-reveal')) {
    animateReveal('.animate-reveal');
  }

  // Bento cards
  if (container.querySelector('.animate-bento-card')) {
    animateBentoCards('.animate-bento-card');
  }

  // Slide depuis la droite
  if (container.querySelector('.animate-slide-right')) {
    animateSlideRight('.animate-slide-right');
  }

  // Slide depuis la gauche
  if (container.querySelector('.animate-slide-left')) {
    animateSlideLeft('.animate-slide-left');
  }

  // Hover scale
  if (container.querySelector('.animate-hover-scale')) {
    animateHoverScale('.animate-hover-scale');
  }

  // Pulse glow
  if (container.querySelector('.animate-pulse-glow')) {
    animatePulseGlow('.animate-pulse-glow');
  }

  // Text infinite animation
  if (container.querySelector('.animate-text-infinite')) {
    animateTextInfinite('.animate-text-infinite');
  }

  // Refresh ScrollTrigger après l'initialisation
  ScrollTrigger.refresh();
};

/**
 * Hook React pour utiliser les animations dans les composants
 */
export const useAnimations = (containerRef) => {
  useEffect(() => {
    if (containerRef.current) {
      initAnimations(containerRef.current);
    }

    return () => {
      // Cleanup ScrollTrigger instances
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [containerRef]);
};

export default {
  animatePlasmaOrbs,
  animateHeroGradient,
  animateParallax,
  animateReveal,
  animateBentoCards,
  animateHoverScale,
  animatePulseGlow,
  animateTextInfinite,
  animateSlideRight,
  animateSlideLeft,
  initAnimations,
  useAnimations
};