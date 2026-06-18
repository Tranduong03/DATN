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
  enableSwipe?: boolean;
  tabs?: string[];
  onTabChange?: (tab: any) => void;
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
}

export function TabContentSlider({ 
  activeTab, 
  direction, 
  children, 
  className,
  stiffness = 350,
  damping = 28,
  transition,
  enableSwipe = false,
  tabs,
  onTabChange,
  style,
  contentStyle
}: TabContentSliderProps) {
  const currentIdx = tabs ? tabs.indexOf(activeTab) : -1;
  const isFirst = currentIdx === 0;
  const isLast = tabs ? currentIdx === tabs.length - 1 : false;

  // Lock boundary: 0 elasticity to stay static when dragging past boundaries, 0.4 elasticity for valid transitions
  const dragElasticValue = tabs ? {
    left: isLast ? 0 : 0.4,
    right: isFirst ? 0 : 0.4
  } : 0.4;

  const handleDragEnd = (_event: any, info: any) => {
    if (!tabs || !onTabChange || currentIdx === -1) return;

    const swipeThreshold = 80;
    const swipeVelocity = 0.5;
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -swipeThreshold || velocity < -swipeVelocity) {
      if (currentIdx < tabs.length - 1) {
        onTabChange(tabs[currentIdx + 1]);
      }
    } else if (offset > swipeThreshold || velocity > swipeVelocity) {
      if (currentIdx > 0) {
        onTabChange(tabs[currentIdx - 1]);
      }
    }
  };

  return (
    <div 
      className={className} 
      style={{ 
        overflow: 'hidden', 
        position: 'relative', 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        ...style 
      }}
    >
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
          style={{ 
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            ...contentStyle 
          }}
          {...(enableSwipe ? {
            drag: 'x',
            dragConstraints: { left: 0, right: 0 },
            dragElastic: dragElasticValue,
            onDragEnd: handleDragEnd
          } : {})}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
