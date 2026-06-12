import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { setAxiosLoading } from "../utils/AxiosClient";

export default function GlobalLoader() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const modalRef = useRef(null);
  const circleRef = useRef(null);
  const haloRef = useRef(null);

  // Connecter Axios
  useEffect(() => {
    setAxiosLoading(setLoading, setProgress);
  }, []);

  // Apparition / disparition
  useEffect(() => {
    if (loading) {
      gsap.to(modalRef.current, { opacity: 1, pointerEvents: "auto", duration: 0.3 });
    } else {
      gsap.to(modalRef.current, { opacity: 0, pointerEvents: "none", duration: 0.3 });
    }
  }, [loading]);

  // Cercle progress
  useEffect(() => {
    if (circleRef.current) {
      gsap.to(circleRef.current, {
        strokeDashoffset: 226 - (226 * progress) / 100,
        duration: 0.2,
        ease: "power2.out"
      });
    }
  }, [progress]);

  // Halo pulsé
  useEffect(() => {
    gsap.to(haloRef.current, {
      scale: 1.15,
      opacity: 0.5,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]"
      style={{ opacity: 0, pointerEvents: "none" }}
    >
      <div className="p-6 rounded-2xl shadow-lg flex flex-col items-center w-40 relative">
        <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
          {/* Halo */}
          <div
            ref={haloRef}
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: "0 0 16px 4px rgba(59,130,246,0.5)" }}
          ></div>

          {/* Cercle SVG */}
          <svg width="96" height="96" className="absolute inset-0">
            <circle cx="48" cy="48" r="36" stroke="#e5e7eb" strokeWidth="6" fill="none" />
            <circle
              ref={circleRef}
              cx="48"
              cy="48"
              r="36"
              stroke="#3b82f6"
              strokeWidth="6"
              fill="none"
              strokeDasharray="226"
              strokeDashoffset="226"
              strokeLinecap="round"
            />
          </svg>

          {/* Pourcentage */}
          <span className="absolute text-lg font-semibold text-white">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
