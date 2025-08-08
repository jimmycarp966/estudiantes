export interface SchemeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'mindmap' | 'flowchart' | 'comparison' | 'timeline';
  nodes: SchemeNode[];
  edges: SchemeEdge[];
  thumbnail?: string;
}

export interface SchemeNode {
  id: string;
  type: 'input' | 'default' | 'output';
  position: { x: number; y: number };
  data: {
    label: string;
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontWeight?: string;
  };
  style?: React.CSSProperties;
}

export interface SchemeEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  style?: React.CSSProperties;
  label?: string;
}

export interface UserScheme {
  id: string;
  userId: string;
  name: string;
  description?: string;
  templateId?: string;
  nodes: SchemeNode[];
  edges: SchemeEdge[];
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  isPublic?: boolean;
}

export interface SchemeEditorState {
  nodes: SchemeNode[];
  edges: SchemeEdge[];
  selectedNode: SchemeNode | null;
  schemeName: string;
  schemeDescription: string;
  isEditing: boolean;
  zoom: number;
  pan: { x: number; y: number };
}
