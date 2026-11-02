import React from 'react';

export default function StoreLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Hero Header Skeleton */}
      <div className="border-b border-zinc-200/80 bg-gradient-to-b from-blue-50/70 via-white to-zinc-50/50 px-4 py-8 sm:py-12 text-center dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950">
        <div className="mx-auto h-6 w-48 rounded-full bg-zinc-200 dark:bg-zinc-800 mb-3" />
        <div className="mx-auto h-8 w-3/4 max-w-md rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="mx-auto mt-2 h-4 w-1/2 max-w-sm rounded-lg bg-zinc-200 dark:bg-zinc-800" />

        {/* Search bar skeleton */}
        <div className="mx-auto mt-6 h-12 max-w-lg rounded-2xl bg-zinc-200 dark:bg-zinc-800" />

        {/* Categories skeleton */}
        <div className="mx-auto mt-5 flex max-w-md items-center justify-center gap-2">
          <div className="h-8 w-24 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-20 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-20 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-20 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="aspect-4/3 w-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="p-3.5 sm:p-5 space-y-3">
                <div className="h-4 w-3/4 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-full rounded-md bg-zinc-200 dark:bg-zinc-800" />
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="h-5 w-20 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="h-10 w-full rounded-xl sm:rounded-2xl bg-zinc-200 dark:bg-zinc-800 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
