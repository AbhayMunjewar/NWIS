import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'full' | 'use' | 'view' | 'info' | 'warning' | 'critical' | 'neutral' | 'demo';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'full':
        return 'bg-emerald-100 text-emerald-950 border-emerald-300 font-extrabold';
      case 'use':
        return 'bg-amber-100 text-amber-950 border-amber-300 font-extrabold';
      case 'view':
        return 'bg-blue-100 text-blue-950 border-blue-300 font-extrabold';
      case 'info':
        return 'bg-sky-100 text-sky-950 border-sky-300 font-extrabold';
      case 'warning':
        return 'bg-amber-100 text-amber-950 border-amber-300 font-extrabold';
      case 'critical':
        return 'bg-rose-100 text-rose-950 border-rose-300 font-extrabold';
      case 'demo':
        return 'bg-purple-100 text-purple-950 border-purple-300 font-extrabold';
      case 'neutral':
      default:
        return 'bg-slate-100 text-slate-900 border-slate-300 font-extrabold';
    }
  };

  const getSizeStyles = () => {
    return size === 'sm' 
      ? 'px-1.5 py-0.5 text-[10px] tracking-wide font-extrabold' 
      : 'px-2 py-0.5 text-xs tracking-wide font-extrabold';
  };

  return (
    <span className={`inline-flex items-center rounded-md border ${getVariantStyles()} ${getSizeStyles()} ${className}`}>
      {children}
    </span>
  );
};

