import { useEffect, useRef, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import preloaderAnim from '../../assets/preload.lottie';
import './Preloader.css';

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
      if (W === 0 || H === 0) return;

      ctx.clearRect(0, 0, W, H);

      const toRemove: number[] = [];
      particles.forEach((p, idx) => {
        const age = (ts - p.spawnTime) / 1000;
        if (age >= p.life) {
          toRemove.push(idx);
          return;
        }

        const normAge = age / p.life; 
        const opacity = Math.sin(normAge * Math.PI) * 0.8; 

        const curY = p.y - p.speedY * age;
        const driftX = p.drift * age;
        const wobble = Math.sin(age * p.wobbleFreq * Math.PI * 2 + p.wobbleOff) * p.wobbleAmp;
        const curX = p.x + driftX + wobble;
        const angle = p.rotSpeed * age * Math.PI * 2;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(curX, curY);
        ctx.rotate(angle);
        ctx.font = `bold ${p.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 6;
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      });

      for (let i = toRemove.length - 1; i >= 0; i--) {
        particles.splice(toRemove[i], 1);
      }

      if (particles.length < SPORT_COUNT * 2 && Math.random() < 0.25) {
        const emoji = sports[Math.floor(Math.random() * sports.length)];
        particles.push(createParticle(emoji));
      }

      if (running) {
        animId = requestAnimationFrame(draw);
      }
    };

    const timers: any[] = [];
    const run = () => {
      sports.forEach((emoji, idx) => {
        timers.push(
          setTimeout(() => {
            if (running) particles.push(createParticle(emoji));
          }, idx * 180)
        );
      });
      animId = requestAnimationFrame(draw);
    };
    run();

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
    <div className={`preloader-container ${fadeOut ? 'fade-out' : ''}`}>
      <canvas
        ref={canvasRef}
        className="preloader-canvas"
      />
      <div className="preloader-animation-wrapper">
        <DotLottieReact
          src={preloaderAnim}
          autoplay
          loop
          speed={4}
          className="preloader-lottie-player"
        />
      </div>
    </div>
  );
}
export type { Preloader };