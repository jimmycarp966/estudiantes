'use client';

import React, { useCallback, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  addEdge, 
  Connection, 
  Edge, 
  Node, 
  ReactFlowProvider,
  Panel,
  useNodesState,
  useEdgesState,
  OnConnect
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { schemeService } from '@/lib/schemeService';
import type { SchemeNode, SchemeEdge, UserScheme, SchemeTemplate } from '@/types/schemes';

interface SchemeEditorProps {
  initialScheme?: UserScheme;
  template?: SchemeTemplate;
  onSave?: (scheme: UserScheme) => void;
  onClose?: () => void;
}

interface EditNodePanelProps {
  selectedNode: Node;
  onUpdate: (nodeId: string, updates: Partial<SchemeNode>) => void;
  onClose: () => void;
}

function EditNodePanel({ selectedNode, onUpdate, onClose }: EditNodePanelProps) {
  const [label, setLabel] = useState(selectedNode?.data?.label || '');
  const [color, setColor] = useState(selectedNode?.data?.color || '#000000');
  const [backgroundColor, setBackgroundColor] = useState(selectedNode?.data?.backgroundColor || '#ffffff');
  const [fontSize, setFontSize] = useState(selectedNode?.data?.fontSize || 14);

  const handleSave = () => {
    onUpdate(selectedNode.id, {
      data: {
        ...selectedNode.data,
        label,
        color,
        backgroundColor,
        fontSize
      }
    });
    onClose();
  };

  return (
    <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 w-80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Editar Nodo</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Texto</label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Texto del nodo"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color del texto</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded border"
            />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#000000"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color de fondo</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-10 h-10 rounded border"
            />
            <Input
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              placeholder="#ffffff"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño de fuente</label>
          <Input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            min="8"
            max="32"
          />
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <Button onClick={handleSave} size="sm">Guardar</Button>
        <Button variant="outline" onClick={onClose} size="sm">Cancelar</Button>
      </div>
    </div>
  );
}

export function SchemeEditor({ initialScheme, template, onSave, onClose }: SchemeEditorProps) {
  const { user } = useAuth();
  const [schemeName, setSchemeName] = useState(initialScheme?.name || 'Mi Esquema');
  const [schemeDescription, setSchemeDescription] = useState(initialScheme?.description || '');
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  // Inicializar nodos y edges
  const initialNodes: Node[] = initialScheme?.nodes || template?.nodes || [
    { 
      id: '1', 
      type: 'input',
      position: { x: 250, y: 100 }, 
      data: { 
        label: 'Tema Principal',
        backgroundColor: '#2563eb',
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
      },
      style: { 
        background: '#2563eb', 
        color: 'white', 
        border: '2px solid #1d4ed8',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '16px',
        fontWeight: 'bold'
      }
    }
  ];

  const initialEdges: Edge[] = initialScheme?.edges || template?.edges || [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect: OnConnect = useCallback((params: Edge | Connection) => {
    setEdges((eds) => addEdge({
      ...params,
      style: { stroke: '#2563eb', strokeWidth: 2 },
      type: 'smoothstep'
    }, eds));
  }, [setEdges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowEditPanel(true);
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<SchemeNode>) => {
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            ...updates,
            style: {
              ...node.style,
              background: updates.data?.backgroundColor || node.data?.backgroundColor,
              color: updates.data?.color || node.data?.color,
              fontSize: `${updates.data?.fontSize || node.data?.fontSize || 14}px`,
              fontWeight: updates.data?.fontWeight || node.data?.fontWeight
            }
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const addNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label: 'Nuevo Nodo',
        backgroundColor: '#3b82f6',
        color: 'white',
        fontSize: 14
      },
      style: { 
        background: '#3b82f6', 
        color: 'white', 
        border: '2px solid #2563eb',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '14px'
      }
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter((edge) => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      setSelectedNode(null);
      setShowEditPanel(false);
    }
  }, [selectedNode, setNodes, setEdges]);

  const clearScheme = useCallback(() => {
    if (confirm('¿Estás seguro de que quieres limpiar el esquema? Esta acción no se puede deshacer.')) {
      setNodes([{
        id: '1',
        type: 'input',
        position: { x: 250, y: 100 },
        data: { 
          label: 'Nuevo Tema',
          backgroundColor: '#2563eb',
          color: 'white',
          fontSize: 16,
          fontWeight: 'bold'
        },
        style: { 
          background: '#2563eb', 
          color: 'white', 
          border: '2px solid #1d4ed8',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      }]);
      setEdges([]);
    }
  }, [setNodes, setEdges]);

  const saveScheme = async () => {
    if (!user?.uid) {
      setError('Debes estar autenticado para guardar esquemas');
      return;
    }

    if (!schemeName.trim()) {
      setError('El nombre del esquema es obligatorio');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const schemeData: Omit<UserScheme, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.uid,
        name: schemeName.trim(),
        description: schemeDescription.trim(),
        nodes: nodes as SchemeNode[],
        edges: edges as SchemeEdge[],
        templateId: template?.id,
        tags: [],
        isPublic: false
      };

      if (initialScheme?.id) {
        // Actualizar esquema existente
        await schemeService.updateScheme(initialScheme.id, schemeData);
        onSave?.({ ...initialScheme, ...schemeData });
      } else {
        // Crear nuevo esquema
        const schemeId = await schemeService.saveScheme(schemeData);
        const newScheme: UserScheme = {
          id: schemeId,
          ...schemeData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        onSave?.(newScheme);
      }

      alert('Esquema guardado exitosamente');
    } catch (error) {
      console.error('Error saving scheme:', error);
      setError('Error al guardar el esquema');
    } finally {
      setSaving(false);
    }
  };

  const exportScheme = async () => {
    try {
      // Implementación básica de exportación
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 1200;
      canvas.height = 800;
      
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar título
        ctx.fillStyle = 'black';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(schemeName, 50, 50);
        
        // Dibujar nodos (simplificado)
        nodes.forEach((node) => {
          ctx.fillStyle = node.data?.backgroundColor || '#3b82f6';
          ctx.fillRect(node.position.x + 50, node.position.y + 100, 150, 60);
          
          ctx.fillStyle = node.data?.color || 'white';
          ctx.font = `${node.data?.fontSize || 14}px Arial`;
          ctx.fillText(node.data?.label || '', node.position.x + 60, node.position.y + 140);
        });
        
        // Descargar imagen
        const link = document.createElement('a');
        link.download = `${schemeName}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch (error) {
      console.error('Error exporting scheme:', error);
      alert('Error al exportar el esquema');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <Input
              value={schemeName}
              onChange={(e) => setSchemeName(e.target.value)}
              placeholder="Nombre del esquema"
              className="text-lg font-semibold"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={clearScheme}
              size="sm"
            >
              Limpiar
            </Button>
            <Button
              variant="outline"
              onClick={exportScheme}
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button
              onClick={saveScheme}
              disabled={saving}
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
            {onClose && (
              <Button
                variant="outline"
                onClick={onClose}
                size="sm"
              >
                Cerrar
              </Button>
            )}
          </div>
        </div>
        
        <Input
          value={schemeDescription}
          onChange={(e) => setSchemeDescription(e.target.value)}
          placeholder="Descripción del esquema (opcional)"
          className="text-sm"
        />
        
        {error && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            attributionPosition="bottom-left"
          >
            <Background />
            <Controls />
            <MiniMap />
            
            {/* Toolbar */}
            <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-2">
              <div className="flex gap-2">
                <Button
                  onClick={addNode}
                  size="sm"
                  title="Agregar nodo"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                {selectedNode && (
                  <>
                    <Button
                      onClick={() => setShowEditPanel(true)}
                      size="sm"
                      title="Editar nodo"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={deleteSelectedNode}
                      size="sm"
                      variant="outline"
                      title="Eliminar nodo"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </Panel>

            {/* Instructions */}
            <Panel position="bottom-left" className="bg-white rounded-lg shadow-lg p-3 max-w-xs">
              <div className="text-xs text-gray-600">
                <p className="font-semibold mb-1">Instrucciones:</p>
                <ul className="space-y-1">
                  <li>• Haz clic en un nodo para editarlo</li>
                  <li>• Arrastra nodos para moverlos</li>
                  <li>• Conecta nodos arrastrando desde un punto</li>
                  <li>• Usa los controles para zoom y navegación</li>
                </ul>
              </div>
            </Panel>
          </ReactFlow>
        </ReactFlowProvider>

        {/* Edit Panel */}
        {showEditPanel && selectedNode && (
          <EditNodePanel
            selectedNode={selectedNode}
            onUpdate={updateNode}
            onClose={() => {
              setShowEditPanel(false);
              setSelectedNode(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
