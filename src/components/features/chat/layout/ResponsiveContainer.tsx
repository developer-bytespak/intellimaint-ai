'use client';

import { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export default function ResponsiveContainer({ children, className = '' }: ResponsiveContainerProps) {
  return (
    <div className={`w-full max-w-full min-w-0 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export function FlexContainer({ children, className = '' }: ResponsiveContainerProps) {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {children}
    </div>
  );
}

