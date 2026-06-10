import React, { createContext, useContext, useState } from 'react';
import './alert-dialog.css';

interface AlertDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface AlertDialogContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const AlertDialogContext = createContext<AlertDialogContextType | null>(null);

export function AlertDialog({ children, open, onOpenChange }: AlertDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  
  const setIsOpen = (value: boolean) => {
    if (!isControlled) {
      setInternalOpen(value);
    }
    if (onOpenChange) {
      onOpenChange(value);
    }
  };

  return (
    <AlertDialogContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

export function AlertDialogTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const context = useContext(AlertDialogContext);
  if (!context) throw new Error('AlertDialogTrigger must be used within AlertDialog');

  const handleClick = () => {
    context.setIsOpen(true);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        if (child.props && child.props.onClick) child.props.onClick(e);
        handleClick();
      }
    });
  }

  return <button onClick={handleClick}>{children}</button>;
}

export function AlertDialogContent({ children, size = 'sm' }: { children: React.ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  const context = useContext(AlertDialogContext);
  if (!context) throw new Error('AlertDialogContent must be used within AlertDialog');

  if (!context.isOpen) return null;

  return (
    <div className="alert-dialog-overlay" onClick={() => context.setIsOpen(false)}>
      <div 
        className={`alert-dialog-content size-${size}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function AlertDialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="alert-dialog-header">{children}</div>;
}

export function AlertDialogTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="alert-dialog-title">{children}</h3>;
}

export function AlertDialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="alert-dialog-description">{children}</p>;
}

export function AlertDialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="alert-dialog-footer">{children}</div>;
}

export function AlertDialogCancel({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const context = useContext(AlertDialogContext);
  if (!context) throw new Error('AlertDialogCancel must be used within AlertDialog');

  const handleClick = () => {
    if (onClick) onClick();
    context.setIsOpen(false);
  };

  return (
    <button className="alert-dialog-btn-cancel" onClick={handleClick}>
      {children}
    </button>
  );
}

export function AlertDialogAction({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const context = useContext(AlertDialogContext);
  if (!context) throw new Error('AlertDialogAction must be used within AlertDialog');

  const handleClick = () => {
    if (onClick) onClick();
    context.setIsOpen(false);
  };

  return (
    <button className="alert-dialog-btn-action" onClick={handleClick}>
      {children}
    </button>
  );
}
