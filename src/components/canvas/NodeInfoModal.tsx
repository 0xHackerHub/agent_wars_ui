import React from 'react';
import { X } from 'lucide-react';
import { NodeTypeInfo } from '@/hooks/useAgentwflowState'; // Import the type
import { ScrollArea } from '../ui/scroll-area';

interface NodeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeTypeInfo: NodeTypeInfo | undefined; // Accept the node type info object
}

export function NodeInfoModal({ isOpen, onClose, nodeTypeInfo }: NodeInfoModalProps) {
  if (!isOpen || !nodeTypeInfo) return null;

  // Simple table row component
  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <tr className="border-b border-neutral-700">
      <td className="py-2 px-3 text-sm font-medium text-neutral-400 align-top w-1/4">{label}</td>
      <td className="py-2 px-3 text-sm text-white align-top">{value || '-'}</td>
    </tr>
  );

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-neutral-800 text-white border border-neutral-700 rounded-lg max-w-2xl w-[90%] shadow-xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-neutral-700">
          <div className='flex items-center gap-2'>
             {nodeTypeInfo.icon && <span className="text-blue-400">{nodeTypeInfo.icon}</span>}
            <h3 className="text-lg font-semibold">{nodeTypeInfo.name}</h3>
            <span className="text-xs bg-neutral-700 px-1.5 py-0.5 rounded text-neutral-300">
                v{nodeTypeInfo.version}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-grow p-4">
          <table className="w-full border-collapse">
            <tbody>
              <InfoRow label="Name" value={nodeTypeInfo.name} />
              <InfoRow label="Type ID" value={<code className="text-xs bg-neutral-700 px-1 rounded">{nodeTypeInfo.id}</code>} />
              <InfoRow label="Category" value={nodeTypeInfo.category} />
              <InfoRow label="Version" value={nodeTypeInfo.version} />
              <InfoRow label="Description" value={nodeTypeInfo.description} />
              {nodeTypeInfo.documentationUrl && (
                <InfoRow label="Documentation" value={<a href={nodeTypeInfo.documentationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Link</a>} />
              )}
               {/* Add more details like inputs, outputs, parameters if needed */}
              {nodeTypeInfo.parameters && nodeTypeInfo.parameters.length > 0 && (
                <InfoRow label="Parameters" value={
                  <ul className="list-disc list-inside space-y-1">
                    {nodeTypeInfo.parameters.map(p => <li key={p.name}><code className="text-xs bg-neutral-700 px-1 rounded">{p.name}</code> ({p.type}) - {p.description} {p.required && <span className="text-red-400 text-xs">(required)</span>}</li>)}
                  </ul>
                }/>
              )}
              {/* Add Inputs/Outputs similarly */}
            </tbody>
          </table>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 bg-neutral-850 border-t border-neutral-700 flex justify-end rounded-b-lg">
          <button
            className="px-4 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-white text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}