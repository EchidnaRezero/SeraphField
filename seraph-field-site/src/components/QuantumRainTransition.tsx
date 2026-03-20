import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AnnihilationTransitionProps {
  isActive: boolean;
  onComplete?: () => void;
}

interface FieldPoint {
  x: number;
  y: number;
  phase: number;
  amplitude: number;
  speed: number;
}

interface CreatedParticle {
  x: number;
  y: number;
  size: number;
  life: number;
  vx: number;
  vy: number;
}

export const AnnihilationTransition: React.FC<AnnihilationTransitionProps> = ({ isActive, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const duration = 250; // Much faster transition
    const startTime = Date.now();
    
    // Grid for field fluctuations
    const points: FieldPoint[] = [];
    const rows = 15;
    const cols = 25;
    for (let i = 0; i <= rows; i++) {
      for (let j = 0; j <= cols; j++) {
        points.push({
          x: (width / cols) * j,
          y: (height / rows) * i,
          phase: Math.random() * Math.PI * 2,
          amplitude: Math.random() * 20 + 10,
          speed: 0.3 + Math.random() * 0.4 // Faster speed
        });
      }
    }

    const particles: CreatedParticle[] = [];

    let animationFrameId: number;

    let completed = false;

    const draw = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      
      // Clear with very high transparency
      ctx.fillStyle = 'rgba(10, 11, 14, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // 1. Field Fluctuation (Symmetry Breaking Phase)
      ctx.beginPath();
      ctx.strokeStyle = `rgba(25, 184, 190, ${Math.max(0, (1 - progress) * 0.15)})`;
      ctx.lineWidth = 0.5;

      points.forEach(p => {
        p.phase += p.speed;
        const ox = Math.cos(p.phase) * p.amplitude * Math.max(0, (1 - progress));
        const oy = Math.sin(p.phase) * p.amplitude * Math.max(0, (1 - progress));
        
        // Draw subtle field lines
        ctx.moveTo(p.x + ox, p.y + oy);
        ctx.lineTo(p.x + ox + 2, p.y + oy + 2);

        // Symmetry Breaking: Particles "condense" from the field
        // Stop adding new particles once duration is reached
        if (progress < 1 && progress > 0.3 && Math.random() > 0.98 && particles.length < 100) {
          particles.push({
            x: p.x + ox,
            y: p.y + oy,
            size: Math.random() * 2 + 1,
            life: 1,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4
          });
        }
      });
      ctx.stroke();

      // 2. Particle Creation & Expansion
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05; // Faster fade
        
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const opacity = p.life * 0.4;
        ctx.fillStyle = `rgba(25, 184, 190, ${opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Subtle ripple on creation
        if (p.life > 0.9) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(25, 184, 190, ${(p.life - 0.9) * 2})`;
          ctx.arc(p.x, p.y, (1 - p.life) * 100, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      if (elapsed < duration || particles.length > 0) {
        animationFrameId = requestAnimationFrame(draw);
      } else if (!completed) {
        completed = true;
        if (onComplete) onComplete();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] pointer-events-none"
        >
          <canvas ref={canvasRef} className="w-full h-full" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
