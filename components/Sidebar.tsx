"use client";

import React from 'react';

type Props = {
  onAddPerson: () => void;
  onExport: () => void;
  onChangeUser?: () => void;
};
type MobileProps = Props & {
  isOpen?: boolean;
  onClose?: () => void;
};

export default function Sidebar({ isOpen, onClose, onAddPerson, onExport, onChangeUser }: MobileProps) {
  return (
    <>
      <aside className="hidden w-72 flex-none border-r border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-[#0b0b0b] sm:block">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Дерево семьи</h2>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onAddPerson}
            className="rounded-md bg-foreground/90 py-2 px-3 text-sm font-medium text-background hover:opacity-95"
          >
            Добавить человека
          </button>

          <button
            onClick={onExport}
            className="rounded-md border border-zinc-200 py-2 px-3 text-sm hover:bg-zinc-100 dark:border-zinc-700"
          >
            Экспорт JSON
          </button>

          <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            Привод: интерфейс похожий на n8n — свободное размещение узлов, связи и экспорт/импорт.
          </div>
          <div className="mt-4">
            <button onClick={onChangeUser} className="rounded-md border border-zinc-200 py-2 px-3 text-sm hover:bg-zinc-100 dark:border-zinc-700">Сменить пользователя</button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay panel */}
      <div
        className={`fixed inset-0 z-50 flex transition-opacity sm:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!isOpen}
      >
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative z-50 w-72 flex-none border-r border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-[#0b0b0b]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Дерево семьи</h2>
            <button onClick={onClose} aria-label="Закрыть" className="ml-2 text-zinc-600 dark:text-zinc-300">
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                onAddPerson();
                onClose?.();
              }}
              className="rounded-md bg-foreground/90 py-2 px-3 text-sm font-medium text-background hover:opacity-95"
            >
              Добавить человека
            </button>

            <button
              onClick={() => {
                onExport();
                onClose?.();
              }}
              className="rounded-md border border-zinc-200 py-2 px-3 text-sm hover:bg-zinc-100 dark:border-zinc-700"
            >
              Экспорт JSON
            </button>

            <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
              Привод: интерфейс похожий на n8n — свободное размещение узлов, связи и экспорт/импорт.
            </div>
            <div className="mt-4">
              <button onClick={() => { onChangeUser?.(); onClose?.(); }} className="rounded-md border border-zinc-200 py-2 px-3 text-sm hover:bg-zinc-100 dark:border-zinc-700">Сменить пользователя</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
