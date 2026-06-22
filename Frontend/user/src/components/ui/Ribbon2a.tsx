import React from 'react';

interface Ribbon2aProps {
  children: React.ReactNode;
}

export default function Ribbon2a({ children }: Ribbon2aProps) {
  const badgeStyle: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: '6px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#854d0e',
    fontFamily: '"Montserrat", sans-serif',
  };

  return (
    <div style={badgeStyle}>
      {children}
    </div>
  );
}
