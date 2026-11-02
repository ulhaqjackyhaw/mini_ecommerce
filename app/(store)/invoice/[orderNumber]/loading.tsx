import React from 'react';

export default function InvoiceLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 animate-pulse space-y-6">
      <div className="flex justify-between">
        <div className="h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-9 w-40 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
        <div className="flex justify-between">
          <div className="h-8 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="h-16 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-20 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-20 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="h-32 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

