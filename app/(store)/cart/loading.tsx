import React from 'react';

export default function CartLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-6 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="h-20 w-20 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-1/4 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <div className="h-8 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            </div>
          ))}
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="h-5 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-10 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
