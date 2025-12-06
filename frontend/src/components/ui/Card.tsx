'use client';

import { clsx } from 'clsx';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'glass' | 'gradient' | 'subtle';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  glow?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  glow = false,
  className,
  onClick,
}: CardProps) {
  const variants = {
    default: 'bg-[#13131a] border-0',
    elevated: 'bg-[#18181f]',
    glass: 'bg-[#13131a]/80 backdrop-blur-xl',
    gradient: 'bg-gradient-to-br from-[#1f1f28] to-[#13131a]',
    subtle: 'bg-[#0f0f14]',
  };
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };
  
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-2xl',
        variants[variant],
        paddings[padding],
        hover && 'transition-all duration-300 cursor-pointer hover:bg-[#1a1a22] hover:-translate-y-0.5',
        glow && 'shadow-lg shadow-orange-500/5',
        className
      )}
    >
      {children}
    </div>
  );
}
