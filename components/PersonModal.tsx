"use client";

import React, { useEffect, useState } from 'react';
import { Node } from 'reactflow';

type Props = {
  node: Node | null;
  onClose: () => void;
  onSave: (id: string, data: any) => void;
  onDelete?: (id: string) => void;
};

export default function PersonModal({ node, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [birth, setBirth] = useState('');
  const [death, setDeath] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [information, setInformation] = useState('');
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (!node) return;
    // first populate from local node data so modal appears fast
    const d: any = node.data ?? {};
    const normalizeForInput = (val: any) => {
      if (!val) return '';
      if (/^\d{4}$/.test(val)) return `${val}-01-01`;
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
      return '';
    };
    setName(d.name ?? '');
    setTitle(d.title ?? '');
    setBirth(normalizeForInput(d.birth ?? ''));
    setDeath(normalizeForInput(d.death ?? ''));
    setPhotoUrl(d.photoUrl ?? '');
    setInformation(d.information ?? '');
    setPreviewError(false);

    // then try to fetch freshest data from server and overwrite fields
    (async () => {
      try {
        const res = await fetch(`/api/people/${node.id}`);
        const json = await res.json();
        if (json?.person) {
          const p = json.person;
          setName(p.name ?? (d.name ?? ''));
          setTitle(p.title ?? (d.title ?? ''));
          setBirth(normalizeForInput(p.birth ?? p.birth ?? d.birth ?? ''));
          setDeath(normalizeForInput(p.death ?? p.death ?? d.death ?? ''));
          setPhotoUrl(p.photo_url ?? d.photoUrl ?? '');
          setInformation((p.information ?? p.data?.information) ?? d.information ?? '');
        }
      } catch (err) {
        // ignore - keep local node data
      }
    })();
  }, [node]);

  if (!node) return null;

  const handleSave = () => {
    // Normalize photo path: if user provided a filename (no leading / or http),
    // store it as a path under `/` so it maps to the Next.js `public` folder.
    let savedPhoto = (photoUrl || '').trim();
    if (savedPhoto && !/^https?:\/\//i.test(savedPhoto) && !savedPhoto.startsWith('/')) {
      savedPhoto = `/${savedPhoto}`;
    }
    onSave(node.id, { name, title, birth, death, photoUrl: savedPhoto, information });
    onClose();
  };

  const handleDelete = () => {
    if (!node) return;
    if (confirm('Удалить этого человека? Это удалит связанные связи.')) {
      onDelete?.(node.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-11/12 max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-[#0b0b0b]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
              {photoUrl && !previewError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt={name}
                  className="h-full w-full object-cover"
                  onError={() => setPreviewError(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">Фото</div>
              )}
            </div>
            <div>
              <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{name || 'Новый человек'}</div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">ID: {node.id}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-600 dark:text-zinc-300">✕</button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col">
            <span className="mb-1 text-xs text-zinc-600 dark:text-zinc-400">Имя</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="rounded border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-[#0b0b0b]" />
          </label>

          <label className="flex flex-col">
            <span className="mb-1 text-xs text-zinc-600 dark:text-zinc-400">Титул</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-[#0b0b0b]" />
          </label>

          <label className="flex flex-col">
            <span className="mb-1 text-xs text-zinc-600 dark:text-zinc-400">Дата рождения</span>
            <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} className="rounded border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-[#0b0b0b]" />
          </label>

          <label className="flex flex-col">
            <span className="mb-1 text-xs text-zinc-600 dark:text-zinc-400">Дата смерти</span>
            <input type="date" value={death} onChange={(e) => setDeath(e.target.value)} className="rounded border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-[#0b0b0b]" />
          </label>

          <label className="col-span-1 flex w-full flex-col sm:col-span-2">
            <span className="mb-1 text-xs text-zinc-600 dark:text-zinc-400">Фото (URL)</span>
            <input value={photoUrl} onChange={(e) => { setPhotoUrl(e.target.value); setPreviewError(false); }} className="rounded border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-[#0b0b0b]" />
          </label>

          <label className="col-span-1 flex w-full flex-col sm:col-span-2">
            <span className="mb-1 text-xs text-zinc-600 dark:text-zinc-400">Информация</span>
            <textarea value={information} onChange={(e) => setInformation(e.target.value)} rows={4} className="rounded border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-[#0b0b0b]" />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button onClick={handleDelete} className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 dark:border-red-800">Удалить</button>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="rounded-md border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700">Отмена</button>
            <button onClick={handleSave} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Сохранить</button>
          </div>
        </div>
      </div>
    </div>
  );
}
