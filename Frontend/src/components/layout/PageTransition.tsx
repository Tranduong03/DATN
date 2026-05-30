import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  direction: number;
}

export default function PageTransition({ children, direction }: PageTransitionProps) {
  const variants = {
    initial: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      zIndex: 1,
    }),
    animate: {
      x: 0,
      zIndex: 2,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      zIndex: 0,
    }),
  };

  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1], // cubic-bezier(0.4,0,0.2,1)
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#f6f8f6', // prevent seeing through
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      {children}
    </motion.div>
  );
}
