import React from 'react';

export default function TrackOrderLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 animate-pulse space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto h-8 w-56 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="mx-auto h-4 w-80 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="mx-auto max-w-xl h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
        <div className="h-6 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-16 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-16 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-16 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}

