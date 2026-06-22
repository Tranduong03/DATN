import React, { useState, useEffect } from 'react';

interface Ribbon3Props {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function Ribbon3({ children, className, style }: Ribbon3Props) {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity((o) => (o === 1 ? 0.6 : 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const badgeStyle: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    opacity: opacity,
    transition: 'opacity 0.5s ease',
    fontFamily: '"Montserrat", sans-serif',
    marginLeft: '8px',
    zIndex: 3,
    ...style
  };

  return (
    <div className={className} style={badgeStyle}>
      {children}
    </div>
  );
}
