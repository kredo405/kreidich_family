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
    // first populate from local node data so modal appears fast
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
      } catch (err) {
        // ignore - keep local node data
      }
    })();

    // загрузим всех людей для подсказок по имени
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
      } catch {
        // ignore
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-50 w-11/12 max-w-2xl rounded-xl border border-zinc-800 bg-[#050505] p-6 shadow-2xl">
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
              <div className="text-lg font-semibold text-zinc-50">{name || 'Новый человек'}</div>
              <div className="text-sm text-zinc-500">ID: {node.id}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">✕</button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col">
            <span className="mb-1 text-xs text-zinc-300">Имя</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded border border-zinc-700 bg-[#111] px-3 py-2 text-sm text-zinc-50"
            />
          </label>

          <label className="flex flex-col">
            <span className="mb-1 text-xs text-zinc-300">Титул</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded border border-zinc-700 bg-[#111] px-3 py-2 text-sm text-zinc-50"
            />
          </label>

          <label className="flex flex-col">
            <span className="mb-1 text-xs text-zinc-300">Дата рождения</span>
            <input
              type="date"
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
              className="rounded border border-zinc-700 bg-[#111] px-3 py-2 text-sm text-zinc-50"
            />
          </label>

          <label className="flex flex-col">
            <span className="mb-1 text-xs text-zinc-300">Дата смерти</span>
            <input
              type="date"
              value={death}
              onChange={(e) => setDeath(e.target.value)}
              className="rounded border border-zinc-700 bg-[#111] px-3 py-2 text-sm text-zinc-50"
            />
          </label>

          <label className="col-span-1 flex w-full flex-col sm:col-span-2">
            <span className="mb-1 text-xs text-zinc-300">Фото (URL)</span>
            <input
              value={photoUrl}
              onChange={(e) => {
                setPhotoUrl(e.target.value);
                setPreviewError(false);
              }}
              className="rounded border border-zinc-700 bg-[#111] px-3 py-2 text-sm text-zinc-50"
            />
          </label>

          <label className="col-span-1 flex w-full flex-col sm:col-span-2">
            <span className="mb-1 text-xs text-zinc-300">Информация</span>
            <textarea
              value={information}
              onChange={(e) => setInformation(e.target.value)}
              rows={4}
              className="rounded border border-zinc-700 bg-[#111] px-3 py-2 text-sm text-zinc-50"
            />
          </label>

          <div className="col-span-1 flex w-full flex-col gap-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-300">Родство (для этого человека)</span>
              <button
                type="button"
                className="text-xs text-blue-400 hover:underline"
                onClick={() =>
                  setKinships((rows) => rows.concat({ id: '', title: '', name: '' }))
                }
              >
                Добавить родство
              </button>
            </div>
            {kinships.length === 0 && (
              <p className="text-xs text-zinc-400">
                Здесь можно задать, кем являются другие люди для этого человека. Пример: отец, мать, бабушка.
              </p>
            )}
            {kinships.map((row, idx) => (
              <div key={idx} className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] items-end">
                <label className="flex flex-col">
                  <span className="mb-1 text-[11px] text-zinc-300">Имя родственника</span>
                  <input
                    list="people-names"
                    value={row.name ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setKinships((rows) =>
                        rows.map((r, i) => {
                          if (i !== idx) return r;
                          const match = allPeople.find(
                            (p: any) => (p.name ?? '').toLowerCase() === value.toLowerCase(),
                          );
                          return {
                            ...r,
                            name: value,
                            id: match ? String(match.id) : r.id,
                          };
                        }),
                      );
                    }}
                    className="rounded border border-zinc-700 bg-[#111] px-2 py-1 text-xs text-zinc-50"
                  />
                </label>
                <label className="flex flex-col">
                  <span className="mb-1 text-[11px] text-zinc-300">ID родственника</span>
                  <input
                    value={row.id}
                    onChange={(e) => {
                      const value = e.target.value;
                      setKinships((rows) =>
                        rows.map((r, i) => {
                          if (i !== idx) return r;
                          const match = allPeople.find(
                            (p: any) => String(p.id) === value,
                          );
                          return {
                            ...r,
                            id: value,
                            name: match?.name ?? r.name,
                          };
                        }),
                      );
                    }}
                    className="rounded border border-zinc-700 bg-[#111] px-2 py-1 text-xs text-zinc-50"
                  />
                </label>
                <label className="flex flex-col">
                  <span className="mb-1 text-[11px] text-zinc-300">Титул относительно этого человека</span>
                  <div className="flex gap-2">
                    <input
                      value={row.title}
                      onChange={(e) => {
                        const value = e.target.value;
                        setKinships((rows) =>
                          rows.map((r, i) => (i === idx ? { ...r, title: value } : r)),
                        );
                      }}
                      className="flex-1 rounded border border-zinc-700 bg-[#111] px-2 py-1 text-xs text-zinc-50"
                    />
                    <button
                      type="button"
                      className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800"
                      onClick={() =>
                        setKinships((rows) => rows.filter((_, i) => i !== idx))
                      }
                    >
                      ✕
                    </button>
                  </div>
                </label>
              </div>
            ))}
            <datalist id="people-names">
              {allPeople.map((p: any) => (
                <option key={p.id} value={p.name ?? ''}>
                  {p.id}
                </option>
              ))}
            </datalist>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button onClick={handleDelete} className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 dark:border-red-800">Удалить</button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
            >
              Отмена
            </button>
            <button onClick={handleSave} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Сохранить</button>
          </div>
        </div>
      </div>
    </div>
  );
}
