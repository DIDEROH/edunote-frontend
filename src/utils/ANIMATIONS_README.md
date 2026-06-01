# Système d'Animations GSAP

Ce fichier contient toutes les animations GSAP utilisées dans l'application. Le système permet d'appliquer des animations simplement en ajoutant des classes CSS aux éléments.

## Utilisation

### Import dans un composant React

```javascript
import { useAnimations } from '../utils/animations';

// Dans votre composant
const containerRef = useRef(null);
useAnimations(containerRef);
```

### Classes d'animation disponibles

#### 1. `animate-plasma-orb`
Animation de mouvement aléatoire continu pour les éléments décoratifs (orbes).
```html
<div className="animate-plasma-orb absolute left-1/4 top-16 w-52 h-52 rounded-full bg-cyan-500/15 blur-3xl"></div>
```

#### 2. `animate-hero-gradient`
Animation de défilement infini pour les gradients de texte.
```html
<span className="animate-hero-gradient text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
  TEXTE
</span>
```

#### 3. `animate-parallax`
Animation de parallaxe au scroll. Utilise `data-parallax-speed` pour personnaliser la vitesse (défaut: 200).
```html
<div className="animate-parallax" data-parallax-speed="150">
  Contenu avec parallaxe
</div>
```

#### 4. `animate-reveal`
Animation de révélation avec blur et translation. Utilise `data-reveal-delay` pour retarder l'animation.
```html
<div className="animate-reveal" data-reveal-delay="0.5">
  Élément qui apparaît
</div>
```

#### 5. `animate-bento-card`
Animation d'entrée au scroll pour les cartes (bento grid).
```html
<div className="animate-bento-card">
  Carte animée
</div>
```

#### 6. `animate-hover-scale`
Animation de scale au hover.
```html
<div className="animate-hover-scale">
  Élément qui scale au hover
</div>
```

#### 7. `animate-pulse-glow`
Animation de pulse avec glow continu.
```html
<div className="animate-pulse-glow">
  Élément avec pulse lumineux
</div>
```

#### 8. `animate-text-split`
Animation de texte splitté caractère par caractère.
Chaque caractère apparaît individuellement avec une rotation 3D et réagit au hover.
```html
<h1 className="animate-text-split">TEXTE ANIMÉ</h1>
```

## Fonctions d'animation individuelles

Vous pouvez aussi utiliser les fonctions directement pour plus de contrôle :

```javascript
import {
  animatePlasmaOrbs,
  animateHeroGradient,
  animateParallax,
  animateReveal,
  animateBentoCards,
  animateTextSplit
} from '../utils/animations';

// Dans useEffect ou ailleurs
useEffect(() => {
  animatePlasmaOrbs('.my-plasma-orb');
  animateTextSplit('.my-text-split');
}, []);
```

## Initialisation automatique

La fonction `initAnimations()` scan automatiquement le DOM pour appliquer les animations aux classes correspondantes :

```javascript
import { initAnimations } from '../utils/animations';

// Applique toutes les animations trouvées dans le container
initAnimations(document.querySelector('#my-section'));
```

## Hook React

Le hook `useAnimations` facilite l'utilisation dans les composants React :

```javascript
import { useAnimations } from '../utils/animations';

function MyComponent() {
  const containerRef = useRef(null);
  useAnimations(containerRef);

  return (
    <div ref={containerRef}>
      <div className="animate-reveal">Contenu animé</div>
    </div>
  );
}
```

## Personnalisation

Chaque fonction accepte un sélecteur personnalisé pour cibler des éléments spécifiques :

```javascript
animateReveal('.custom-reveal-class');
animateParallax('.custom-parallax', '#custom-scroller');
```

Les animations utilisent ScrollTrigger pour les effets de scroll, assurez-vous que GSAP est bien configuré avec le plugin ScrollTrigger.