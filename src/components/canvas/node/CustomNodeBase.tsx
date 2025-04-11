import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react'; // Ensure NodeProps is imported
import { Copy, Trash2, Info, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useAgentwflowState, useNodeStatus, useNodeTypeInfo } from '@/hooks/useAgentwflowState';

// Interface defines the props *accepted* by CustomNodeBase
interface CustomNodeBaseProps extends NodeProps { // It receives all standard NodeProps
  children: React.ReactNode;
  nodeTypeIdentifier: string; // Specific prop for this component
  onInfoClick: () => void;    // Specific prop for this component
}

// Base styling (remains the same)
const nodeBaseStyle = `
  bg-neutral-800 border rounded-lg shadow-md text-white min-w-[250px] max-w-[350px]
  overflow-hidden transition-all duration-150 ease-in-out
`;

// Status styling (remains the same)
const statusStyles = {
  idle: 'border-neutral-700',
  running: 'border-blue-500 ring-2 ring-blue-500/50 animate-pulse',
  success: 'border-green-500',
  error: 'border-red-500',
};

// Status icons (remains the same)
const statusIcons = {
  running: <RefreshCw size={14} className="text-blue-400 animate-spin" />,
  success: <CheckCircle size={14} className="text-green-400" />,
  error: <AlertTriangle size={14} className="text-red-400" />,
  idle: null,
};

// Component implementation uses the props defined in CustomNodeBaseProps
export function CustomNodeBase({
    id,
    data,
    selected, // This comes from NodeProps
    children,
    nodeTypeIdentifier,
    onInfoClick,
    // We don't need to explicitly destructure props like 'dragging', 'zIndex' etc.
    // unless CustomNodeBase specifically uses them for its own logic/styling.
    // They are available if needed because CustomNodeBaseProps extends NodeProps.
 }: CustomNodeBaseProps) {

  const deleteNode = useAgentwflowState((state) => state.deleteNode);
  const duplicateNode = useAgentwflowState((state) => state.duplicateNode);
  const nodeTypeInfo = useNodeTypeInfo(nodeTypeIdentifier);
  const status = useNodeStatus(id); // status depends on the node's ID

  // Event handlers (remain the same)
  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteNode(id);
  };
  const handleDuplicate = (e: React.MouseEvent) => {
      e.stopPropagation();
      duplicateNode(id);
  };
  const handleInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInfoClick) {
        onInfoClick();
    } else {
        console.warn("onInfoClick handler not provided to CustomNodeBase for node:", id);
    }
  };

  const label = (data?.label as string) || nodeTypeInfo?.name || 'Node';

  return (
    // The main div uses 'selected' prop for styling
    <div className={`${nodeBaseStyle} ${statusStyles[status]} ${selected ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}`}>
        {/* Header */}
        <div className="bg-neutral-750/50 px-3 py-2 border-b border-neutral-700 flex justify-between items-center">
            <div className="flex items-center gap-2 overflow-hidden mr-2">
                {nodeTypeInfo?.icon && <span className="text-neutral-400 shrink-0">{nodeTypeInfo.icon}</span>}
                <span className="font-medium text-sm truncate" title={label}>{label}</span>
                {nodeTypeInfo?.version && <span className="text-xs text-neutral-500 shrink-0">v{nodeTypeInfo.version}</span>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
                {status !== 'idle' && <span className="mr-1">{statusIcons[status]}</span>}
                <button onClick={handleDuplicate} className="p-0.5 text-neutral-400 hover:text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500" title="Duplicate Node"><Copy size={12} /></button>
                <button onClick={handleDelete} className="p-0.5 text-neutral-400 hover:text-red-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" title="Delete Node"><Trash2 size={12} /></button>
                <button onClick={handleInfo} className="p-0.5 text-neutral-400 hover:text-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" title="Node Info"><Info size={12} /></button>
            </div>
        </div>

      {/* Content Area */}
      <div className="p-3 space-y-2 text-sm">
        {children} {/* Renders the specific inputs/content passed from ChatOpenAINode */}
      </div>

      {/* Default Handles (Consider removing if specific nodes always provide their own) */}
      {/* <Handle type="target" position={Position.Left} className="!bg-teal-500 w-2 h-2" />
      <Handle type="source" position={Position.Right} className="!bg-blue-500 w-2 h-2" /> */}
    </div>
  );
}