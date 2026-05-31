import { useEffect, useRef, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import preloaderAnim from '../../assets/preload.lottie';

const SPORTS_POOL = ['🏸', '🎾', '⚽', '🏀', '🏐', '🏈', '🏓', '⛳'];
const SPORT_COUNT = 8;

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true })!; 
    let animId: number;
    let running = true;
    const particles: any[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const sports = [...SPORTS_POOL]
      .sort(() => Math.random() - 0.5)
      .slice(0, SPORT_COUNT);

    const createParticle = (emoji: string) => ({
      emoji,
      x: 24 + Math.random() * (canvas.offsetWidth - 48),      
      y: canvas.offsetHeight * 0.2 + Math.random() * canvas.offsetHeight * 0.7,
      size: 13 + Math.random() * 16,
      speedY: 100 + Math.random() * 80,
      drift: (Math.random() - 0.5) * 40,
      wobbleAmp: 16 + Math.random() * 18,
      wobbleFreq: 0.8 + Math.random() * 1.2,
      wobbleOff: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 1.2,
      spawnTime: performance.now(),
      life: 1.4 + Math.random() * 0.4,
    });

    const draw = (ts: number) => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      let i = particles.length;
      while (i--) {
        const p = particles[i];
        if ((ts - p.spawnTime) / 1000 >= p.life) {
          particles.splice(i, 1);
          continue;
        }

        const age = (ts - p.spawnTime) / 1000;
        const ratio = age / p.life;
        let alpha = 1;
        if (ratio < 0.1) alpha = ratio / 0.1;
        else if (ratio > 0.75) alpha = 1 - (ratio - 0.75) / 0.25;

        const cx = p.x + Math.sin(p.wobbleOff + age * p.wobbleFreq) * p.wobbleAmp + p.drift * ratio;
        const cy = p.y - age * p.speedY;
        if (cy + p.size < 0) continue;

        ctx.save();
        ctx.globalAlpha = alpha * 0.85;
        ctx.translate(cx, cy);
        ctx.rotate(age * p.rotSpeed);
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      }

      if (running) animId = requestAnimationFrame(draw);
    };

    const total = sports.length * 2;
    const icons = Array.from({ length: total }, (_, i) => sports[i % sports.length])
      .sort(() => Math.random() - 0.5);
    const timers: ReturnType<typeof setTimeout>[] = [];
    icons.forEach((emoji, i) => {
      const delay = 150 + (i / total) * 600;
      timers.push(setTimeout(() => {
        if (running) particles.push(createParticle(emoji));
      }, delay));
    });

    animId = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    const MIN_TIME = 2000;
    const start = Date.now();

    const hide = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_TIME - elapsed);
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setVisible(false), 400);
      }, remaining);
    };

    if (document.readyState === 'complete') hide();
    else window.addEventListener('load', hide, { once: true });
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'radial-gradient(ellipse at 50% 30%, #4a8f5f 0%, #326441 50%, #1b3823 100%)', // Option 1: Brand Theme
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.4s ease',
    }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2,
      }}>
        <DotLottieReact
          src={preloaderAnim}
          autoplay
          loop
          speed={4}
          style={{ width: 350, height: 350 }}
        />
      </div>
    </div>
  );
}