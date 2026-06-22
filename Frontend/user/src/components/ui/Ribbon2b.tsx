import React from 'react';

interface Ribbon2bProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function Ribbon2b({ children, className, style }: Ribbon2bProps) {
  const badgeStyle: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 400,
    padding: '5px 30px 5px 20px',
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#e15024', // màu đỏ cam cho chưa thanh toán
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
