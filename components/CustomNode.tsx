import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

type Props = {
  data: {
    name: string;
    birth?: string;
    death?: string;
    title?: string;
    photoUrl?: string | null;
    isCurrentUser?: boolean;
  };
};

export default function CustomNode({ data }: Props) {
  const [imgError, setImgError] = useState(false);
  const isCurrent = !!data.isCurrentUser;
  const containerClass = isCurrent
    ? 'w-72 rounded-xl border p-4 shadow-md border-blue-500 ring-2 ring-blue-200 bg-blue-50'
    : 'w-72 rounded-xl border p-4 shadow-md border-zinc-200 bg-white dark:border-zinc-700 dark:bg-[#111]';
  const nameClass = isCurrent ? 'truncate text-sm font-semibold text-zinc-900' : 'truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50';
  const titleClass = isCurrent ? 'truncate text-xs text-zinc-700' : 'truncate text-xs text-zinc-500 dark:text-zinc-400';
  const metaClass = isCurrent ? 'mt-2 flex items-center text-xs text-zinc-700' : 'mt-2 flex items-center text-xs text-zinc-500 dark:text-zinc-400';

  return (
    <div className={containerClass}>
      <Handle id="top" type="target" position={Position.Top} style={{ background: '#555' }} />
      <Handle id="left" type="target" position={Position.Left} style={{ background: '#555' }} />
      <Handle id="right" type="source" position={Position.Right} style={{ background: '#555' }} />
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 flex-none overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          {data.photoUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.photoUrl} alt={data.name} className="h-full w-full object-cover" onError={() => setImgError(true)} />
          ) : null}
        </div>
        <div className="min-w-0">
          <div className={nameClass}>{data.name}</div>
          {data.title && (
            <div className={titleClass}>{data.title}</div>
          )}
        </div>
      </div>
      <div className={metaClass}>
        <div>{data.birth ?? '—'}</div>
        <div className="mx-2">•</div>
        <div>{data.death ?? ''}</div>
      </div>
      <Handle id="bottom" type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
}
