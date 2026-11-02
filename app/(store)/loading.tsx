import React from 'react';

export default function StoreLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Hero Header Skeleton */}
      <div className="bg-gradient-to-b from-blue-50/50 to-white px-4 py-8 text-center sm:py-12 dark:from-zinc-900/50 dark:to-zinc-950">
        <div className="mx-auto h-9 w-3/4 max-w-md rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="mx-auto mt-3 h-4 w-1/2 max-w-sm rounded-lg bg-zinc-200 dark:bg-zinc-800" />

        {/* Search bar skeleton */}
        <div className="mx-auto mt-6 h-11 max-w-md rounded-full bg-zinc-200 dark:bg-zinc-800" />

        {/* Categories skeleton */}
        <div className="mx-auto mt-6 flex max-w-xs items-center justify-center gap-2">
          <div className="h-7 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-7 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-7 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-7 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="aspect-4/3 w-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="h-5 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-8 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
