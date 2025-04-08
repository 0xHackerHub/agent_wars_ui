import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDown, X, Info, Copy, Trash2, ExternalLink, Plus, Minus, Maximize2, Lock } from "lucide-react";

interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
  connections?: string[];
}

interface Connection {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

interface CanvasAreaProps {
  canvasId: string;
}

export function CanvasArea({ canvasId }: CanvasAreaProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [showCredentialDropdown, setShowCredentialDropdown] = useState(false);
  const [showNodeInfoModal, setShowNodeInfoModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [credentialName, setCredentialName] = useState('');
  const [credentialValue, setCredentialValue] = useState('');
  const [isCreatingNewCredential, setIsCreatingNewCredential] = useState(false);
  const [selectedNodeMenu, setSelectedNodeMenu] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{nodeId: string, handle: string} | null>(null);
  
  // Canvas pan and zoom state
  const [isDragging, setIsDragging] = useState(false);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const credentialDropdownRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (credentialDropdownRef.current && !credentialDropdownRef.current.contains(e.target as Node)) {
        setShowCredentialDropdown(false);
      }
      if (!e.target || !(e.target as HTMLElement).closest('.node-menu-trigger')) {
        setSelectedNodeMenu(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Canvas panning functions
  const startCanvasDrag = (e: React.MouseEvent) => {
    // Only start dragging if it's not a node interaction
    if (!(e.target as HTMLElement).closest('.node-card') && 
        !(e.target as HTMLElement).closest('.node-handle') &&
        !isConnecting) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - canvasPosition.x, y: e.clientY - canvasPosition.y });
    }
  };
  
  const moveCanvas = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setCanvasPosition({ x: newX, y: newY });
    }
  };
  
  const stopCanvasDrag = () => {
    setIsDragging(false);
  };
  
  const resetCanvasPosition = () => {
    setCanvasPosition({ x: 0, y: 0 });
    setZoom(1);
  };
  
  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };
  
  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  // Function to calculate connection paths
  const calculateConnectionPath = (connection: Connection): string => {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    
    if (!sourceNode || !targetNode) return '';
    
    // Calculate the position of the output handle on source node
    const sourceX = sourceNode.position.x + 280; // Node width is 280
    const sourceY = sourceNode.position.y + 95; // Approximate position of output handle
    
    // Calculate the position of the input handle on target node
    const targetX = targetNode.position.x;
    const targetY = targetNode.position.y + 35; // Approximate position of input handle
    
    // Bezier curve control points
    const dx = Math.abs(targetX - sourceX) * 0.8;
    
    // Create path with bezier curve
    return `M${sourceX},${sourceY} C${sourceX + dx},${sourceY} ${targetX - dx},${targetY} ${targetX},${targetY}`;
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const nodeData = JSON.parse(e.dataTransfer.getData('application/json'));
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    
    if (!canvasRect) return;

    // Adjust the position based on current canvas pan and zoom
    const position = {
      x: (e.clientX - canvasRect.left - canvasPosition.x) / zoom,
      y: (e.clientY - canvasRect.top - canvasPosition.y) / zoom
    };

    const newNode: Node = {
      id: `${nodeData.id}-${Date.now()}`,
      type: nodeData.type,
      position,
      data: {
        ...nodeData,
        credentials: null,
        modelName: nodeData.type === 'chat_model' ? null : undefined,
        temperature: nodeData.type === 'chat_model' ? 0.9 : undefined,
        allowImageUploads: false,
        workerPrompt: nodeData.type === 'worker' ? 'You are a research assistant who can search for up-to-date info using search engine.' : undefined
      },
      connections: []
    };

    setNodes(prev => [...prev, newNode]);

    if (nodeData.type === 'chat_model') {
      setSelectedNode(newNode);
      setShowCredentialDropdown(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const openCredentialModal = (node: Node) => {
    setSelectedNode(node);
    setIsCreatingNewCredential(true);
    setShowCredentialModal(true);
    setShowCredentialDropdown(false);
  };

  const saveCredential = async () => {
    if (!selectedNode) return;

    try {
      // Here you would encrypt the credential value before sending to server
      const response = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: credentialName,
          value: credentialValue,
          nodeId: selectedNode.id,
          canvasId
        })
      });

      if (response.ok) {
        setNodes(prev => prev.map(node => 
          node.id === selectedNode.id 
            ? { ...node, data: { ...node.data, credentials: credentialName } }
            : node
        ));
      }
    } catch (error) {
      console.error('Failed to save credential:', error);
    }

    setShowCredentialModal(false);
    setCredentialName('');
    setCredentialValue('');
    setSelectedNode(null);
    setIsCreatingNewCredential(false);
  };

  const toggleCredentialDropdown = (node: Node) => {
    setSelectedNode(node);
    setShowCredentialDropdown(prev => !prev);
  };

  const selectExistingCredential = (credName: string) => {
    if (!selectedNode) return;
    
    setNodes(prev => prev.map(node => 
      node.id === selectedNode.id 
        ? { ...node, data: { ...node.data, credentials: credName } }
        : node
    ));
    
    setShowCredentialDropdown(false);
  };
  
  // Node operations
  const duplicateNode = (node: Node) => {
    const newNode: Node = {
      ...node,
      id: `${node.data.id}-copy-${Date.now()}`,
      position: {
        x: node.position.x + 30,
        y: node.position.y + 30
      }
    };
    
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeMenu(null);
  };
  
  const deleteNode = (nodeId: string) => {
    // Also delete any connections with this node
    setConnections(prev => prev.filter(conn => 
      conn.source !== nodeId && conn.target !== nodeId
    ));
    
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setSelectedNodeMenu(null);
  };
  
  const showNodeInfo = (node: Node) => {
    setSelectedNode(node);
    setShowNodeInfoModal(true);
    setSelectedNodeMenu(null);
  };

  // Function to allow dragging nodes within the canvas
  const [draggedNode, setDraggedNode] = useState<Node | null>(null);
  const [nodeStartPosition, setNodeStartPosition] = useState({ x: 0, y: 0 });
  const [mouseStartPosition, setMouseStartPosition] = useState({ x: 0, y: 0 });

  const startNodeDrag = (e: React.MouseEvent, node: Node) => {
    // Prevent bubbling to canvas drag
    e.stopPropagation();
    
    // Only start dragging on main area of node
    if ((e.target as HTMLElement).closest('.node-handle') || 
        (e.target as HTMLElement).closest('.node-menu-trigger')) {
      return;
    }
    
    setDraggedNode(node);
    setNodeStartPosition(node.position);
    setMouseStartPosition({ x: e.clientX, y: e.clientY });
  };
  
  const moveNodeDrag = (e: React.MouseEvent) => {
    if (draggedNode) {
      const dx = (e.clientX - mouseStartPosition.x) / zoom;
      const dy = (e.clientY - mouseStartPosition.y) / zoom;
      
      setNodes(prev => prev.map(node => 
        node.id === draggedNode.id
          ? { ...node, position: { x: nodeStartPosition.x + dx, y: nodeStartPosition.y + dy } }
          : node
      ));
    }
  };
  
  const stopNodeDrag = () => {
    setDraggedNode(null);
  };

  // Connection handling
  const startConnection = (nodeId: string, handle: string) => {
    setIsConnecting(true);
    setConnectionStart({ nodeId, handle });
  };
  
  const completeConnection = (nodeId: string, handle: string) => {
    if (connectionStart && connectionStart.nodeId !== nodeId) {
      // Create new connection
      const newConnection = {
        source: connectionStart.nodeId,
        target: nodeId,
        sourceHandle: connectionStart.handle,
        targetHandle: handle
      };
      
      setConnections(prev => [...prev, newConnection]);
      
      // Update node connections array
      setNodes(prev => prev.map(node => {
        if (node.id === connectionStart.nodeId) {
          return {
            ...node,
            connections: [...(node.connections || []), nodeId]
          };
        }
        return node;
      }));
    }
    
    setIsConnecting(false);
    setConnectionStart(null);
  };
  
  const cancelConnection = () => {
    setIsConnecting(false);
    setConnectionStart(null);
  };

  // Combined mouse handlers for the canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('.node-card')) {
      startCanvasDrag(e);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    moveCanvas(e);
    moveNodeDrag(e);
  };
  
  const handleMouseUp = () => {
    stopCanvasDrag();
    stopNodeDrag();
    
    if (isConnecting) {
      cancelConnection();
    }
  };

  return (
    <div 
      ref={canvasRef}
      className="w-full h-full bg-neutral-950 overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDrop={onDrop}
      onDragOver={onDragOver}
      style={{ cursor: isDragging ? 'grabbing' : isConnecting ? 'crosshair' : 'default' }}
    >
      <div 
        ref={canvasContainerRef}
        className="w-full h-full relative"
        style={{ 
          transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        {/* Connection lines layer */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
          {/* Connection lines */}
          {connections.map((connection, index) => (
            <path 
              key={`connection-${index}`}
              d={calculateConnectionPath(connection)}
              stroke="#3b82f6" 
              strokeWidth="2" 
              fill="none" 
              strokeDasharray={isConnecting ? "5,5" : "none"}
            />
          ))}
          
          {/* Active connection being drawn */}
          {isConnecting && connectionStart && (
            <path 
              d={`M${nodes.find(n => n.id === connectionStart.nodeId)?.position.x + 280},${nodes.find(n => n.id === connectionStart.nodeId)?.position.y + 95} L${mouseStartPosition.x},${mouseStartPosition.y}`}
              stroke="#3b82f6" 
              strokeWidth="2" 
              fill="none" 
              strokeDasharray="5,5"
            />
          )}
        </svg>

        {nodes.map(node => (
          <div
            key={node.id}
            className="absolute p-0 bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden node-card"
            style={{
              left: node.position.x,
              top: node.position.y,
              width: '280px',
              cursor: draggedNode?.id === node.id ? 'grabbing' : 'grab'
            }}
            onMouseDown={(e) => startNodeDrag(e, node)}
          >
            {/* Node Header */}
            <div className="flex items-center justify-between p-4 pb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-neutral-800 rounded-full flex items-center justify-center">
                  {node.data.type === 'chat_model' && node.data.name.includes('OpenAI') && (
                    <svg viewBox="0 0 24 24" width="20" height="20" className="text-white">
                      <path fill="currentColor" d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
                    </svg>
                  )}
                  {node.data.type === 'chat_model' && node.data.name.includes('Anthropic') && (
                    <div className="h-5 w-5 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold">
                      A
                    </div>
                  )}
                  {node.data.type === 'worker' && (
                    <div className="h-5 w-5 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="5" />
                        <path d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21" />
                      </svg>
                    </div>
                  )}
                  {node.data.type === 'moderation' && (
                    <div className="h-5 w-5 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">
                      M
                    </div>
                  )}
                </div>
                <div className="text-white font-medium">{node.data.name}</div>
              </div>
              
              {/* Node menu button */}
              <div className="relative">
                <button 
                  className="text-neutral-400 hover:text-white node-menu-trigger"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNodeMenu(selectedNodeMenu === node.id ? null : node.id);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                {/* Node context menu */}
                {selectedNodeMenu === node.id && (
                  <div className="absolute right-0 mt-1 bg-neutral-800 border border-neutral-700 rounded shadow-lg z-20">
                    <div 
                      className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-700 cursor-pointer text-white text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateNode(node);
                      }}
                    >
                      <Copy size={14} />
                      <span>Duplicate</span>
                    </div>
                    <div 
                      className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-700 cursor-pointer text-white text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(node.id);
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </div>
                    <div 
                      className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-700 cursor-pointer text-white text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        showNodeInfo(node);
                      }}
                    >
                      <Info size={14} />
                      <span>Info</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-4 py-2">
              <div className="text-neutral-400 text-sm font-medium mb-2">Inputs</div>
              
              {/* Input connection handles */}
              <div className="absolute left-0 top-40 w-2 h-4">
                <div 
                  className="w-4 h-4 rounded-full bg-blue-500 absolute -left-2 cursor-pointer node-handle"
                  onClick={() => completeConnection(node.id, 'input')}
                />
              </div>
              
              <div className="space-y-6">
                {/* Cache for all nodes */}
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <div className="text-white text-sm">Cache</div>
                </div>
                
                {/* Model specific inputs */}
                {node.data.type === 'chat_model' && (
                  <>
                    {/* Credential */}
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <div className="text-white text-sm">Connect Credential <span className="text-red-500">*</span></div>
                      </div>
                      
                      <div className="mt-2 relative">
                        <button
                          onClick={() => toggleCredentialDropdown(node)}
                          className="w-full flex items-center justify-between px-3 py-2 bg-neutral-800 rounded text-white text-sm border border-neutral-700"
                        >
                          <span>{node.data.credentials || "Select credential"}</span>
                          <ChevronDown size={16} />
                        </button>
                        
                        {showCredentialDropdown && selectedNode?.id === node.id && (
                          <div 
                            ref={credentialDropdownRef}
                            className="absolute top-full left-0 right-0 mt-1 bg-neutral-800 border border-neutral-700 rounded z-10"
                          >
                            <div 
                              className="p-2 hover:bg-neutral-700 cursor-pointer text-white text-sm"
                              onClick={() => selectExistingCredential("OpenAI API Key")}
                            >
                              OpenAI API Key
                            </div>
                            <div 
                              className="p-2 hover:bg-neutral-700 cursor-pointer text-blue-400 border-t border-neutral-700 text-sm"
                              onClick={() => openCredentialModal(node)}
                            >
                              - Create New -
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Model Name */}
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <div className="text-white text-sm">Model Name <span className="text-red-500">*</span></div>
                      </div>
                      
                      <div className="mt-2 relative">
                        <button
                          className="w-full flex items-center justify-between px-3 py-2 bg-neutral-800 rounded text-white text-sm border border-neutral-700"
                        >
                          <span>{node.data.modelName || (node.data.name === "ChatOpenAI" ? "gpt-4o-mini (latest)" : "Select model")}</span>
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Temperature */}
                    <div>
                      <div className="text-white text-sm mb-2">Temperature</div>
                      <Input
                        type="number"
                        value={node.data.temperature}
                        min={0}
                        max={1}
                        step={0.1}
                        className="bg-neutral-800 border-neutral-700 text-white"
                        onChange={(e) => setNodes(prev => prev.map(n => 
                          n.id === node.id 
                            ? { ...n, data: { ...n.data, temperature: parseFloat(e.target.value) } }
                            : n
                        ))}
                      />
                    </div>
                    
                    {/* Allow Image Uploads */}
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-white text-sm">Allow Image Uploads</div>
                        <div className="text-neutral-400">
                          <Info size={14} />
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <div 
                          className={`w-12 h-6 rounded-full relative cursor-pointer ${node.data.allowImageUploads ? 'bg-blue-600' : 'bg-neutral-700'}`}
                          onClick={() => setNodes(prev => prev.map(n => 
                            n.id === node.id 
                              ? { ...n, data: { ...n.data, allowImageUploads: !n.data.allowImageUploads } }
                              : n
                          ))}
                        >
                          <div 
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${node.data.allowImageUploads ? 'left-7' : 'left-1'}`} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Parameters */}
<button className="w-full text-sm text-blue-400 py-2 rounded border border-blue-900/50 bg-blue-950/20">
  Additional Parameters
</button>
</>
)}

{/* Moderation specific inputs */}
{node.data.type === 'moderation' && (
  <>
    {/* Credential */}
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-red-500"></div>
        <div className="text-white text-sm">Connect Credential <span className="text-red-500">*</span></div>
      </div>
      
      <div className="mt-2 relative">
        <button
          onClick={() => toggleCredentialDropdown(node)}
          className="w-full flex items-center justify-between px-3 py-2 bg-neutral-800 rounded text-white text-sm border border-neutral-700"
        >
          <span>{node.data.credentials || "Select credential"}</span>
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
    
    {/* Error Message */}
    <div>
      <div className="text-white text-sm mb-2">Error Message</div>
      <div className="bg-neutral-800 border border-neutral-700 rounded p-3 text-white text-sm">
        Cannot Process! Input violates OpenAI's content moderation policies.
      </div>
    </div>
  </>
)}

{/* Worker specific inputs */}
{node.data.type === 'worker' && (
  <>
    {/* Tools */}
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
      <div className="text-white text-sm">Tools</div>
    </div>
    
    {/* Supervisor */}
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 rounded-full bg-red-500"></div>
      <div className="text-white text-sm">Supervisor <span className="text-red-500">*</span></div>
    </div>
    
    {/* Tool Calling Chat Model */}
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
      <div className="text-white text-sm">Tool Calling Chat Model</div>
      <div className="text-neutral-400">
        <Info size={14} />
      </div>
    </div>
    
    {/* Worker Name */}
    <div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-red-500"></div>
        <div className="text-white text-sm">Worker Name <span className="text-red-500">*</span></div>
      </div>
      
      <div className="mt-2">
        <Input
          value={node.data.workerName || "Worker"}
          className="bg-neutral-800 border-neutral-700 text-white"
          onChange={(e) => setNodes(prev => prev.map(n => 
            n.id === node.id 
              ? { ...n, data: { ...n.data, workerName: e.target.value } }
              : n
          ))}
        />
      </div>
    </div>
    
    {/* Worker Prompt */}
    <div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-red-500"></div>
        <div className="text-white text-sm">Worker Prompt <span className="text-red-500">*</span></div>
        <div className="ml-auto">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15V15.01M12 9V12M4.98207 19.0179L4.58175 19.4182C3.80289 20.1971 3.80289 21.4602 4.58175 22.2391C5.36061 23.0179 6.62376 23.0179 7.40262 22.2391L7.80262 21.8391M4.98207 19.0179L7.80262 21.8391M4.98207 19.0179L11.2071 12.7929C11.5976 12.4024 11.5976 11.7692 11.2071 11.3787L9.5 9.67155C9.10951 9.28106 8.47635 9.28106 8.08586 9.67155L1.87132 15.8861C1.48084 16.2766 1.48084 16.9097 1.87132 17.3002L3.57868 19.0076C3.96916 19.3981 4.60233 19.3981 4.99281 19.0076L4.98207 19.0179ZM7.80262 21.8391L20 9.64171C21.3807 8.26104 21.3807 5.9979 20 4.61723C18.6193 3.23656 16.3562 3.23656 14.9755 4.61723L2.77817 16.8146" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      
      <div className="mt-2 bg-neutral-800 border border-neutral-700 rounded p-3 text-white text-sm">
        {node.data.workerPrompt}
      </div>
    </div>
    
    {/* Format Prompt Values */}
    <button className="w-full text-sm text-blue-400 py-2 rounded border border-blue-900/50 bg-blue-950/20">
      Format Prompt Values
    </button>
    
    {/* Max Iterations */}
    <div>
      <div className="text-white text-sm mb-2">Max Iterations</div>
      <Input
        type="number"
        className="bg-neutral-800 border-neutral-700 text-white"
        value={node.data.maxIterations || 10}
        onChange={(e) => setNodes(prev => prev.map(n => 
          n.id === node.id 
            ? { ...n, data: { ...n.data, maxIterations: parseInt(e.target.value) } }
            : n
        ))}
      />
    </div>
  </>
)}
</div>
</div>

{/* Node Output */}
<div className="px-4 py-2 bg-neutral-800/50">
<div className="text-neutral-400 text-sm font-medium mb-2">Output</div>
<div className="flex justify-end items-center">
  <div className="text-white text-sm">{node.data.name}</div>
  <div 
    className="h-2 w-2 rounded-full bg-blue-500 ml-2 cursor-pointer node-handle" 
    onClick={() => startConnection(node.id, 'output')}
  ></div>
</div>
</div>
</div>
))}
</div>

{/* API Credential Modal */}
<Dialog open={showCredentialModal} onOpenChange={setShowCredentialModal}>
<DialogContent className="bg-neutral-800 text-white border-neutral-700">
<DialogHeader>
  <DialogTitle className="text-white">
    {selectedNode?.data.name === 'ChatOpenAI' ? 'OpenAI API' : 'API Credentials'}
  </DialogTitle>
</DialogHeader>
<div className="space-y-4 py-4">
  <div className="space-y-2">
    <Label className="text-white uppercase text-xs">Credential Name <span className="text-red-500">*</span></Label>
    <Input
      value={credentialName}
      onChange={(e) => setCredentialName(e.target.value)}
      placeholder={selectedNode?.data.name === 'ChatOpenAI' ? "OpenAI API" : "e.g. OpenAI API Key"}
      className="bg-neutral-700 border-neutral-600 text-white"
    />
  </div>
  <div className="space-y-2">
    <Label className="text-white uppercase text-xs">
      {selectedNode?.data.name === 'ChatOpenAI' ? 'OpenAI API Key' : 'API Key'} <span className="text-red-500">*</span>
    </Label>
    <Input
      type="password"
      value={credentialValue}
      onChange={(e) => setCredentialValue(e.target.value)}
      placeholder="Enter your API key"
      className="bg-neutral-700 border-neutral-600 text-white"
    />
  </div>
  <Button onClick={saveCredential} className="w-full bg-neutral-100 hover:bg-neutral-200 text-black">
    Add
  </Button>
</div>
</DialogContent>
</Dialog>

{/* Node Info Modal */}
<Dialog open={showNodeInfoModal} onOpenChange={setShowNodeInfoModal}>
<DialogContent className="bg-neutral-800 text-white border-neutral-700 max-w-2xl max-h-[80vh] overflow-y-auto">
<DialogHeader className="flex items-center flex-row justify-between">
  <div className="flex items-center gap-3">
    <div className="h-10 w-10 bg-neutral-700 rounded-full flex items-center justify-center">
      {selectedNode?.data.type === 'chat_model' && selectedNode?.data.name.includes('OpenAI') && (
        <svg viewBox="0 0 24 24" width="24" height="24" className="text-white">
          <path fill="currentColor" d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729z" />
        </svg>
      )}
      {selectedNode?.data.type === 'chat_model' && selectedNode?.data.name.includes('Anthropic') && (
        <div className="h-6 w-6 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold">
          A
        </div>
      )}
      {selectedNode?.data.type === 'worker' && (
        <div className="h-6 w-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21" />
          </svg>
        </div>
      )}
      {selectedNode?.data.type === 'moderation' && (
        <div className="h-6 w-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">
          M
        </div>
      )}
    </div>
    <DialogTitle className="text-xl text-white">{selectedNode?.data.name}</DialogTitle>
  </div>
  <div className="flex items-center gap-2">
    <div className="text-xs px-2 py-1 rounded bg-neutral-700">{selectedNode?.data.type === 'chat_model' ? 'chatOpenAI_0' : selectedNode?.data.type === 'moderation' ? 'inputModerationOpenAI_0' : 'worker_0'}</div>
    <div className="text-xs px-2 py-1 rounded bg-neutral-700">version {selectedNode?.data.type === 'chat_model' ? '8' : selectedNode?.data.type === 'moderation' ? '3' : '2'}</div>
  </div>
</DialogHeader>

<div className="space-y-6 py-4">
  <p className="text-neutral-300">
    {selectedNode?.data.type === 'chat_model' && selectedNode?.data.name.includes('OpenAI') && 
      "Wrapper around OpenAI large language models that use the Chat endpoint."
    }
    {selectedNode?.data.type === 'chat_model' && selectedNode?.data.name.includes('Anthropic') && 
      "Wrapper around ChatAnthropic large language models that use the Chat endpoint."
    }
    {selectedNode?.data.type === 'worker' && 
      "Worker agent that can execute tools and respond to user queries."
    }
    {selectedNode?.data.type === 'moderation' && 
      "Check whether content complies with OpenAI's usage policies."
    }
  </p>
  
  <div className="border-t border-neutral-700">
    <table className="w-full">
      <thead>
        <tr className="border-b border-neutral-700">
          <th className="text-left py-3 px-4 text-sm font-medium text-neutral-300">Label</th>
          <th className="text-left py-3 px-4 text-sm font-medium text-neutral-300">Name</th>
          <th className="text-left py-3 px-4 text-sm font-medium text-neutral-300">Type</th>
        </tr>
      </thead>
      <tbody>
        {selectedNode?.data.type === 'chat_model' && selectedNode?.data.name.includes('OpenAI') && (
          <>
            <tr className="border-b border-neutral-700">
              <td className="py-3 px-4 text-sm">OpenAI API Key</td>
              <td className="py-3 px-4 text-sm text-neutral-400">openAIApiKey</td>
              <td className="py-3 px-4 text-sm text-neutral-400">string</td>
            </tr>
            <tr className="border-b border-neutral-700">
              <td className="py-3 px-4 text-sm">Model Name</td>
              <td className="py-3 px-4 text-sm text-neutral-400">modelName</td>
              <td className="py-3 px-4 text-sm text-neutral-400">asyncOptions</td>
            </tr>
            <tr className="border-b border-neutral-700">
              <td className="py-3 px-4 text-sm">Temperature</td>
              <td className="py-3 px-4 text-sm text-neutral-400">temperature</td>
              <td className="py-3 px-4 text-sm text-neutral-400">number</td>
            </tr>
            <tr className="border-b border-neutral-700">
              <td className="py-3 px-4 text-sm">Streaming</td>
              <td className="py-3 px-4 text-sm text-neutral-400">streaming</td>
              <td className="py-3 px-4 text-sm text-neutral-400">boolean</td>
            </tr>
            <tr className="border-b border-neutral-700">
              <td className="py-3 px-4 text-sm">Max Tokens</td>
              <td className="py-3 px-4 text-sm text-neutral-400">maxTokens</td>
              <td className="py-3 px-4 text-sm text-neutral-400">number</td>
            </tr>
            <tr className="border-b border-neutral-700">
              <td className="py-3 px-4 text-sm">Top Probability</td>
              <td className="py-3 px-4 text-sm text-neutral-400">topP</td>
              <td className="py-3 px-4 text-sm text-neutral-400">number</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-sm">Allow Image Uploads</td>
              <td className="py-3 px-4 text-sm text-neutral-400">allowImageUploads</td>
              <td className="py-3 px-4 text-sm text-neutral-400">boolean</td>
            </tr>
          </>
        )}
        {selectedNode?.data.type === 'chat_model' && selectedNode?.data.name.includes('Anthropic') && (
          <>
            <tr className="border-b border-neutral-700">
              <td className="py-3 px-4 text-sm">Anthropic API Key</td>
              <td className="py-3 px-4 text-sm text-neutral-400">anthropicApiKey</td>
              <td className="py-3 px-4 text-sm text-neutral-400">string</td>
            </tr>
            <tr className="border-b border-neutral-700">
              <td className="py-3 px-4 text-sm">Model Name</td>
              <td className="py-3 px-4 text-sm text-neutral-400">modelName</td>
              <td className="py-3 px-4 text-sm text-neutral-400">asyncOptions</td>
            </tr>
            <tr className="border-b border-neutral-700">
              <td className="py-3 px-4 text-sm">Temperature</td>
              <td className="py-3 px-4 text-sm text-neutral-400">temperature</td>
              <td className="py-3 px-4 text-sm text-neutral-400">number</td>
            </tr>
            <tr className="border-b border-neutral-700">
              <td className="py-3 px-4 text-sm">Top K</td>
              <td className="py-3 px-4 text-sm text-neutral-400">topK</td>
              <td className="py-3 px-4 text-sm text-neutral-400">number</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-sm">Allow Image Uploads</td>
              <td className="py-3 px-4 text-sm text-neutral-400">allowImageUploads</td>
              <td className="py-3 px-4 text-sm text-neutral-400">boolean</td>
            </tr>
          </>
        )}
        {selectedNode?.data.type === 'moderation' && (
          <>
            <tr className="border-b border-neutral-700">
              <td className="py-3 px-4 text-sm">OpenAI API Key</td>
              <td className="py-3 px-4 text-sm text-neutral-400">openAIApiKey</td>
              <td className="py-3 px-4 text-sm text-neutral-400">string</td>
            </tr>
            <tr className="border-b border-neutral-700">
              <td className="py-3 px-4 text-sm">Error Message</td>
              <td className="py-3 px-4 text-sm text-neutral-400">moderationErrorMessage</td>
              <td className="py-3 px-4 text-sm text-neutral-400">string</td>
            </tr>
          </>
        )}
        {selectedNode?.data.type === 'worker' && (
          <>
            <tr className="border-b border-neutral-700">
              <td className="py-3 px-4 text-sm">Worker Name</td>
              <td className="py-3 px-4 text-sm text-neutral-400">workerName</td>
              <td className="py-3 px-4 text-sm text-neutral-400">string</td>
            </tr>
            <tr className="border-b border-neutral-700">
              <td className="py-3 px-4 text-sm">Worker Prompt</td>
              <td className="py-3 px-4 text-sm text-neutral-400">workerPrompt</td>
              <td className="py-3 px-4 text-sm text-neutral-400">string</td>
            </tr>
            <tr className="border-b border-neutral-700">
              <td className="py-3 px-4 text-sm">Format Prompt Values</td>
              <td className="py-3 px-4 text-sm text-neutral-400">promptValues</td>
              <td className="py-3 px-4 text-sm text-neutral-400">json</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-sm">Max Iterations</td>
              <td className="py-3 px-4 text-sm text-neutral-400">maxIterations</td>
              <td className="py-3 px-4 text-sm text-neutral-400">number</td>
            </tr>
          </>
        )}
      </tbody>
    </table>
  </div>
  
  <div className="flex justify-end">
    <a 
      className="text-blue-400 flex items-center gap-1 text-sm"
      href="#"
      onClick={(e) => {
        e.preventDefault();
        setShowNodeInfoModal(false);
      }}
    >
      <ExternalLink size={14} />
      View Documentation
    </a>
  </div>
</div>
</DialogContent>
</Dialog>

{/* Canvas Controls */}
<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-neutral-900 rounded-md border border-neutral-800 flex items-center p-1 z-20">
<Button 
  variant="ghost" 
  size="icon" 
  className="h-8 w-8 text-neutral-400 hover:text-white"
  onClick={zoomIn}
  title="Zoom In"
>
  <Plus className="h-4 w-4" />
</Button>
<Button 
  variant="ghost" 
  size="icon" 
  className="h-8 w-8 text-neutral-400 hover:text-white"
  onClick={zoomOut}
  title="Zoom Out"
>
  <Minus className="h-4 w-4" />
</Button>
<Button 
  variant="ghost" 
  size="icon" 
  className="h-8 w-8 text-neutral-400 hover:text-white"
  onClick={resetCanvasPosition}
  title="Center View"
>
  <Maximize2 className="h-4 w-4" />
</Button>
<Button 
  variant="ghost" 
  size="icon" 
  className="h-8 w-8 text-neutral-400 hover:text-white"
  title="Lock View"
>
  <Lock className="h-4 w-4" />
</Button>
</div>
</div>
)}