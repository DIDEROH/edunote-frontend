import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import confetti from "canvas-confetti";
import logo from "/logo.webp";
import "../context/SiteLoader.css"; // On utilisera un fichier CSS séparé

export default function SiteLoader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const flashRef = useRef(null);
  const dotsRef = useRef(null);

  // Simulation progression
  useEffect(() => {
    let interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 2));
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // Confettis
  const fireConfettis = () => {
    const duration = 1500;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 8,
        spread: 65,
        startVelocity: 30,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  // Animation finale
  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => {
        // Fade-out points
        if (dotsRef.current) {
          dotsRef.current.style.animationPlayState = "paused";
          gsap.to(dotsRef.current.children, {
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
          });
        }

        // Explosion logo
        gsap.to(logoRef.current, {
          scale: 2,
          opacity: 0,
          duration: 0.6,
          ease: "power4.out",
        });

        // Flash lumineux
        gsap.fromTo(
          flashRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.15,
            onComplete: () =>
              gsap.to(flashRef.current, {
                opacity: 0,
                duration: 0.3,
              }),
          }
        );

        // Confettis
        fireConfettis();

        // Fade-out du loader
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.5,
          delay: 0.5,
          onComplete: () => setVisible(false),
        });
      }, 300);
    }
  }, [progress]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-[url(/gestion.webp)] bg-cover bg-center flex flex-col items-center justify-center z-[99999]"
    >
      {/* Flash lumineux */}
      <div
        ref={flashRef}
        className="absolute inset-0 bg-white"
        style={{ opacity: 0 }}
      ></div>

      <img
        ref={logoRef}
        src={logo}
        alt="Logo"
        className="w-50"
      />

      {/* Loader points style Facebook */}
      <div className="loader-dots flex space-x-2 mt-4 mb-4 h-4" ref={dotsRef}>
        <div className="dot bg-amber-600"></div>
        <div className="dot bg-amber-600"></div>
        <div className="dot bg-amber-600"></div>
      </div>
    </div>
  );
}
