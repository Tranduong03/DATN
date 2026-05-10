import type { ReactNode } from 'react';
import BottomNavigation from './BottomNavigation';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="main-layout">
      {children}
      <BottomNavigation />
    </div>
  );
}
