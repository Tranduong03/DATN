import React from 'react';

interface Ribbon2aProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function Ribbon2a({ children, className, style }: Ribbon2aProps) {
  const badgeStyle: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 400,
    padding: '5px 30px 5px 20px',
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#033b94ff', // màu xanh dương cho đã thanh toán
    clipPath: 'polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%)',
    marginLeft: '-15px',
    zIndex: 1,
    ...style
  };

  return (
    <div className={className} style={badgeStyle}>
      {children}
    </div>
  );
}
