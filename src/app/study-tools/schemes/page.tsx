'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import React, { useCallback, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap, addEdge, Connection, Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/Button';
import { Save, Plus, Download } from 'lucide-react';

export default function SchemesPage() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', position: { x: 0, y: 0 }, data: { label: 'Tema central' }, type: 'input' },
    { id: '2', position: { x: -150, y: 150 }, data: { label: 'Rama 1' } },
    { id: '3', position: { x: 150, y: 150 }, data: { label: 'Rama 2' } },
  ]);
  const [edges, setEdges] = useState<Edge[]>([{ id: 'e1-2', source: '1', target: '2' }, { id: 'e1-3', source: '1', target: '3' }]);

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), []);

  const addNode = () => {
    const id = (nodes.length + 1).toString();
    setNodes(prev => [...prev, { id, position: { x: 100, y: 100 }, data: { label: `Nodo ${id}` } }]);
  };

  const saveScheme = async () => {
    const payload = { nodes, edges, updatedAt: new Date().toISOString() };
    try {
      localStorage.setItem('scheme-latest', JSON.stringify(payload));
      alert('Esquema guardado localmente (MVP)');
    } catch (e) {
      console.error(e);
    }
  };

  const exportPng = async () => {
    // MVP: export simple mensaje; una implementación completa requiere html-to-image o similar
    alert('Exportación PNG/PDF se puede añadir con html-to-image/canvas en la siguiente iteración.');
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Esquemas</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={addNode}><Plus className="h-4 w-4 mr-1" /> Nodo</Button>
            <Button variant="outline" onClick={exportPng}><Download className="h-4 w-4 mr-1" /> Exportar</Button>
            <Button onClick={saveScheme}><Save className="h-4 w-4 mr-1" /> Guardar</Button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm" style={{ height: 600 }}>
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={setNodes} onEdgesChange={setEdges} onConnect={onConnect} fitView>
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      </div>
    </DashboardLayout>
  );
}


