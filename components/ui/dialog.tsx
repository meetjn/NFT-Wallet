"use client";

import { ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="bg-white rounded-lg max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return <div className={className}>{children}</div>;
};

export const DialogHeader = ({ children }: { children: ReactNode }) => {
  return <div className="mb-4">{children}</div>;
};

export const DialogTitle = ({ children }: { children: ReactNode }) => {
  return <h2 className="text-xl font-semibold">{children}</h2>;
}; 