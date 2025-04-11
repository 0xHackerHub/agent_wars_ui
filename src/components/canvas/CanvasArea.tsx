import React, { useCallback, useRef, useState, useMemo, useEffect } from "react"; // Added useEffect for logging
import {
  ReactFlow,
  useReactFlow,
  addEdge,
  Connection,
  Edge,
  Node,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAgentwflowState, NodeTypeInfo } from "@/hooks/useAgentwflowState";
import { nanoid } from 'nanoid';

// Import ALL potential custom node components (ensure paths are correct)
import { ChatOpenAINode } from './node/ChatOpenAINode';
import { WorkerNode } from './node/WorkerNode';
import { SupervisorNode } from './node/SupervisorNode';
import { NodeInfoModal } from './NodeInfoModal';
import { CustomNodeBase } from "./node/CustomNodeBase"; // Base might be needed for placeholders

// --- Placeholder Components (REMOVE THESE ONCE YOU HAVE ACTUAL IMPLEMENTATIONS) ---
const PlaceholderNodeComponent = (props: NodeProps) => (
  <CustomNodeBase {...props} nodeTypeIdentifier={props.type ?? 'unknown'} onInfoClick={() => console.log(`Info for ${props.type} ${props.id}`)}>
    {(() => (
      <div className="p-2 text-center text-xs text-neutral-400 italic">
        Node Type: <br /> <span className="font-bold text-neutral-300">{props.data.label as string || props.type}</span> <br />(Implementation Pending)
      </div>
    ))()}
  </CustomNodeBase>
);

// Assign placeholders - REPLACE with actual imports when ready
const ChatAnthropicNode = PlaceholderNodeComponent;
const OpenaiModerationNode = PlaceholderNodeComponent;
const PdfLoaderNode = PlaceholderNodeComponent;
const CsvLoaderNode = PlaceholderNodeComponent;
const OpenaiEmbeddingsNode = PlaceholderNodeComponent;
const KnowledgeGraphNode = PlaceholderNodeComponent;
const Gpt4Node = PlaceholderNodeComponent;
const BufferMemoryNode = PlaceholderNodeComponent;
const RetrievalChainNode = PlaceholderNodeComponent;
// --- End Placeholder Components ---


const getId = () => `dndnode_${nanoid()}`;

