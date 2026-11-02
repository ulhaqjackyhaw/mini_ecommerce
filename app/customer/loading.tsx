import React from 'react';

export default function CustomerLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid grid-cols-1 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-5 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-5 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="h-4 w-60 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-10 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
