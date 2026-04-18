import { useEffect, useRef } from 'react';

export interface GraphBackgroundProps {
  enabled: boolean;
}

export function GraphBackground({ enabled }: GraphBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    let w = 0, h = 0, raf: number;

    const resize = () => {
      const rect = c.parentElement!.getBoundingClientRect();
      w = c.width = rect.width * devicePixelRatio;
      h = c.height = rect.height * devicePixelRatio;
      c.style.width = rect.width + 'px';
      c.style.height = rect.height + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0004,
      vy: (Math.random() - 0.5) * 0.0004,
      r: Math.random() * 1.4 + 0.4,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.03 + 0.01,
      hue: Math.random() < 0.25 ? 170 : 185,
    }));

    const pulses: { x: number; y: number; r: number; max: number }[] = [];
    let lastPulse = 0;
    let t = 0;

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      t += 1;

      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
        p.phase += p.speed;
        const a = 0.25 + 0.55 * (Math.sin(p.phase) * 0.5 + 0.5);
        const px = p.x * w, py = p.y * h;
        ctx.beginPath();
        ctx.arc(px, py, p.r * devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${a})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, p.r * devicePixelRatio * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${a * 0.08})`;
        ctx.fill();
      }

      if (t - lastPulse > 180) {
        pulses.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0,
          max: Math.min(w, h) * 0.4,
        });
        lastPulse = t;
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.r += 1.5 * devicePixelRatio;
        const alpha = Math.max(0, 1 - p.r / p.max) * 0.25;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(25, 184, 190, ${alpha})`;
        ctx.lineWidth = 1.5 * devicePixelRatio;
        ctx.stroke();
        if (p.r > p.max) pulses.splice(i, 1);
      }

      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [enabled]);

  const vis = enabled ? 1 : 0;

  return (
    <>
      <div className="kg-bg-quantum-gradient" style={{ opacity: vis }} />
      <div className="kg-bg-quantum-grid" style={{ opacity: enabled ? 0.7 : 0 }} />
      <div className="kg-bg-floor" style={{ opacity: vis }} />
      <div className="kg-bg-horizon" style={{ opacity: vis }} />
      <canvas ref={canvasRef} className="kg-bg-canvas" style={{ opacity: vis }} />
      <div className="kg-bg-atmosphere" style={{ opacity: vis }} />
      <div className="kg-bg-vignette" />
    </>
  );
}
