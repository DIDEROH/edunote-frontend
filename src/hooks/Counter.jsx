import React from 'react'
import { useEffect, useRef, useState } from "react";

function Counter({
  end,
  start = 0,
  duration = 2000,
  rootMargin = "0px",
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [value, setValue] = useState(start);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            setIsVisible(true);
            hasAnimated.current = true;
          }
        });
      },
      { root: null, rootMargin, threshold: 0.4 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentValue = Math.floor(progress * (end - start) + start);

      setValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, start, end, duration]);

  return (
    <span ref={ref} style={{ display: "inline-block" }}>
      {value.toLocaleString()}
    </span>
  );
}

export default Counter