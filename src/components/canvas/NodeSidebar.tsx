import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from '../ui/scroll-area';
// --- FIX: Import NodeTypeInfo which is now exported by the corrected hook ---
import { useAgentwflowState, NodeTypeInfo } from "@/hooks/useAgentwflowState";
import { NodeInfoModal } from './NodeInfoModal';

export function NodeSidebar() {
  // --- FIX: Access nodeTypeRegistry from the state ---
  const nodeTypeRegistry = useAgentwflowState((state) => state.nodeTypeRegistry);

  // Check if nodeTypeRegistry is available before using it
  // --- FIX: Convert the Map values to an array ---
  const nodeTypes: NodeTypeInfo[] = nodeTypeRegistry ? Array.from(nodeTypeRegistry.values()) : [];

  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
      'Chat Models', 'Multi Agents', 'Document Loaders', 'Memory' // Default expanded
  ]);
  const [nodeInfoHover, setNodeInfoHover] = useState<string | null>(null); // Hover uses nodeType.id

  // State for the modal
  const [showNodeInfoModal, setShowNodeInfoModal] = useState(false);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<NodeTypeInfo | null>(null);

  // Calculate categories based on available nodeTypes
  const categories = nodeTypes.length > 0
    ? Array.from(new Set(nodeTypes.map(node => node.category)))
    : [];

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // --- FIX: Ensure 'node' is correctly typed as NodeTypeInfo ---
  const filteredNodes: NodeTypeInfo[] = nodeTypes.filter((node: NodeTypeInfo) => // Explicit type
    node.name.toLowerCase().includes(search.toLowerCase()) ||
    node.description.toLowerCase().includes(search.toLowerCase()) ||
    node.id.toLowerCase().includes(search.toLowerCase())
  );

  const onDragStart = (e: React.DragEvent, nodeType: NodeTypeInfo) => { // Parameter type is correct
    e.dataTransfer.setData('application/reactflow-typeid', nodeType.id);
    e.dataTransfer.setData('application/json', JSON.stringify(nodeType));
    e.dataTransfer.effectAllowed = 'move';
  };

  const showNodeInfo = (nodeType: NodeTypeInfo, e: React.MouseEvent) => { // Parameter type is correct
    e.stopPropagation();
    setSelectedNodeInfo(nodeType);
    setShowNodeInfoModal(true);
  };

  // Group nodes by category and sort
  // --- FIX: Ensure 'node' is correctly typed as NodeTypeInfo ---
  const categorizedNodes = categories
    .map(category => ({
      category,
      nodes: filteredNodes.filter((node: NodeTypeInfo) => node.category === category) // Explicit type
                           .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter(group => group.nodes.length > 0)
    .sort((a, b) => a.category.localeCompare(b.category));

  // Loading state
  if (nodeTypes.length === 0) {
      return (
          <div className="p-4 text-neutral-400 text-sm h-full flex items-center justify-center">
              Loading node types...
          </div>
      )
  }

  return (
    <>
      <ScrollArea className="h-full pr-2 no-scrollbar">
        <div className="flex flex-col h-full p-4">
          {/* Header */}
          <h2 className="text-lg font-medium text-white mb-4 flex items-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-neutral-400"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7v-2h4V7h2v4h4v2h-4v4h-2z"></path></svg>
            Add Nodes
          </h2>

          {/* Search Input */}
          <div className="relative mb-4 flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input
              placeholder="Search nodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 bg-neutral-800 border-neutral-700 text-white h-9 text-sm rounded"
            />
          </div>

          {/* Node List */}
          <div className="flex-grow overflow-y-auto space-y-1 -mr-2 pr-2">
            {categorizedNodes.map(({ category, nodes }) => (
              <div key={category} className="mb-1">
                {/* Category Header Button */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-neutral-800/60 text-white transition-colors duration-100"
                >
                  <span className="text-sm font-medium">{category}</span>
                  {expandedCategories.includes(category) ? (
                    <ChevronDown className="h-4 w-4 text-neutral-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  )}
                </button>

                {/* Nodes within Category */}
                {expandedCategories.includes(category) && (
                  <div className="pl-2 space-y-1 mt-1 border-l border-neutral-700/50 ml-2">
                    {/* --- FIX: Ensure nodeType is correctly typed as NodeTypeInfo --- */}
                    {nodes.map((nodeType: NodeTypeInfo) => ( // Explicit type
                      <div
                        key={nodeType.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, nodeType)}
                        className="ml-2 p-2 rounded-md hover:bg-neutral-750/80 cursor-grab flex flex-col relative group transition-colors duration-100"
                        onMouseEnter={() => setNodeInfoHover(nodeType.id)}
                        onMouseLeave={() => setNodeInfoHover(null)}
                        title={`Drag to add ${nodeType.name}`}
                      >
                        <div className="flex items-center justify-between">
                          {/* Node Name and Icon */}
                          <div className="text-sm font-medium text-white flex items-center gap-1.5">
                             {nodeType.icon && <span className="text-neutral-400">{nodeType.icon}</span>}
                             {nodeType.name}
                          </div>
                          {/* Info Button Wrapper */}
                          {/* --- FIX: Wrap Info icon in button and apply title attribute --- */}
                          <button
                            type="button" // Good practice for non-submit buttons
                            onClick={(e) => showNodeInfo(nodeType, e)}
                            title={`Info about ${nodeType.name}`} // Use HTML title attribute
                            className="p-0.5 text-neutral-500 group-hover:text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shrink-0 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" // Added focus style
                          >
                            <Info size={14} />
                          </button>
                          {/* --- END FIX --- */}
                        </div>
                        {/* Node Description */}
                        <div className="text-xs text-neutral-400 mt-0.5">{nodeType.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
             {/* No results message */}
             {filteredNodes.length === 0 && search !== '' && (
                 <div className="p-4 text-center text-sm text-neutral-500">No nodes found matching "{search}".</div>
             )}
          </div>
        </div>
      </ScrollArea>

      {/* Render the Modal */}
      {showNodeInfoModal && (
         <NodeInfoModal
             isOpen={showNodeInfoModal}
             onClose={() => setShowNodeInfoModal(false)}
             nodeTypeInfo={selectedNodeInfo ?? undefined}
         />
      )}
    </>
  );
}