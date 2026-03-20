import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  symbol?: string;
  size: number;
}

export const CustomCursor = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const requestRef = useRef<number>(0);
  const lastEmitTime = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const now = Date.now();
      if (now - lastEmitTime.current > 80) {
        // Emit a pair of particles for annihilation effect
        const angle = Math.random() * Math.PI * 2;
        const distance = 25;
        const pairId = Math.random();
        
        const newParticles: Particle[] = [
          {
            id: pairId,
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            vx: -Math.cos(angle) * 2.5,
            vy: -Math.sin(angle) * 2.5,
            life: 1,
            color: 'rgba(0, 229, 255, ',
            size: 4 + Math.random() * 4
          },
          {
            id: pairId + 1,
            x: -Math.cos(angle) * distance,
            y: -Math.sin(angle) * distance,
            vx: Math.cos(angle) * 2.5,
            vy: Math.sin(angle) * 2.5,
            life: 1,
            color: 'rgba(255, 255, 255, ',
            size: 4 + Math.random() * 4
          }
        ];
        setParticles(prev => [...prev, ...newParticles]);
        lastEmitTime.current = now;
      }
    };

    const animate = () => {
      setParticles(prev => 
        prev
          .map(p => {
            const distSq = p.x * p.x + p.y * p.y;
            // Qubit Collapse / Annihilation Burst
            if (distSq < 4 && p.life > 0.5) {
              return {
                ...p,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 0.49, // Trigger burst
                symbol: Math.random() > 0.5 ? '1' : '0' // Add digital symbol on collapse
              };
            }
            return {
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              life: p.life - 0.025
            };
          })
          .filter(p => p.life > 0)
      );
      requestRef.current = requestAnimationFrame(animate);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(requestRef.current);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ left: mousePos.x, top: mousePos.y }}
    >
      {/* Pair Annihilation Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute flex items-center justify-center"
          style={{
            left: p.x,
            top: p.y,
            width: `${p.life * 6}px`,
            height: `${p.life * 6}px`,
            backgroundColor: p.symbol ? 'transparent' : p.color + p.life + ')',
            boxShadow: p.symbol ? 'none' : `0 0 ${p.life * 10}px ${p.color} 0.5)`,
            transform: `translate(-50%, -50%) ${p.symbol ? `rotate(${Math.random() * 360}deg)` : ''}`,
            fontFamily: '"JetBrains Mono", monospace',
            color: p.color + p.life + ')',
            textShadow: p.symbol ? `0 0 ${p.size}px ${p.color} 0.8)` : 'none',
            opacity: p.life,
            border: p.symbol ? `1px solid ${p.color}${p.life})` : 'none',
            borderRadius: p.symbol ? '0' : '50%'
          }}
        >
          {/* No direct symbols, just geometric shapes */}
        </div>
      ))}

      {/* Core Singularity */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_#fff]" />
      <div className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-neon-cyan rounded-full animate-ping opacity-20" />
      
      {/* Subtle HUD crosshair lines (very small) */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-px bg-neon-cyan/40" />
      <div className="absolute -translate-x-1/2 -translate-y-1/2 h-4 w-px bg-neon-cyan/40" />
    </div>
  );
};
