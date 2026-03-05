import { supabaseServer } from './supabaseServer';
import type { SupabaseClient } from '@supabase/supabase-js';

type KinshipEntry = {
  id: string;
  title?: string;
  titul?: string; // поддержка возможного старого ключа из JSON
};

type NodeData = {
  id: string;
  name?: string;
  title?: string;
  birth?: string;
  death?: string;
  photoUrl?: string;
  position?: { x: number; y: number };
  kinships?: KinshipEntry[] | null;
  data?: any;
};

type EdgeData = {
  id: string;
  source: string;
  target: string;
  label?: string;
  data?: any;
};

export async function upsertPeople(nodes: NodeData[], client?: SupabaseClient) {
  const sb = client ?? supabaseServer;
  if (!nodes?.length) return { error: null };
  const rows = nodes.map((n) => ({
    id: n.id,
    name: n.name ?? null,
    title: n.title ?? null,
    birth: n.birth ?? null,
    death: n.death ?? null,
    photo_url: n.photoUrl ?? null,
    position: n.position ? JSON.stringify(n.position) : null,
    information: (n as any).information ?? (n.data?.information ?? null),
    // prefer explicit data, otherwise include information if present
    data: n.data ?? ((n as any).information ? { information: (n as any).information } : null),
    // JSONB-поле с родством относительно этого человека
    kinships: n.kinships ?? n.data?.kinships ?? null,
  }));

  const { data, error } = await sb.from('people').upsert(rows, { onConflict: 'id' });
  return { data, error };
}

export async function createPerson(data: Partial<NodeData>, client?: SupabaseClient) {
  const sb = client ?? supabaseServer;
  const row = {
    id: data.id ?? data.id ?? String(Date.now()),
    name: data.name ?? null,
    title: data.title ?? null,
    birth: data.birth ?? null,
    death: data.death ?? null,
    photo_url: data.photoUrl ?? null,
    position: data.position ? JSON.stringify(data.position) : null,
    information: (data as any).information ?? (data.data?.information ?? null),
    data: data.data ?? ((data as any).information ? { information: (data as any).information } : null),
    kinships: data.kinships ?? data.data?.kinships ?? null,
  };
  const { data: res, error } = await sb.from('people').insert(row).select().single();
  return { data: res, error };
}

export async function updatePerson(id: string, updates: Partial<NodeData>, client?: SupabaseClient) {
  const sb = client ?? supabaseServer;
  if (!sb) return { data: null, error: new Error('Supabase client not initialized') };
  const payload: any = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.birth !== undefined) payload.birth = updates.birth;
  if (updates.death !== undefined) payload.death = updates.death;
  if (updates.photoUrl !== undefined) payload.photo_url = updates.photoUrl;
  if (updates.position !== undefined) payload.position = JSON.stringify(updates.position);
  if ((updates as any).kinships !== undefined) payload.kinships = (updates as any).kinships;
  // if updates include `information`, set explicit column and merge into existing `data` JSONB
  if ((updates as any).information !== undefined) {
    payload.information = (updates as any).information;
    // fetch current data to merge
    const cur = await sb.from('people').select('data').eq('id', id).maybeSingle();
    const existingData = cur.data?.data ?? null;
    const merged = { ...(existingData ?? {}), information: (updates as any).information };
    payload.data = merged;
  } else if (updates.data !== undefined) {
    payload.data = updates.data;
    if ((updates.data as any)?.information !== undefined) {
      payload.information = (updates.data as any).information;
    }
  }

  const { data: res, error } = await sb.from('people').update(payload).eq('id', id).select().maybeSingle();
  return { data: res, error };
}

export async function deletePerson(id: string, client?: SupabaseClient) {
  const sb = client ?? supabaseServer;
  // Delete person; relations have FK ON DELETE CASCADE in migration
  // use maybeSingle() to avoid error when no rows matched
  const { data, error } = await sb.from('people').delete().eq('id', id).select().maybeSingle();
  return { data, error };
}

export async function upsertRelations(edges: EdgeData[], client?: SupabaseClient) {
  const sb = client ?? supabaseServer;
  if (!edges?.length) return { error: null };
  const rows = edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label ?? null,
    data: e.data ?? null,
  }));

  const { data, error } = await sb.from('relations').upsert(rows, { onConflict: 'id' });
  return { data, error };
}

export async function deleteRelation(id: string, client?: SupabaseClient) {
  const sb = client ?? supabaseServer;
  const { data, error } = await sb.from('relations').delete().eq('id', id).select().maybeSingle();
  return { data, error };
}

export async function getPeople(client?: SupabaseClient) {
  const sb = client ?? supabaseServer;
  const { data, error } = await sb.from('people').select('*');
  return { data, error };
}

export async function getRelations(client?: SupabaseClient) {
  const sb = client ?? supabaseServer;
  const { data, error } = await sb.from('relations').select('*');
  return { data, error };
}

export async function saveFullFlow(nodes: NodeData[], edges: EdgeData[], flowId?: string, client?: SupabaseClient) {
  const sb = client ?? supabaseServer;
  const peopleResult = await upsertPeople(nodes, sb);
  if (peopleResult.error) return { error: peopleResult.error };

  const relResult = await upsertRelations(edges, sb);
  if (relResult.error) return { error: relResult.error };

  if (flowId) {
    const { data, error } = await sb.from('flows').upsert({ id: flowId, meta: {} }, { onConflict: 'id' });
    if (error) return { error };
  }

  return { error: null };
}

export async function loadFullFlow(client?: SupabaseClient) {
  const people = await getPeople(client);
  if (people.error) return { error: people.error };
  const relations = await getRelations(client);
  if (relations.error) return { error: relations.error };
  return { nodes: people.data, edges: relations.data };
}
