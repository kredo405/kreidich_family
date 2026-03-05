"use client";

import React, { useEffect, useState } from "react";

type PersonRow = { id: string; name?: string; photo_url?: string | null };

export default function UserSelector({ onSelect, initialSelected }: { onSelect: (id: string) => void; initialSelected?: string | null }) {
  const [people, setPeople] = useState<PersonRow[] | null>(null);
  const [selected, setSelected] = useState<string | null>(initialSelected ?? null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/people');
        const json = await res.json();
        setPeople(json?.people ?? []);
      } catch (err) {
        setPeople([]);
      }
    })();
  }, []);

  if (!people) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative z-10 rounded-2xl bg-white/95 p-6 shadow-xl dark:bg-[#050505]/95">
          <div className="text-sm text-zinc-700 dark:text-zinc-200">Загрузка людей…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 w-[min(95%,640px)] rounded-2xl bg-white/95 p-6 shadow-2xl dark:bg-[#050505]/95">
        <h3 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Выберите, кто вы</h3>
        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
          Это нужно только для визуального выделения вас в дереве. В любой момент можно поменять.
        </p>
        <div className="grid max-h-72 grid-cols-1 gap-3 overflow-auto sm:grid-cols-2">
          {people.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${
                selected === p.id
                  ? 'border-blue-500 bg-blue-50/80 shadow-sm dark:border-blue-400/80 dark:bg-blue-500/10'
                  : 'border-zinc-200 bg-white/80 hover:border-blue-300 hover:bg-blue-50/60 dark:border-zinc-800 dark:bg-[#050505] dark:hover:border-blue-500/70'
              }`}
            >
              <div className="flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                {p.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photo_url} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">Нет фото</span>
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {p.name || 'Без имени'}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">ID: {p.id}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => {
              localStorage.removeItem('kredo_current_user');
              onSelect('');
            }}
            className="rounded-md border border-zinc-300 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Очистить
          </button>
          <button
            onClick={() => {
              if (!selected) return;
              localStorage.setItem('kredo_current_user', selected);
              onSelect(selected);
            }}
            className="rounded-md bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow hover:bg-blue-700"
          >
            Продолжить
          </button>
        </div>
      </div>
    </div>
  );
}
