import React, { useState, useMemo, useRef } from 'react';
import GraphVisualization from './Visualization.tsx';
import FloatingSourceViewer from './FloatingSourceViewer.tsx';
import type { KnowledgeGraph } from '../../../core/graph/types.ts';

interface GraphExplorerProps {
  graph: KnowledgeGraph | null;
  isLoading: boolean;
  onNodeSelect?: (nodeId: string | null) => void;
  fileContents?: Map<string, string>;
}

export default function GraphExplorer({ graph, isLoading, onNodeSelect, fileContents }: GraphExplorerProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [floatingViewerOpen, setFloatingViewerOpen] = useState(false);
  const [floatingViewerPosition, setFloatingViewerPosition] = useState({ x: 0, y: 0 });
  const [floatingViewerPinned, setFloatingViewerPinned] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNodeSelect = (nodeId: string | null, event?: MouseEvent) => {
    setSelectedNode(nodeId);
    onNodeSelect?.(nodeId);
    
    if (nodeId && event) {
      // Calculate position for floating viewer
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Adjust position to keep viewer within bounds
        const adjustedX = Math.min(x, window.innerWidth - 520); // 500px width + 20px margin
        const adjustedY = Math.min(y, window.innerHeight - 420); // 400px height + 20px margin
        
        setFloatingViewerPosition({ x: adjustedX, y: adjustedY });
        setFloatingViewerOpen(true);
      }
    } else if (!nodeId) {
      // Close floating viewer when deselecting (unless pinned)
      if (!floatingViewerPinned) {
        setFloatingViewerOpen(false);
      }
    }
  };


  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };


  const loadingStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    fontSize: '16px',
    color: '#666'
  };

  const graphContainerStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'hidden'
  };

  if (isLoading) {
    return <div style={containerStyle}><div style={loadingStyle}>Loading graph...</div></div>;
  }

  if (!graph) {
    return <div style={containerStyle}><div style={loadingStyle}>No graph data available</div></div>;
  }


  return (
    <div style={containerStyle} ref={containerRef}>
      <div style={graphContainerStyle}>
        <GraphVisualization 
          graph={graph}
          onNodeSelect={handleNodeSelect}
          selectedNodeId={selectedNode}
        />
      </div>

      {/* Floating Source Viewer */}
      {graph && fileContents && (
        <FloatingSourceViewer
          isOpen={floatingViewerOpen}
          position={floatingViewerPosition}
          nodeId={selectedNode}
          graph={graph}
          fileContents={fileContents}
          onClose={() => setFloatingViewerOpen(false)}
          onPin={setFloatingViewerPinned}
          isPinned={floatingViewerPinned}
        />
      )}
    </div>
  );
} 
