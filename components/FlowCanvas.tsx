"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
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
  useReactFlow
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

function ZoomController({ trigger }: { trigger: any }) {
  const { fitView, setViewport, getViewport } = useReactFlow();

  useEffect(() => {
    const run = async () => {
      fitView({ padding: 0.2 });

      setTimeout(() => {
        const vp = getViewport();

        setViewport({
          x: vp.x,
          y: vp.y,
          zoom: 0.1
        });
      }, 60);
    };

    run();
  }, [trigger, fitView, setViewport, getViewport]);

  return null;
}

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

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const api = await import('../lib/apiClient');
        const res = await api.loadFlowFromServer();

        if (!mounted || !res) return;

        if (res.nodes) {
          const loadedNodes = res.nodes.map((p: any) => ({
            id: p.id,
            type: 'person',
            position: p.position
              ? JSON.parse(p.position)
              : { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
            data: {
              name: p.name ?? '',
              birth: p.birth ?? '',
              originalTitle: p.title ?? '',
              title: p.title ?? '',
              photoUrl: p.photo_url ?? null,
              information: p.data?.information ?? null,
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
      } catch {}

      setIsInitialized(true);
    })();

    return () => {
      mounted = false;
    };
  }, [setEdges, setNodes]);

  useEffect(() => {
    const saved = typeof window !== 'undefined'
      ? localStorage.getItem('kredo_current_user')
      : null;

    if (saved) setCurrentUserId(saved);

    setShowSelector(true);
  }, []);

  useEffect(() => {
    setNodes((nds) => {

      const current = currentUserId
        ? nds.find((n) => n.id === currentUserId)
        : null;

      const kinships = (current?.data as any)?.kinships ?? [];

      return nds.map((n) => {

        const d: any = n.data ?? {};
        const originalTitle = d.originalTitle ?? d.title ?? '';

        let titleForDisplay = originalTitle;

        if (current && n.id !== currentUserId && Array.isArray(kinships)) {

          const rel = kinships.find(
            (k: any) => String(k.id) === String(n.id)
          );

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

        } catch {}

      })();

    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };

  }, [nodes, edges, isInitialized]);

  const onConnect = useCallback((connection: Connection) => {

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

  }, [setEdges]);

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

  const toggleSidebar = useCallback(() => setSidebarOpen((s) => !s), []);

  return (
    <div className="h-screen w-full flex">

      {showSelector && (
        <React.Suspense fallback={null}>
          {React.createElement(require('./UserSelector').default, {
            initialSelected: currentUserId,
            onSelect: (id: string) => {
              setCurrentUserId(id || null);
              setShowSelector(false);
            }
          })}
        </React.Suspense>
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onAddPerson={() => {}}
        onExport={() => {}}
        onChangeUser={() => setShowSelector(true)}
      />

      <div className="relative flex-1">

        <ReactFlowProvider>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodeChange}
            onEdgesChange={onEdgeChange}
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={4}
            fitViewOptions={{ padding: 0.2 }}
            panOnDrag
            panOnScroll
            zoomOnPinch
            zoomOnScroll={false}
            style={{ touchAction: 'none' }}
          >

            <ZoomController trigger={`${currentUserId}-${nodes.length}`} />

            <Background gap={16} size={1} />
            <MiniMap className="!hidden sm:!block" />
            <Controls />

          </ReactFlow>

        </ReactFlowProvider>

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
            onSave={() => {}}
            onDelete={() => {}}
          />
        )}

        <EdgeModal
          edge={selectedEdge}
          onClose={() => setSelectedEdge(null)}
          onSave={() => {}}
          onDelete={() => {}}
        />

      </div>
    </div>
  );
}