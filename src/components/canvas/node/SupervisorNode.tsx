import React from 'react';
import { Handle, Position, NodeProps, useUpdateNodeInternals } from '@xyflow/react';
import { CustomNodeBase } from './CustomNodeBase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Info, PlusCircle } from 'lucide-react'; // Import necessary icons
import { useAgentwflowState } from '@/hooks/useAgentwflowState';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Assuming you have Tooltip

interface SupervisorNodeData {
  label?: string;
  supervisorName?: string;
  // Add fields for connected Tool Calling Chat Model, Agent Memory, Input Moderation if needed
  // These might be represented by connections rather than data fields directly
}

// Helper for input rows with handles
const InputRow = ({ id, label, required, tooltip }: { id: string, label: string, required?: boolean, tooltip?: string }) => (
    <div className="flex items-center justify-between text-xs px-3 py-1.5 bg-neutral-700/30 border-b border-neutral-700/50 last:border-b-0">
        <div className="flex items-center gap-1.5">
            <span>{label}</span>
            {required && <span className="text-red-500">*</span>}
        </div>
        {tooltip && (
            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Info size={12} className="text-neutral-500 hover:text-neutral-300 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side='right' className='max-w-xs'>
                        <p>{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )}
    </div>
);

export function SupervisorNode({ id, data, selected }: NodeProps<SupervisorNodeData>) {
    const { setNodes } = useAgentwflowState();
    const updateNodeInternals = useUpdateNodeInternals(); // Hook to update handles if needed

    const updateNodeData = (field: keyof SupervisorNodeData, value: string) => {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === id) {
              return { ...node, data: { ...node.data, [field]: value } };
            }
            return node;
          })
        );
    };

    // Placeholder for onInfoClick - adapt as needed for your modal implementation
    const onInfoClick = () => console.log(`Info clicked for Supervisor node: ${id}`);

    // Placeholder actions for buttons
    const handleAddParams = () => console.log("Add Params clicked for", id);

    return (
        <CustomNodeBase id={id} data={data} selected={selected} nodeTypeIdentifier="supervisor" onInfoClick={onInfoClick}>
            <div className='flex flex-col'>
                {/* Input Section Header */}
                <div className="text-xs font-semibold bg-neutral-700 px-3 py-1">Inputs</div>

                {/* Input Rows */}
                <InputRow id="tool_calling_chat_model" label="Tool Calling Chat Model" required tooltip="The chat model used by the supervisor for deciding actions." />
                <InputRow id="agent_memory" label="Agent Memory" tooltip="Memory component to store conversation history or state." />
                <InputRow id="input_moderation" label="Input Moderation" tooltip="Optional moderation step for incoming requests." />

                {/* Configurable Parameters */}
                <div className="p-3 space-y-2 border-b border-neutral-700">
                    <div className='space-y-1'>
                        <label htmlFor={`supervisorName-${id}`} className="text-xs text-neutral-400 block">
                            Supervisor Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id={`supervisorName-${id}`}
                            name="supervisorName"
                            className="nodrag bg-neutral-700 border-neutral-600 text-white text-xs px-2 py-1 h-auto rounded"
                            value={data.supervisorName || 'Supervisor'}
                            onChange={(e) => updateNodeData('supervisorName', e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-xs h-7 border-blue-500/50 text-blue-300 hover:bg-blue-500/10 hover:text-blue-200" onClick={handleAddParams}>
                        <PlusCircle size={14} className="mr-1" /> Additional Parameters
                    </Button>
                </div>

                {/* Output Section */}
                 <div className="flex items-center justify-between text-xs  bg-neutral-700/30">
                    <Handle type="source" position={Position.Right} id="output" className="!bg-neutral-400 !w-2 !h-2 !border-none" />
                 </div>
            </div>
        </CustomNodeBase>
    );
}