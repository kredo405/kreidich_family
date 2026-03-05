"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  Connection,
  EdgeChange,
  NodeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import Sidebar from './Sidebar';
import PersonModal from './PersonModal';
import PersonViewModal from './PersonViewModal';
import EdgeModal from './EdgeModal';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'person',
    position: { x: 50, y: 50 },
    data: { name: 'Алексей Иванов', birth: '1950', title: 'Отец' },
  },
  {
    id: '2',
    type: 'person',
    position: { x: 300, y: 200 },
    data: { name: 'Мария Иванова', birth: '1955', title: 'Мать' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: false },
];

const nodeTypes = { person: CustomNode };

export default function FlowCanvas() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [viewNode, setViewNode] = useState<Node | null>(null);
  const [editNode, setEditNode] = useState<Node | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // load nodes/edges from server on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const api = await import('../lib/apiClient');
        const res = await api.loadFlowFromServer();
        // expected shape: { nodes: [...], edges: [...] }
        if (!mounted || !res) return;
        if (res.nodes) {
          const loadedNodes = res.nodes.map((p: any) => ({
            id: p.id,
            type: 'person',
            position: p.position ? JSON.parse(p.position) : { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
            data: {
              name: p.name ?? '',
              birth: p.birth ?? '',
              // базовый титул (профессия/роль) человека, не зависящий от выбранного пользователя
              originalTitle: p.title ?? '',
              // отображаемый титул по умолчанию совпадает с базовым
              title: p.title ?? '',
              photoUrl: p.photo_url ?? null,
              information: p.data?.information ?? null,
              // JSONB-родство из БД: [{ id: '...', title: 'отец' }, ...]
              kinships: p.kinships ?? null,
              isCurrentUser: false,
            },
          }));
          setNodes(loadedNodes);
        }
        if (res.edges) {
          const loadedEdges = res.edges.map((e: any) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            label: e.label ?? '',
            sourceHandle: e.data?.sourceHandle ?? undefined,
            targetHandle: e.data?.targetHandle ?? undefined,
          }));
          setEdges(loadedEdges);
        }
      } catch (err) {
        // ignore - keep initial demo nodes
        // console.error('loadFlowFromServer', err);
      }
      // после первой попытки загрузки разрешаем автосохранение
      setIsInitialized(true);
    })();
    return () => {
      mounted = false;
    };
  }, [setEdges, setNodes]);

  // on mount, read saved current user
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('kredo_current_user') : null;
    if (saved) setCurrentUserId(saved);
    // always show selector on entry (preselect saved user if present)
    setShowSelector(true);
  }, []);

  // when current user or nodes set changes, mark nodes and вычислить титулы относительно выбранного пользователя
  useEffect(() => {
    setNodes((nds) => {
      // находим выбранного пользователя и его JSON-родство
      const current = currentUserId ? nds.find((n) => n.id === currentUserId) : null;
      const kinships = (current?.data as any)?.kinships ?? [];

      return nds.map((n) => {
        const d: any = n.data ?? {};
        const originalTitle = d.originalTitle ?? d.title ?? '';

        let titleForDisplay = originalTitle;
        if (current && n.id !== currentUserId && Array.isArray(kinships)) {
          const rel = kinships.find((k: any) => String(k.id) === String(n.id));
          if (rel?.title || rel?.titul) {
            titleForDisplay = rel.title ?? rel.titul;
          }
        }

        return {
          ...n,
          data: {
            ...d,
            originalTitle,
            title: titleForDisplay,
            isCurrentUser: n.id === currentUserId,
          },
        };
      });
    });
  }, [currentUserId, setNodes, nodes.length]);

  // автосохранение позиций и соединений в Supabase при изменении nodes/edges
  useEffect(() => {
    if (!isInitialized) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      (async () => {
        try {
          const api = await import('../lib/apiClient');
          const nodesForSave = nodes.map((n) => {
            const d: any = n.data ?? {};
            return {
              id: n.id,
              name: d.name ?? null,
              title: d.originalTitle ?? d.title ?? null,
              birth: d.birth ?? null,
              death: d.death ?? null,
              photoUrl: d.photoUrl ?? null,
              position: n.position,
              information: d.information ?? null,
              kinships: d.kinships ?? null,
              data: d,
            };
          });
          const edgesForSave = edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            label: e.label ?? null,
            data: {
              ...(e.data ?? {}),
              sourceHandle: e.sourceHandle ?? null,
              targetHandle: e.targetHandle ?? null,
            },
          }));
          await api.saveFlowToServer(nodesForSave, edgesForSave);
        } catch {
          // тихо игнорируем ошибки автосохранения
        }
      })();
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, edges, isInitialized]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const id = `e${connection.source}-${connection.target}-${Date.now()}`;
      const newEdge: Edge = {
        id,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
        animated: false,
        label: '',
      };
      setEdges((eds) => eds.concat(newEdge));
    },
    [setEdges],
  );

  const onEdgeClick = useCallback((_: any, edge: Edge) => {
    setSelectedEdge(edge);
  }, []);

  const onEdgeChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, [setEdges]);

  const onNodeChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, [setNodes]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setViewNode(node);
  }, []);

  const createPerson = useCallback(async () => {
    // create on server and add to local nodes
    const payload = { name: 'Новый человек', birth: '—' };
    const res = await (await import('../lib/apiClient')).createPersonOnServer(payload);
    if (res?.person) {
      const person = res.person;
      const node: Node = {
        id: person.id,
        type: 'person',
        position: person.position ? JSON.parse(person.position) : { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
        data: {
          name: person.name ?? 'Новый человек',
          birth: person.birth ?? '—',
          originalTitle: person.title ?? '',
          title: person.title ?? '',
          photoUrl: person.photo_url ?? null,
          information: person.data?.information ?? null,
          kinships: person.kinships ?? null,
        },
      };
      setNodes((nds) => nds.concat(node));
    }
  }, [setNodes]);

  const deletePerson = useCallback(async (id: string) => {
    const res = await (await import('../lib/apiClient')).deletePersonOnServer(id);
    if (res?.ok) {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    }
  }, [setNodes, setEdges]);

  const addPerson = createPerson;

  const exportJSON = useCallback(() => {
    const payload = { nodes, edges };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'family-flow.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const toggleSidebar = useCallback(() => setSidebarOpen((s) => !s), []);
  return (
    <div className="h-screen w-full flex">
      {showSelector && (
        <React.Suspense fallback={null}>
          {/* eslint-disable-next-line react/jsx-no-undef */}
          {React.createElement(require('./UserSelector').default, { initialSelected: currentUserId, onSelect: (id: string) => { setCurrentUserId(id || null); setShowSelector(false); } })}
        </React.Suspense>
      )}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onAddPerson={addPerson} onExport={exportJSON} onChangeUser={() => setShowSelector(true)} />
      <div className="relative flex-1">
        <div className="absolute left-4 top-4 z-40 sm:hidden">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="rounded-md bg-white/90 p-2 shadow-md dark:bg-[#0b0b0b]/90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900 dark:text-zinc-50"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
        </div>

        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodeChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            className="bg-[length:30px_30px]"
            panOnDrag
            panOnScroll
            zoomOnPinch
            zoomOnScroll={false}
            style={{ touchAction: 'none' }}
          >
            <Background gap={16} size={1} />

            {/* ИЗМЕНЕНИЕ ЗДЕСЬ: добавляем класс скрытия для мобильных */}
            <MiniMap className="!hidden sm:!block" />

            <Controls />
          </ReactFlow>
        </ReactFlowProvider>

        {/* View-only modal opens on node click; edit opens from the view modal */}
        {viewNode && (
          <PersonViewModal
            node={viewNode}
            onClose={() => setViewNode(null)}
            onEdit={(data) => {
              setEditNode({ ...viewNode, data });
              setViewNode(null);
            }}
          />
        )}

        {editNode && (
          <PersonModal
            node={editNode}
            onClose={() => setEditNode(null)}
            onSave={async (id: string, data: any) => {
              const res = await (await import('../lib/apiClient')).updatePersonOnServer(id, data);
              if (res?.person) {
                setNodes((nds) => {
                  const updated = nds.map((n) =>
                    n.id === id
                      ? {
                        ...n,
                        data: {
                          ...n.data,
                          ...data,
                        },
                      }
                      : n,
                  );

                  // если мы редактировали выбранного пользователя, пересчитываем титулы сразу
                  const current = currentUserId ? updated.find((n) => n.id === currentUserId) : null;
                  const kinships = (current?.data as any)?.kinships ?? [];

                  if (!current || !Array.isArray(kinships)) return updated;

                  return updated.map((n) => {
                    const d: any = n.data ?? {};
                    const originalTitle = d.originalTitle ?? d.title ?? '';

                    let titleForDisplay = originalTitle;
                    if (n.id !== currentUserId) {
                      const rel = kinships.find((k: any) => String(k.id) === String(n.id));
                      if (rel?.title || rel?.titul) {
                        titleForDisplay = rel.title ?? rel.titul;
                      }
                    }

                    return {
                      ...n,
                      data: {
                        ...d,
                        originalTitle,
                        title: titleForDisplay,
                        isCurrentUser: n.id === currentUserId,
                      },
                    };
                  });
                });
              }
              setEditNode(null);
            }}
            onDelete={async (id: string) => {
              await deletePerson(id);
              setEditNode(null);
            }}
          />
        )}

        <EdgeModal
          edge={selectedEdge}
          onClose={() => setSelectedEdge(null)}
          onSave={(id, label) => {
            setEdges((eds) => eds.map((e) => (e.id === id ? { ...e, label } : e)));
          }}
          onDelete={async (id) => {
            try {
              const api = await import('../lib/apiClient');
              await api.deleteRelationOnServer(id);
            } catch {
              // ignore error, локальное удаление всё равно произойдёт
            }
            setEdges((eds) => eds.filter((e) => e.id !== id));
            setSelectedEdge(null);
          }}
        />
      </div>
    </div>
  );
}
