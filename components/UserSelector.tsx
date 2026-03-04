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
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black/50" />
        <div className="bg-white p-6 rounded shadow">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50" />
      <div className="bg-white rounded-lg shadow p-6 w-[min(95%,640px)] z-10">
        <h3 className="text-lg font-semibold mb-3">Выберите, кто вы</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-auto">
          {people.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`flex items-center gap-3 w-full rounded p-2 text-left border ${selected === p.id ? 'border-blue-500 bg-blue-50' : 'border-zinc-200'}`}>
              <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-100">
                {p.photo_url ? <img src={p.photo_url} alt={p.name} className="h-full w-full object-cover" /> : null}
              </div>
              <div>
                <div className="text-sm font-medium">{p.name || 'Без имени'}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button onClick={() => { localStorage.removeItem('kredo_current_user'); onSelect(''); }} className="px-3 py-2 rounded border">Очистить</button>
          <button
            onClick={() => {
              if (!selected) return;
              localStorage.setItem('kredo_current_user', selected);
              onSelect(selected);
            }}
            className="px-3 py-2 rounded bg-blue-600 text-white"
          >
            Продолжить
          </button>
        </div>
      </div>
    </div>
  );
}
