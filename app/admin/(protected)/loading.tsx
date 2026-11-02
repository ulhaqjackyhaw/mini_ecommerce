import React from 'react';

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-64 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-96 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="h-9 w-28 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="h-7 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-2.5 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 h-80 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900" />
        <div className="lg:col-span-4 h-80 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900" />
      </div>

      {/* Table Skeleton */}
      <div className="h-72 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />
    </div>
  );
}
