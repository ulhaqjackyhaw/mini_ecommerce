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
    sm: 'h-7 w-7 rounded-lg text-xs',
    md: 'h-9 w-9 sm:h-10 sm:w-10 rounded-xl text-sm',
    lg: 'h-11 w-11 sm:h-12 sm:w-12 rounded-xl text-base',
  };

  const iconSvgSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4.5 w-4.5 sm:h-5 sm:w-5',
    lg: 'h-5.5 w-5.5 sm:h-6 sm:w-6',
  };

  const textSizes = {
    sm: 'text-sm font-bold',
    md: 'text-base sm:text-lg font-extrabold',
    lg: 'text-lg sm:text-2xl font-black',
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
