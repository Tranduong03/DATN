import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 1. Tab sliding variants
export const tabVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

// 2. Custom hook to handle tab change and direction calculation automatically
export function useTabDirection<T extends string>(initialTab: T, tabsOrder: T[]) {
  const [activeTab, setActiveTab] = useState<T>(initialTab);
  const [direction, setDirection] = useState(0);

  const changeTab = (tab: T) => {
    if (tab === activeTab) return;
    const currentIdx = tabsOrder.indexOf(activeTab);
    const targetIdx = tabsOrder.indexOf(tab);
    setDirection(targetIdx > currentIdx ? 1 : -1);
    setActiveTab(tab);
  };

  return { activeTab, direction, changeTab, setActiveTab };
}

// 3. TabUnderline component for sliding indicator underline
interface TabUnderlineProps {
  layoutId?: string;
  color?: string;
  height?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
  borderRadius?: number | string;
  stiffness?: number;
  damping?: number;
  style?: React.CSSProperties;
  transition?: any;
}

export function TabUnderline({
  layoutId = 'activeTabUnderline',
  color = '#10b981',
  height = '2px',
  bottom = 0,
  left = '10px',
  right = '10px',
  borderRadius = '2px',
  stiffness = 350,
  damping = 28,
  style,
  transition
}: TabUnderlineProps) {
  return (
    <motion.div
      layoutId={layoutId}
      style={{
        position: 'absolute',
        bottom,
        left,
        right,
        height,
        backgroundColor: color,
        borderRadius,
        ...style
      }}
      transition={transition || { type: 'spring', stiffness, damping }}
    />
  );
}

// 4. TabContentSlider component to wrap tabs view content
interface TabContentSliderProps {
  activeTab: string;
  direction: number;
  children: React.ReactNode;
  className?: string;
  stiffness?: number;
  damping?: number;
  transition?: any;
}

export function TabContentSlider({ 
  activeTab, 
  direction, 
  children, 
  className,
  stiffness = 350,
  damping = 28,
  transition
}: TabContentSliderProps) {
  return (
    <div className={className} style={{ overflow: 'hidden', position: 'relative', width: '100%' }}>
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={activeTab}
          custom={direction}
          variants={tabVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition || {
            x: { type: 'spring', stiffness, damping },
            opacity: { duration: 0.12 }
          }}
          style={{ width: '100%' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
