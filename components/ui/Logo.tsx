'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({
  className = '',
  iconSize = 'md',
  showText = true,
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 rounded-md text-xs',
    md: 'h-8 w-8 rounded-lg text-sm',
    lg: 'h-10 w-10 rounded-xl text-base',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const iconSvgSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon Mark: Minimalist Geometric Monogram "A" */}
      <div
        className={`flex items-center justify-center bg-zinc-900 text-white shadow-xs dark:bg-white dark:text-zinc-900 transition-transform ${sizeClasses[iconSize]}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={iconSvgSizes[iconSize]}
        >
          {/* Stylized Modern "A" Bag Motif */}
          <path d="M6 20h12" />
          <path d="M12 4L6 20" />
          <path d="M12 4l6 16" />
          <path d="M8.5 14h7" />
        </svg>
      </div>

      {showText && (
        <span
          className={`font-bold tracking-tight text-zinc-900 dark:text-zinc-50 ${textSizes[iconSize]}`}
        >
          Amara<span className="font-semibold text-zinc-500 dark:text-zinc-400">Store</span>
        </span>
      )}
    </div>
  );
}

export default Logo;
