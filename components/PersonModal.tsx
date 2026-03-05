"use client";

import React, { useEffect, useState } from 'react';
import { Node } from 'reactflow';

type Props = {
  node: Node | null;
  onClose: () => void;
  onSave: (id: string, data: any) => void;
  onDelete?: (id: string) => void;
};

type KinshipRow = {
  id: string;
  title: string;
  name?: string;
};

export default function PersonModal({ node, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [birth, setBirth] = useState('');
  const [death, setDeath] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [information, setInformation] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const [kinships, setKinships] = useState<KinshipRow[]>([]);
  const [allPeople, setAllPeople] = useState<any[]>([]);

  useEffect(() => {
    if (!node) return;
    const d: any = node.data ?? {};
    const normalizeForInput = (val: any) => {
      if (!val) return '';
      if (/^\d{4}$/.test(val)) return `${val}-01-01`;
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
      return '';
    };
    setName(d.name ?? '');
    setTitle(d.originalTitle ?? d.title ?? '');
    setBirth(normalizeForInput(d.birth ?? ''));
    setDeath(normalizeForInput(d.death ?? ''));
    setPhotoUrl(d.photoUrl ?? '');
    setInformation(d.information ?? '');
    
    const localKinships: any[] = d.kinships ?? [];
    setKinships(
      Array.isArray(localKinships)
        ? localKinships.map((k) => ({
            id: String((k as any).id ?? ''),
            title: (k as any).title ?? (k as any).titul ?? '',
          }))
        : [],
    );
    setPreviewError(false);

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
          const serverKinships: any[] = p.kinships ?? [];
          setKinships(
            Array.isArray(serverKinships)
              ? serverKinships.map((k) => ({
                  id: String((k as any).id ?? ''),
                  title: (k as any).title ?? (k as any).titul ?? '',
                }))
              : [],
          );
        }
      } catch (err) { /* ignore */ }
    })();

    (async () => {
      try {
        const res = await fetch('/api/people');
        const json = await res.json();
        if (Array.isArray(json?.people)) {
          setAllPeople(json.people);
          setKinships((rows) =>
            rows.map((r) => {
              const match = json.people.find((p: any) => String(p.id) === String(r.id));
              return { ...r, name: match?.name ?? r.name };
            }),
          );
        }
      } catch { /* ignore */ }
    })();
  }, [node]);

  if (!node) return null;

  const handleSave = () => {
    let savedPhoto = (photoUrl || '').trim();
    if (savedPhoto && !/^https?:\/\//i.test(savedPhoto) && !savedPhoto.startsWith('/')) {
      savedPhoto = `/${savedPhoto}`;
    }
    const kinshipsForSave = kinships
      .filter((k) => k.id && k.title)
      .map((k) => ({ id: k.id, title: k.title }));

    onSave(node.id, { name, title, birth, death, photoUrl: savedPhoto, information, kinships: kinshipsForSave });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Контейнер модального окна */}
      <div className="relative z-50 flex flex-col w-full max-w-2xl max-h-[90vh] rounded-xl border border-zinc-800 bg-[#050505] shadow-2xl overflow-hidden">
        
        {/* Шапка (Фиксированная) */}
        <div className="flex items-start justify-between border-b border-zinc-800 p-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-zinc-800">
              {photoUrl && !previewError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt={name}
                  className="h-full w-full object-cover"
                  onError={() => setPreviewError(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-wider text-zinc-500">Фото</div>
              )}
            </div>
            <div>
              <div className="text-lg font-semibold text-zinc-50 truncate max-w-[200px] sm:max-w-md">
                {name || 'Новый человек'}
              </div>
              <div className="text-xs text-zinc-500">ID: {node.id}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors">
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* Тело формы (Прокручиваемое) */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col">
              <span className="mb-1 text-xs font-medium text-zinc-400">Имя</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded border border-zinc-700 bg-[#111] px-3 py-2 text-sm text-zinc-50 focus:border-blue-500 focus:outline-none"
              />
            </label>

            <label className="flex flex-col">
              <span className="mb-1 text-xs font-medium text-zinc-400">Титул</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded border border-zinc-700 bg-[#111] px-3 py-2 text-sm text-zinc-50 focus:border-blue-500 focus:outline-none"
              />
            </label>

            <label className="flex flex-col">
              <span className="mb-1 text-xs font-medium text-zinc-400">Дата рождения</span>
              <input
                type="date"
                value={birth}
                onChange={(e) => setBirth(e.target.value)}
                className="rounded border border-zinc-700 bg-[#111] px-3 py-2 text-sm text-zinc-50 focus:border-blue-500 focus:outline-none [color-scheme:dark]"
              />
            </label>

            <label className="flex flex-col">
              <span className="mb-1 text-xs font-medium text-zinc-400">Дата смерти</span>
              <input
                type="date"
                value={death}
                onChange={(e) => setDeath(e.target.value)}
                className="rounded border border-zinc-700 bg-[#111] px-3 py-2 text-sm text-zinc-50 focus:border-blue-500 focus:outline-none [color-scheme:dark]"
              />
            </label>

            <label className="col-span-1 flex w-full flex-col sm:col-span-2">
              <span className="mb-1 text-xs font-medium text-zinc-400">Фото (URL)</span>
              <input
                value={photoUrl}
                onChange={(e) => {
                  setPhotoUrl(e.target.value);
                  setPreviewError(false);
                }}
                placeholder="https://..."
                className="rounded border border-zinc-700 bg-[#111] px-3 py-2 text-sm text-zinc-50 focus:border-blue-500 focus:outline-none"
              />
            </label>

            <label className="col-span-1 flex w-full flex-col sm:col-span-2">
              <span className="mb-1 text-xs font-medium text-zinc-400">Информация</span>
              <textarea
                value={information}
                onChange={(e) => setInformation(e.target.value)}
                rows={3}
                className="rounded border border-zinc-700 bg-[#111] px-3 py-2 text-sm text-zinc-50 focus:border-blue-500 focus:outline-none resize-none"
              />
            </label>

            {/* Секция Родства с собственной прокруткой */}
            <div className="col-span-1 flex w-full flex-col gap-3 sm:col-span-2 mt-2">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Родство</span>
                <button
                  type="button"
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  onClick={() => setKinships((rows) => rows.concat({ id: '', title: '', name: '' }))}
                >
                  + Добавить
                </button>
              </div>

              {kinships.length === 0 ? (
                <p className="py-2 text-xs italic text-zinc-500">Связи не указаны.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {kinships.map((row, idx) => (
                    <div key={idx} className="relative grid grid-cols-1 gap-2 rounded-lg border border-zinc-800/50 p-3 sm:grid-cols-[1fr_0.6fr_1fr] sm:items-end sm:p-0 sm:border-0">
                      <label className="flex flex-col">
                        <span className="mb-1 text-[10px] text-zinc-500 uppercase">Родственник</span>
                        <input
                          list="people-names"
                          placeholder="Имя..."
                          value={row.name ?? ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setKinships((rows) =>
                              rows.map((r, i) => {
                                if (i !== idx) return r;
                                const match = allPeople.find(
                                  (p: any) => (p.name ?? '').toLowerCase() === value.toLowerCase(),
                                );
                                return { ...r, name: value, id: match ? String(match.id) : r.id };
                              }),
                            );
                          }}
                          className="rounded border border-zinc-700 bg-[#111] px-2 py-1.5 text-xs text-zinc-50"
                        />
                      </label>
                      <label className="flex flex-col">
                        <span className="mb-1 text-[10px] text-zinc-500 uppercase">ID</span>
                        <input
                          value={row.id}
                          onChange={(e) => {
                            const value = e.target.value;
                            setKinships((rows) =>
                              rows.map((r, i) => {
                                if (i !== idx) return r;
                                const match = allPeople.find((p: any) => String(p.id) === value);
                                return { ...r, id: value, name: match?.name ?? r.name };
                              }),
                            );
                          }}
                          className="rounded border border-zinc-700 bg-[#111] px-2 py-1.5 text-xs text-zinc-50"
                        />
                      </label>
                      <label className="flex flex-col relative">
                        <span className="mb-1 text-[10px] text-zinc-500 uppercase">Кто он (титул)</span>
                        <div className="flex gap-2">
                          <input
                            value={row.title}
                            placeholder="напр. Отец"
                            onChange={(e) => {
                              const value = e.target.value;
                              setKinships((rows) =>
                                rows.map((r, i) => (i === idx ? { ...r, title: value } : r)),
                              );
                            }}
                            className="flex-1 rounded border border-zinc-700 bg-[#111] px-2 py-1.5 text-xs text-zinc-50"
                          />
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded border border-zinc-700 text-zinc-400 hover:bg-red-950/30 hover:text-red-400 transition-colors"
                            onClick={() => setKinships((rows) => rows.filter((_, i) => i !== idx))}
                          >
                            ✕
                          </button>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
              
              <datalist id="people-names">
                {allPeople.map((p: any) => (
                  <option key={p.id} value={p.name ?? ''}>ID: {p.id}</option>
                ))}
              </datalist>
            </div>
          </div>
        </div>

        {/* Футер (Фиксированный) */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-zinc-800 p-5 bg-[#080808]">
          <button 
            onClick={handleDelete} 
            className="w-full sm:w-auto rounded-md border border-red-900/50 px-4 py-2 text-sm text-red-500 hover:bg-red-950/20 transition-colors"
          >
            Удалить
          </button>
          <div className="flex w-full sm:w-auto items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Отмена
            </button>
            <button 
              onClick={handleSave} 
              className="flex-1 sm:flex-none rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>

      {/* Инлайн стили для красивого скроллбара (опционально) */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}