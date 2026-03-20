import React, { useEffect, useRef } from 'react';

export const QuantumField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Virtual particles that pop in and out
    const virtualParticles: VirtualParticle[] = [];
    const maxVirtualParticles = 40;

    class VirtualParticle {
      x: number;
      y: number;
      life: number;
      maxLife: number;
      size: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.maxLife = Math.random() * 40 + 20;
        this.life = this.maxLife;
        this.size = Math.random() * 1.5 + 0.5;
        this.color = 'rgba(25, 184, 190, '; // HUD Tone
      }

      update() {
        this.life--;
        return this.life > 0;
      }

      draw() {
        if (!ctx) return;
        const opacity = (this.life / this.maxLife) * 0.25;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + opacity + ')';
        ctx.fill();
        
        // Subtle glow
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(25, 184, 190, 0.5)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const animate = () => {
      // Semi-transparent clear for motion blur effect
      ctx.fillStyle = 'rgba(10, 11, 14, 0.35)';
      ctx.fillRect(0, 0, width, height);

      const time = Date.now() * 0.001;

      // 1. Vacuum Fluctuations (Subtle Expanding Ripples everywhere)
      if (Math.random() > 0.9) {
        const rx = Math.random() * width;
        const ry = Math.random() * height;
        const maxR = Math.random() * 80 + 20;
        
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(25, 184, 190, 0.04)';
        ctx.lineWidth = 0.5;
        ctx.arc(rx, ry, maxR * 0.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 2. Fluid Probability Waves (Subtle Radial Gradients)
      for (let i = 0; i < 2; i++) {
        const cx = Math.random() * width;
        const cy = Math.random() * height;
        const radius = Math.random() * 100 + 20;
        const alpha = Math.random() * 0.02;
        
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `rgba(25, 184, 190, ${alpha})`);
        grad.addColorStop(1, 'rgba(25, 184, 190, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Subtle Energy Streamers (Curved paths)
      if (Math.random() > 0.8) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 60 + 10;
        
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(25, 184, 190, 0.03)';
        ctx.arc(x, y, r, Math.random() * Math.PI, Math.random() * Math.PI * 2);
        ctx.stroke();
      }

      // 4. Virtual Particles (Discrete energy points)
      if (virtualParticles.length < maxVirtualParticles && Math.random() > 0.5) {
        virtualParticles.push(new VirtualParticle());
      }

      for (let i = virtualParticles.length - 1; i >= 0; i--) {
        const p = virtualParticles[i];
        if (p.update()) {
          p.draw();
        } else {
          virtualParticles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
