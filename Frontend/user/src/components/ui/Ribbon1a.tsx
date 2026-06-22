import React from 'react';

interface Ribbon1aProps {
  children: React.ReactNode;
}

export default function Ribbon1a({ children }: Ribbon1aProps) {
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '12px',
    left: 0,
    zIndex: 2,
  };

  const ribbonStyle: React.CSSProperties = {
    backgroundColor: '#00cf77',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 600,
    padding: '5px 22px 5px 12px',
    display: 'inline-flex',
    alignItems: 'center',
    position: 'relative',
    clipPath: 'polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%)',
    boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.1)',
  };

  const foldStyle: React.CSSProperties = {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: '-4px',
    width: 0,
    height: 0,
    borderTop: '4px solid #2b6139',
    borderLeft: '4px solid transparent',
    zIndex: -1,
  };

  return (
    <div style={containerStyle}>
      <div style={ribbonStyle}>
        {children}
      </div>
      <div style={foldStyle} />
    </div>
  );
}
