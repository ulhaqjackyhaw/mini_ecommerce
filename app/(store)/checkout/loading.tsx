import React from 'react';

export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      <div className="mb-6 h-5 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
            <div className="h-6 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-72 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-10 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-10 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-20 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-12 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-12 w-full rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-12 w-full rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

