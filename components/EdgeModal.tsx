"use client";

import React, { useEffect, useState } from 'react';
import { Edge } from 'reactflow';

type Props = {
  edge: Edge | null;
  onClose: () => void;
  onSave: (id: string, label: string) => void;
  onDelete?: (id: string) => void;
};

export default function EdgeModal({ edge, onClose, onSave, onDelete }: Props) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!edge) return;
    setLabel(String(edge.label ?? ''));
  }, [edge]);

  if (!edge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-11/12 max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-[#0b0b0b]">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Редактировать связь</div>
          <button onClick={onClose} className="text-zinc-600 dark:text-zinc-300">✕</button>
        </div>

        <label className="flex flex-col">
          <span className="mb-1 text-xs text-zinc-600 dark:text-zinc-400">Титул (на линии)</span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} className="rounded border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-[#0b0b0b]" />
        </label>

        <div className="mt-4 flex justify-between gap-3">
          {onDelete && (
            <button
              onClick={() => {
                if (confirm('Удалить эту связь?')) {
                  onDelete(edge.id);
                }
              }}
              className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 dark:border-red-800"
            >
              Удалить связь
            </button>
          )}
          <div className="ml-auto flex gap-3">
            <button onClick={onClose} className="rounded-md border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700">Отмена</button>
            <button onClick={() => { onSave(edge.id, label); onClose(); }} className="rounded-md bg-foreground/90 px-4 py-2 text-sm font-medium text-background">Сохранить</button>
          </div>
        </div>
      </div>
    </div>
  );
}
