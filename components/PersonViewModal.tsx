import React from 'react';

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
  if (!node) return null;

  const { name, title, birth, death, photoUrl, information } = node.data || {};

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-white rounded-lg shadow-lg p-6 w-[min(90%,520px)] z-10">
        <div className="flex items-center gap-4">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200" />
          )}
          <div>
            <div className="text-lg font-semibold text-zinc-900">{name}</div>
            {title && <div className="text-sm text-zinc-600">{title}</div>}
          </div>
        </div>

        <div className="mt-4 text-sm text-zinc-700 space-y-2">
          <div className="flex gap-4">
            {birth ? <div className="text-sm"><strong>Родился:</strong> <span className="ml-1">{birth}</span></div> : null}
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
    </div>
  );
}
