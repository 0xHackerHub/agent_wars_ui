import React from 'react';
import { useAgentwflowState, useNodeTypeInfo } from "@/hooks/useAgentwflowState";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Example for multi-line
import { Node } from "@xyflow/react";
import { ScrollArea } from '../ui/scroll-area';
import { X } from 'lucide-react';

// Define a more specific type for data expected within nodes
interface NodeData {
  label?: string;
  // Add other potential fields based on your nodes
  modelName?: string;
  temperature?: number;
  workerName?: string;
  workerPrompt?: string;
  [key: string]: any; // Allow other properties
}

export function NodeProperties() {
  const {
      activeNodeId,
      getActiveNode, // Use the getter
      setNodes,
      toggleProperties, // Function to close the panel
  } = useAgentwflowState();

  const activeNode = getActiveNode(); // Get the currently active node object
  const nodeTypeInfo = useNodeTypeInfo(activeNode?.type); // Get info based on node's technical type

  if (!activeNode) {
    // Optionally render a placeholder when no node is selected
    return (
         <div className="bg-neutral-900 text-neutral-400 p-4 border-l border-neutral-800 h-full flex flex-col justify-center items-center text-sm">
            Select a node to view its properties.
         </div>
    );
  }

  // Type assertion for node data
  const nodeData = (activeNode.data || {}) as NodeData;

  // Generic handler to update node data
  const handleDataChange = (field: keyof NodeData, value: string | number) => {
    setNodes((nds: Node[]) =>
      nds.map((node) =>
        node.id === activeNodeId
          ? { ...node, data: { ...node.data, [field]: value } }
          : node
      )
    );
  };

  // Render specific inputs based on node type or available data/parameters
  const renderParameterInputs = () => {
      if (!nodeTypeInfo?.parameters) return null;

      return nodeTypeInfo.parameters.map((param) => {
          const currentValue = nodeData[param.name];
          const inputId = `${activeNode.id}-${param.name}`;

          // Simple input rendering based on type - extend as needed
          let inputElement;
          if (param.type === 'number') {
              inputElement = (
                  <Input
                      id={inputId}
                      type="number"
                      value={currentValue?.toString() ?? ''}
                      onChange={(e) => handleDataChange(param.name, parseFloat(e.target.value) || 0)}
                      className="nodrag bg-neutral-700 border-neutral-600 text-white h-8 text-sm"
                      step={param.name === 'temperature' ? 0.1 : undefined} // Example specific step
                  />
              );
          } else if (param.type === 'string' && param.name.toLowerCase().includes('prompt')) {
               inputElement = (
                   <Textarea
                       id={inputId}
                       value={currentValue?.toString() ?? ''}
                       onChange={(e) => handleDataChange(param.name, e.target.value)}
                       className="nodrag bg-neutral-700 border-neutral-600 text-white text-sm min-h-[80px]"
                       rows={4}
                   />
               );
          } else { // Default to text input
              inputElement = (
                  <Input
                      id={inputId}
                      type="text"
                      value={currentValue?.toString() ?? ''}
                      onChange={(e) => handleDataChange(param.name, e.target.value)}
                      className="nodrag bg-neutral-700 border-neutral-600 text-white h-8 text-sm"
                  />
              );
          }

          return (
              <div key={param.name} className="mb-3">
                  <label htmlFor={inputId} className="block text-xs font-medium text-neutral-400 mb-1">
                      {param.description || param.name} {param.required && <span className="text-red-400">*</span>}
                  </label>
                  {inputElement}
              </div>
          );
      });
  };


  return (
    <div className="bg-neutral-900 text-white border-l border-neutral-800 h-full flex flex-col">
       {/* Panel Header */}
       <div className="flex justify-between items-center p-3 border-b border-neutral-800">
         <h3 className="text-base font-semibold">Node Properties</h3>
         <button
            onClick={toggleProperties}
            className="text-neutral-400 hover:text-white"
            title="Close Properties"
          >
            <X size={18} />
          </button>
       </div>

       {/* Panel Content */}
       <ScrollArea className="flex-grow p-4">
          <div className="mb-3">
             <label className="block text-xs font-medium text-neutral-400 mb-1">Node ID</label>
             <p className="text-sm text-neutral-300 bg-neutral-800 px-2 py-1 rounded border border-neutral-700 break-all">{activeNode.id}</p>
          </div>
           <div className="mb-3">
               <label className="block text-xs font-medium text-neutral-400 mb-1">Node Type</label>
               <p className="text-sm text-neutral-300">{nodeTypeInfo?.name || activeNode.type}</p>
           </div>

           {/* Generic Label Input */}
           <div className="mb-3">
               <label htmlFor={`${activeNode.id}-label`} className="block text-xs font-medium text-neutral-400 mb-1">
                  Custom Label (Optional)
               </label>
               <Input
                   id={`${activeNode.id}-label`}
                   placeholder="Enter custom label..."
                   value={nodeData.label || ""}
                   onChange={(e) => handleDataChange("label", e.target.value)}
                   className="nodrag bg-neutral-700 border-neutral-600 text-white h-8 text-sm"
               />
           </div>

           <hr className="border-neutral-700 my-4" />

           {/* Dynamically Rendered Parameter Inputs */}
           {renderParameterInputs()}

            {/* Fallback if no parameters defined */}
            {(!nodeTypeInfo?.parameters || nodeTypeInfo.parameters.length === 0) && (
                <p className="text-xs text-neutral-500 italic">No configurable parameters defined for this node type.</p>
            )}


       </ScrollArea>
    </div>
  );
}