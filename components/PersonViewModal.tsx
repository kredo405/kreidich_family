import React, { useState } from 'react';

type PersonData = {
  id: string;
  data: {
    name?: string;
    title?: string;
    birth?: string;
    death?: string;
    photoUrl?: string;
    information?: string;
  };
};

export default function PersonViewModal({
  node,
  onClose,
  onEdit,
}: {
  node: PersonData | null;
  onClose: () => void;
  onEdit: (node: PersonData) => void;
}) {
  const [showPhoto, setShowPhoto] = useState(false);
  if (!node) return null;

  const { name, title, birth, death, photoUrl, information } = node.data || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="z-10 w-[min(90%,520px)] rounded-lg bg-white p-6 shadow-lg dark:bg-[#0b0b0b]">
        <div className="flex items-center gap-4">
          {photoUrl ? (
            <button
              type="button"
              onClick={() => setShowPhoto(true)}
              className="group relative flex h-16 w-16 flex-none overflow-hidden rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition group-hover:opacity-100">
                <span className="px-2 text-[10px] font-medium text-white">Открыть</span>
              </div>
            </button>
          ) : (
            <div className="h-16 w-16 rounded-full bg-gray-200" />
          )}
          <div>
            <div className="text-lg font-semibold text-zinc-100">{name}</div>
            {title && <div className="text-sm text-zinc-200">{title}</div>}
          </div>
        </div>

        <div className="mt-4 text-sm text-zinc-200 space-y-2">
          <div className="flex gap-4">
            {birth ? <div className="text-sm"><strong>Дата рождения:</strong> <span className="ml-1">{birth}</span></div> : null}
            {death ? <div className="text-sm"><strong>Умер:</strong> <span className="ml-1">{death}</span></div> : null}
          </div>

          {information ? (
            <p className="whitespace-pre-wrap">{information}</p>
          ) : (
            <p className="text-gray-400">Информация отсутствует</p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="px-3 py-2 rounded border border-zinc-200 text-zinc-700 bg-white"
            onClick={onClose}
          >
            Закрыть
          </button>
          <button
            className="px-3 py-2 rounded bg-blue-600 text-white"
            onClick={() => onEdit(node)}
          >
            Редактировать
          </button>
        </div>
      </div>
      {showPhoto && photoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowPhoto(false)} />
          <div className="relative z-10 max-h-[90vh] max-w-[90vw]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={name}
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setShowPhoto(false)}
              className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
