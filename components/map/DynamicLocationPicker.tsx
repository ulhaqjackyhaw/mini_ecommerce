'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Loader2 } from 'lucide-react';

const DynamicLocationPicker = dynamic(() => import('@/components/map/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin text-zinc-600 dark:text-zinc-400" />
        <span>Memuat peta interaktif...</span>
      </div>
    </div>
  ),
});

export default DynamicLocationPicker;

