'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import React, { useCallback, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  addEdge, 
  Connection, 
  Edge, 
  Node, 
  NodeChange, 
  EdgeChange,
  ReactFlowProvider,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, Plus, Trash2, Edit3, X } from 'lucide-react';

// Componente para editar nodos
interface EditNodePanelProps {
  selectedNode: Node;
  onUpdate: (nodeId: string, newLabel: string) => void;
  onClose: () => void;
}

function EditNodePanel({ selectedNode, onUpdate, onClose }: EditNodePanelProps) {
  const [label, setLabel] = useState(selectedNode?.data?.label || '');

  const handleSave = () => {
    onUpdate(selectedNode.id, label);
    onClose();
  };

  return (
    <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Editar Nodo</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      <Input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Texto del nodo"
        className="mb-3"
      />
      <div className="flex gap-2">
        <Button onClick={handleSave} size="sm">Guardar</Button>
        <Button variant="outline" onClick={onClose} size="sm">Cancelar</Button>
      </div>
    </div>
  );
}

function FlowEditor() {
  const [nodes, setNodes] = useState<Node[]>([
    { 
      id: '1', 
      position: { x: 250, y: 100 }, 
      data: { label: 'Tema Principal' }, 
      type: 'input',
      style: { 
        background: '#2563eb', 
        color: 'white', 
        border: '2px solid #1d4ed8',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '14px',
        fontWeight: 'bold'
      }
    }
  ]);
  const [error, setError] = useState<string>('');
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [schemeName, setSchemeName] = useState('Mi Esquema');

  const onConnect = useCallback((params: Edge | Connection) => {
    setEdges((eds) => addEdge({
      ...params,
      style: { stroke: '#2563eb', strokeWidth: 2 },
      type: 'smoothstep'
    }, eds));
  }, []);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => {
      const updatedNodes = [...nds];
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          const node = updatedNodes.find((n) => n.id === change.id);
          if (node) {
            node.position = change.position;
          }
        }
        if (change.type === 'select') {
          const node = updatedNodes.find((n) => n.id === change.id);
          if (node && change.selected) {
            setSelectedNode(node);
          } else if (!change.selected) {
            setSelectedNode(null);
          }
        }
      });
      return updatedNodes;
    });
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => {
      const updatedEdges = [...eds];
      changes.forEach((change) => {
        if (change.type === 'remove') {
          const index = updatedEdges.findIndex((e) => e.id === change.id);
          if (index !== -1) {
            updatedEdges.splice(index, 1);
          }
        }
      });
      return updatedEdges;
    });
  }, []);

  const addNode = useCallback(() => {
    const newNodeId = (nodes.length + 1).toString();
    const newNode: Node = {
      id: newNodeId,
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      data: { label: `Nodo ${newNodeId}` },
      style: { 
        background: '#f3f4f6', 
        color: '#374151',
        border: '2px solid #d1d5db',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '13px'
      }
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes.length]);

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
    }
  }, [selectedNode]);

  const updateNodeLabel = useCallback((nodeId: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, label: newLabel } } : node
      )
    );
  }, []);

  const saveScheme = async () => {
    const payload = { 
      name: schemeName,
      nodes, 
      edges, 
      updatedAt: new Date().toISOString() 
    };
    try {
      localStorage.setItem('scheme-latest', JSON.stringify(payload));
      alert(`Esquema "${schemeName}" guardado exitosamente`);
    } catch (e) {
      console.error(e);
      alert('Error al guardar el esquema');
    }
  };

  const loadScheme = () => {
    try {
      const saved = localStorage.getItem('scheme-latest');
      if (saved) {
        const data = JSON.parse(saved);
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        setSchemeName(data.name || 'Mi Esquema');
        alert('Esquema cargado exitosamente');
      } else {
        alert('No hay esquemas guardados');
      }
    } catch (e) {
      console.error(e);
      alert('Error al cargar el esquema');
    }
  };

  const clearScheme = () => {
    if (confirm('¿Estás seguro de que quieres limpiar el esquema actual?')) {
      setNodes([{ 
        id: '1', 
        position: { x: 250, y: 100 }, 
        data: { label: 'Tema Principal' }, 
        type: 'input',
        style: { 
          background: '#2563eb', 
          color: 'white', 
          border: '2px solid #1d4ed8',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '14px',
          fontWeight: 'bold'
        }
      }]);
      setEdges([]);
      setSchemeName('Mi Esquema');
    }
  };

  return (
    <div className="h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        deleteKeyCode="Delete"
        onError={(error) => {
          console.error('ReactFlow error:', error);
          setError(`Error en ReactFlow: ${error.message}`);
        }}
      >
        <Background />
        <Controls />
        <MiniMap />
        
        <Panel position="top-left" className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
          <div className="space-y-2">
            <Input
              value={schemeName}
              onChange={(e) => setSchemeName(e.target.value)}
              placeholder="Nombre del esquema"
              className="w-48"
            />
            <div className="flex gap-1">
              <Button onClick={addNode} size="sm">
                <Plus className="h-3 w-3 mr-1" />
                Nodo
              </Button>
              {selectedNode && (
                <>
                  <Button onClick={() => setShowEditPanel(true)} size="sm" variant="outline">
                    <Edit3 className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button onClick={deleteSelectedNode} size="sm" variant="outline">
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar
                  </Button>
                </>
              )}
            </div>
          </div>
        </Panel>

        <Panel position="top-right" className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
          <div className="flex gap-2">
            <Button onClick={saveScheme} size="sm">
              <Save className="h-3 w-3 mr-1" />
              Guardar
            </Button>
            <Button onClick={loadScheme} size="sm" variant="outline">
              Cargar
            </Button>
            <Button onClick={clearScheme} size="sm" variant="outline">
              Limpiar
            </Button>
          </div>
        </Panel>

        {showEditPanel && selectedNode && (
          <EditNodePanel
            selectedNode={selectedNode}
            onUpdate={updateNodeLabel}
            onClose={() => setShowEditPanel(false)}
          />
        )}
        
        {error && (
          <div className="absolute top-4 left-4 bg-red-50 border border-red-200 rounded-lg p-4 z-20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error en el editor</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="bg-red-50 px-2 py-1 text-sm font-medium text-red-800 rounded-md hover:bg-red-100"
                    onClick={() => setError('')}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </ReactFlow>
    </div>
  );
}

export default function SchemesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Esquemas de Estudio</h1>
            <p className="text-gray-600">Crea mapas mentales y diagramas para organizar tus ideas</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm" style={{ height: 700 }}>
          <ReactFlowProvider>
            <FlowEditor />
          </ReactFlowProvider>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">¿Cómo usar el editor?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
                         <li>• <strong>Agregar nodos:</strong> Haz clic en &quot;Nodo&quot; para crear nuevos elementos</li>
             <li>• <strong>Conectar nodos:</strong> Arrastra desde un punto azul a otro nodo</li>
             <li>• <strong>Mover nodos:</strong> Arrastra los nodos para reposicionarlos</li>
             <li>• <strong>Editar texto:</strong> Selecciona un nodo y haz clic en &quot;Editar&quot;</li>
             <li>• <strong>Eliminar:</strong> Selecciona un nodo y haz clic en &quot;Eliminar&quot; o presiona Delete</li>
             <li>• <strong>Guardar:</strong> Tu esquema se guarda automáticamente en el navegador</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}



