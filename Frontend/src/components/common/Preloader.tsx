import { useEffect, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import preloaderAnim from '../../assets/preload.lottie';

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const MIN_TIME = 1600;
    const start = Date.now();

    const hide = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_TIME - elapsed);

      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setVisible(false), 400);
      }, remaining);
    };

    if (document.readyState === 'complete') {
      hide();
    } else {
      window.addEventListener('load', hide, { once: true });
    }
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'lightgreen', // Màu nền xanh như yêu cầu
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.4s ease',
    }}>
      <DotLottieReact
        src={preloaderAnim}
        autoplay
        loop
        speed={5}
        style={{ width: 300, height: 300 }}
      />
    </div>
  );
}