'use client';

import { useEffect } from 'react';

interface ConfettiProps {
  trigger: boolean;
  theme?: [string, string];
}

export default function Confetti({ trigger, theme }: ConfettiProps) {
  useEffect(() => {
    if (!trigger) return;

    const createConfetti = () => {
      for (let i = 0; i < 18; i++) {
        const element = document.createElement("span");
        element.textContent = "✦";
        element.style.position = "fixed";
        element.style.left = Math.random() * 100 + "vw";
        element.style.top = "-20px";
        element.style.fontSize = Math.random() * 18 + 10 + "px";
        element.style.color = theme ? theme[1] : "#3e3e3e";
        element.style.pointerEvents = "none";
        element.style.zIndex = "1000";
        document.body.appendChild(element);

        const duration = Math.random() * 1400 + 800;
        element.animate(
          [
            { transform: "translateY(0)", opacity: 1 },
            { transform: "translateY(100vh)", opacity: 0.8 }
          ],
          {
            duration,
            easing: "cubic-bezier(0.25, 0.8, 0.35, 1)",
            fill: "forwards"
          }
        );

        setTimeout(() => element.remove(), duration + 100);
      }
    };

    createConfetti();
  }, [trigger, theme]);

  return null;
} 