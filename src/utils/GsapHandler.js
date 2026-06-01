import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';

/**
 * Composant GsapHandler
 * Utilise la bibliothèque GSAP installée pour animer les éléments du DOM.
 * Cible tout élément possédant la classe 'animation-duro'.
 */
export default function GsapHandler() {
  const location = useLocation();

  useEffect(() => {
    // Sélection de tous les éléments avec la classe spécifique
    const elements = document.querySelectorAll('.animation-duro');

    if (elements.length > 0) {
      // Nettoyage/Initialisation immédiate pour éviter les flashs visuels
      gsap.set(elements, { 
        y: 30, 
        opacity: 0 
      });

      // Exécution de l'animation Fade-In-Up
      gsap.to(elements, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1, // Animation en cascade si plusieurs éléments sont présents
        delay: 0.1,   // Léger délai pour assurer le rendu du DOM par React
        clearProps: "all" // Nettoie les styles inline après l'animation pour éviter les conflits CSS
      });
    }
  }, [location]); // Se déclenche à chaque changement de route via l'Outlet

  return null;
}