export function CanvasArea({ canvasId }: { canvasId: string }) {
  const nodes = useAgentwflowState((state) => state.nodes);
 const edges = useAgentwflowState((state) => state.edges);
 const setNodes = useAgentwflowState((state) => state.setNodes);
 const setEdges = useAgentwflowState((state) => state.setEdges);
 const setActiveNodeId = useAgentwflowState((state) => state.setActiveNodeId);
 const addNode = useAgentwflowState((state) => state.addNode);
 const getNodeTypeInfo = useAgentwflowState((state) => state.getNodeTypeInfo);
 const nodeTypeRegistry = useAgentwflowState((state) => state.nodeTypeRegistry);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalNodeType, setInfoModalNodeType] = useState<NodeTypeInfo | undefined>(undefined);

  const handleInfoClick = useCallback((typeId: string) => {
      const nodeType = getNodeTypeInfo(typeId);
      if (nodeType) {
          setInfoModalNodeType(nodeType);
          setIsInfoModalOpen(true);
      } else {
          console.warn(`[CanvasArea] Node type info not found for ID: ${typeId}`);
      }
  }, [getNodeTypeInfo]);

  // Define custom node types mapping
  const nodeTypes: NodeTypes = useMemo(() => {
      // Factory function (assuming CustomNodeBase handles onInfoClick or specific nodes do)
      const createNodeComponent = (Component: React.ComponentType<NodeProps<any>>, _typeId: string) =>
          (props: NodeProps<any>) => <Component {...props} />;

      // --- CRITICAL: Ensure keys match NodeTypeInfo.type property EXACTLY ---
      const typesMap: NodeTypes = {
          'chat_model': ChatOpenAINode as any,
          'worker': WorkerNode as any,
          'supervisor': SupervisorNode as any,
          'moderation': OpenaiModerationNode as any,
          'document_loader': PdfLoaderNode as any,
          'embedding': OpenaiEmbeddingsNode as any,
          'graph': KnowledgeGraphNode as any,
          'llm': Gpt4Node as any,
          'memory': BufferMemoryNode as any,
          'chain': RetrievalChainNode as any,
      };
      console.log('[CanvasArea] Registered Node Types Map:', typesMap); // Log the generated map
      return typesMap;
  }, [/* Dependencies, potentially empty if handleInfoClick isn't passed down */]);

  // --- Log available node types from the registry for comparison ---
  useEffect(() => {
      if (nodeTypeRegistry) {
          console.log('[CanvasArea] Available NodeTypeInfo (type property is key for nodeTypes map):', Array.from(nodeTypeRegistry.values()));
      }
  }, [nodeTypeRegistry]);
  // --- End Logging ---

  // Callbacks (onNodesChange, onEdgesChange, onConnect, onNodeClick, onPaneClick) remain the same
  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
  const onConnect = useCallback((params: Connection) => {
      const newEdge = { ...params, animated: true, style: { stroke: '#a1a1aa', strokeWidth: 1.5 } };
      setEdges((eds) => addEdge(newEdge, eds));
    }, [setEdges]);
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => setActiveNodeId(node.id), [setActiveNodeId]);
  const onPaneClick = useCallback(() => setActiveNodeId(null), [setActiveNodeId]);

  // Drag Over Handler
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault(); // Necessary to allow dropping
    event.dataTransfer.dropEffect = "move";
    // console.log('[CanvasArea] Drag Over'); // Uncomment for frequent logging
  }, []);

  // Drop Handler - Added extensive logging
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      console.log('[CanvasArea] onDrop event triggered');
      event.preventDefault();

      if (!reactFlowWrapper.current) {
          console.error("[CanvasArea] ReactFlow wrapper ref not available for drop.");
          return;
      };

      // 1. Get data from drag event
      const typeId = event.dataTransfer.getData('application/reactflow-typeid');
      const nodeTypeInfoStr = event.dataTransfer.getData('application/json');
      console.log(`[CanvasArea] Dropped data - typeId: ${typeId}, nodeTypeInfoStr: ${nodeTypeInfoStr}`);

      if (!typeId || !nodeTypeInfoStr) {
          console.error("[CanvasArea] Missing typeId or nodeTypeInfoStr in drop event data.");
          return;
      }

      // 2. Parse Node Type Info
      let nodeTypeInfo: NodeTypeInfo;
      try {
          nodeTypeInfo = JSON.parse(nodeTypeInfoStr);
          console.log('[CanvasArea] Parsed nodeTypeInfo:', nodeTypeInfo);
      } catch (e) {
           console.error("[CanvasArea] Failed to parse nodeTypeInfo JSON:", e);
           return;
      }

       // --- *** THE MOST IMPORTANT CHECK *** ---
       // Does the technical type from the dropped data exist as a key in our registered nodeTypes map?
       const technicalNodeType = nodeTypeInfo.type;
       console.log(`[CanvasArea] Technical node type from drop: ${technicalNodeType}`);
       // We log the registered types map in the useMemo hook above. Check if technicalNodeType is a key there.
       // If not, the node component cannot be found, and it won't render.
       // Example: If you drop 'ChatOpenAI', nodeTypeInfo.type might be 'chat_model'. Ensure 'chat_model' is a key in the `nodeTypes` map.
       // Or, if nodeTypeInfo.type is 'chatopenai', ensure 'chatopenai' is a key in the map.
       // The keys MUST match.
       // Verify this in the console logs.
       // ---

      // 3. Calculate Drop Position
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      console.log('[CanvasArea] Calculated drop position:', position);
      if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
          console.error("[CanvasArea] Invalid drop position calculated.");
          return;
      }

      // 4. Create New Node Object
      const newNode: Node = {
        id: getId(),
        type: technicalNodeType, // Use the technical type from NodeTypeInfo for mapping
        position,
        data: {
            label: nodeTypeInfo.name, // Default label
            // Add any other default data fields if needed
        },
      };
      console.log('[CanvasArea] Created newNode object:', newNode);

      // 5. Add Node to State
      console.log('[CanvasArea] Calling addNode action...');
      addNode(newNode);
      console.log('[CanvasArea] addNode action called.');

    },
    [screenToFlowPosition, addNode] // Dependencies
  );

  return (
    <div
      className="reactflow-wrapper h-full w-full bg-neutral-950"
      ref={reactFlowWrapper}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes} // Pass the registered types
        onDragOver={onDragOver}
        onDrop={onDrop}      // Attach the drop handler
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false}/>
        <MiniMap nodeStrokeWidth={3} zoomable pannable nodeColor="#60a5fa" />
        <Background variant="dots" color="#404040" gap={18} size={1} />
      </ReactFlow>

       <NodeInfoModal
          isOpen={isInfoModalOpen}
          onClose={() => setIsInfoModalOpen(false)}
          nodeTypeInfo={infoModalNodeType}
        />
    </div>
  );
}