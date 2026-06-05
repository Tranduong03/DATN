import type { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  noPaddingBottom?: boolean;
}

export default function MainLayout({ children, noPaddingBottom }: MainLayoutProps) {
  return (
    <div className={`main-layout ${noPaddingBottom ? 'no-padding-bottom' : ''}`}>
      {children}
    </div>
  );
}
