'use client';

import React, { useEffect, useState } from 'react';

export default function PageTransition({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`flex-1 flex flex-col transition-all duration-300 ease-out ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}
