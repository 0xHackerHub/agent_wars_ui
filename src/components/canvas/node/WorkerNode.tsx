import React, { useEffect, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CustomNodeBase } from './CustomNodeBase';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAgentwflowState } from '@/hooks/useAgentwflowState';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface WorkerNodeData {
  label?: string;
  workerName?: string;
  workerPrompt?: string;
  maxIterations?: number;
  selectedTool?: string;
  supervisor?: string;
  llm?: string;
}

// InputRow component for reusable input nodes with handles
const InputRow = ({ id, label, required, tooltip }: { id: string; label: string; required?: boolean; tooltip?: string }) => (
  <div className="flex items-center justify-between text-xs px-3 py-1.5 bg-neutral-700/30 border-b border-neutral-700/50 last:border-b-0">
    <div className="flex items-center gap-1.5">
      <Handle type="target" position={Position.Left} id={id} className="!bg-neutral-400 !w-2 !h-2 !border-none" />
      <span>{label}</span>
      {required && <span className="text-red-500">*</span>}
    </div>
    <Handle type="target" position={Position.Bottom} id={id} className="!bg-neutral-400 !w-2 !h-2 !border-none" />
    {tooltip && (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info size={12} className="text-neutral-500 hover:text-neutral-300 cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </div>
);

export function WorkerNode({ id, data, selected }: NodeProps<WorkerNodeData>) {
    const { setNodes } = useAgentwflowState();
    const [tools, setTools] = useState<string[]>([]);
  
    useEffect(() => {
      fetch('/tools.json')
        .then((response) => response.json())
        .then((data) => setTools(data))
        .catch((error) => console.error('Error fetching tools:', error));
    }, []);
  
    const updateNodeData = (field: keyof WorkerNodeData, value: string | number) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            const finalValue = field === 'maxIterations' ? parseInt(value as string, 10) || 0 : value;
            return { ...node, data: { ...node.data, [field]: finalValue } };
          }
          return node;
        })
      );
    };
  
    const onInfoClick = () => console.log(`Info clicked for Worker node: ${id}`);
  
    return (
      <CustomNodeBase id={id} data={data} selected={selected} nodeTypeIdentifier="worker" onInfoClick={onInfoClick}>
        <div className="flex flex-col">
          {/* Input Section Header */}
          <div className="text-xs font-semibold bg-neutral-700 px-3 py-1">Inputs</div>
  
          {/* Input Nodes */}
          <InputRow
            id="supervisor"
            label="Supervisor"
            required
            tooltip="The supervisor agent overseeing this worker."
          />
  
          {/* Configurable Parameters */}
          <div className="p-3 space-y-3 border-b border-neutral-700">
            <div className="space-y-1">
              <label htmlFor={`workerName-${id}`} className="text-xs text-neutral-400 block">
                Worker Name <span className="text-red-500">*</span>
              </label>
              <Input
                id={`workerName-${id}`}
                name="workerName"
                className="nodrag bg-neutral-700 border-neutral-600 text-white text-xs px-2 py-1 h-auto rounded"
                value={data.workerName || 'Worker'}
                onChange={(e) => updateNodeData('workerName', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor={`workerPrompt-${id}`} className="text-xs text-neutral-400 block">
                Worker Prompt <span className="text-red-500">*</span>
              </label>
              <Textarea
                id={`workerPrompt-${id}`}
                name="workerPrompt"
                className="nodrag bg-neutral-700 border-neutral-600 text-white text-xs px-2 py-1.5 min-h-[60px] rounded"
                value={data.workerPrompt || 'You are a helpful assistant Agent-W.'}
                onChange={(e) => updateNodeData('workerPrompt', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor={`tools-${id}`} className="text-xs text-neutral-400 block">Tools</label>
              <Select value={data.selectedTool || ''} onValueChange={(value) => updateNodeData('selectedTool', value)}>
                    <SelectTrigger className="w-full bg-neutral-700 border-neutral-600 text-white text-xs h-auto rounded">
                        <SelectValue placeholder="Select a tool" />
                    </SelectTrigger>
                    <SelectContent>
                        {tools.map((tool) => (
                        <SelectItem key={tool} value={tool}>
                            {tool}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
              <label htmlFor={`maxIterations-${id}`} className="text-xs text-neutral-400 block">Max Iterations</label>
              <Input
                id={`maxIterations-${id}`}
                name="maxIterations"
                type="number"
                min="1"
                step="1"
                className="nodrag bg-neutral-700 border-neutral-600 text-white text-xs px-2 py-1 h-auto rounded"
                value={data.maxIterations ?? 3}
                onChange={(e) => updateNodeData('maxIterations', e.target.value)}
              />
            </div>
          </div>
        </div>
      </CustomNodeBase>
    );
  }