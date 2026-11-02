import React from 'react';

export default function StoreLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Hero Header Skeleton */}
      <div className="border-b border-zinc-200/80 bg-zinc-50/50 px-4 py-10 sm:py-16 text-center dark:border-zinc-800 dark:bg-zinc-950/40">
        <div className="mx-auto h-5 w-40 rounded-full bg-zinc-200 dark:bg-zinc-800 mb-3" />
        <div className="mx-auto h-10 sm:h-12 w-3/4 max-w-lg rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="mx-auto mt-3 h-5 w-1/2 max-w-md rounded-lg bg-zinc-200 dark:bg-zinc-800" />

        {/* Search bar skeleton */}
        <div className="mx-auto mt-8 h-12 sm:h-14 max-w-2xl rounded-2xl bg-zinc-200 dark:bg-zinc-800" />

        {/* Categories skeleton */}
        <div className="mx-auto mt-6 flex max-w-xl items-center justify-center gap-2.5">
          <div className="h-10 w-24 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-10 w-24 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-10 w-24 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-10 w-24 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 2xl:gap-8">
          {[...Array(8)].map((_, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="aspect-4/3 w-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="p-4 sm:p-5 lg:p-6 space-y-3">
                <div className="h-3 w-20 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-5 w-3/4 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-full rounded-md bg-zinc-200 dark:bg-zinc-800" />
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between">
                  <div className="h-6 w-24 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="h-10 sm:h-11 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
