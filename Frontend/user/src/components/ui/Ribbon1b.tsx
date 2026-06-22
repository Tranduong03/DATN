import React from 'react';

interface Ribbon1bProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function Ribbon1b({ children, className, style }: Ribbon1bProps) {
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    ...style
  };

  const ribbonStyle: React.CSSProperties = {
    backgroundColor: '#78acffff',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 400,
    padding: '5px 30px 5px 20px',
    display: 'inline-flex',
    alignItems: 'center',
    position: 'relative',
    clipPath: 'polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%)',
    boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div className={className} style={containerStyle}>
      <div style={ribbonStyle}>
        {children}
      </div>
    </div>
  );
}
