// ChatOpenAINode.tsx
import React, { memo, useEffect, useCallback } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { CustomNodeBase } from './CustomNodeBase';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAgentwflowState } from '@/hooks/useAgentwflowState';
import { debounce } from 'lodash';

// Mapping from llmType to JSON name
const llmTypeToJsonName: { [key: string]: string } = {
  openai: 'chatOpenAI',
  claude: 'chatAnthropic',
};

// Default models for each llmType
const defaultModels: { [key: string]: string } = {
  openai: 'gpt-4-turbo-preview',
  claude: 'claude-3-5-sonnet-latest',
};

interface ChatOpenAINodeData {
  label?: string;
  llmType?: 'openai' | 'claude';
  modal?: string; // Note: 'modal' seems to be a typo in your code; should it be 'model'?
  temp?: number;
  [key: string]: any;
}

type ChatOpenAINode = Node<ChatOpenAINodeData, 'chat_model'>;

export const ChatOpenAINode = memo(({ id, data, selected, ...props }: NodeProps<ChatOpenAINode>) => {
  const { setNodes, modelsData, loadModels } = useAgentwflowState();

  // Load models if not already loaded
  useEffect(() => {
    if (!modelsData) {
      loadModels();
    }
  }, [modelsData, loadModels]);

  const onInfoClick = () => {
    console.log(`Info clicked for ChatOpenAI node: ${id}`);
  };

  const updateNodeData = useCallback(
    debounce((field: keyof ChatOpenAINodeData, value: string | number) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            const finalValue = field === 'temp' ? parseFloat(value as string) || 0 : value;
            return { ...node, data: { ...node.data, [field]: finalValue } };
          }
          return node;
        })
      );
    }, 300),
    [id, setNodes]
  );

  // Determine LLM type and corresponding models
  const llmType = data.llmType || 'openai';
  const jsonName = llmTypeToJsonName[llmType];
  const chatModels = modelsData?.chat?.find((item) => item.name === jsonName)?.models || [];
  const defaultModel = defaultModels[llmType];

  // Update model if the current one isn't available
  useEffect(() => {
    if (modelsData && chatModels.length > 0) {
      const availableModelNames = chatModels.map((m) => m.name);
      if (!data.modal || !availableModelNames.includes(data.modal)) {
        updateNodeData('modal', defaultModel as string);
      }
    }
  }, [llmType, modelsData, data.modal, defaultModel, updateNodeData, chatModels]);

  return (
    <CustomNodeBase
      id={id}
      data={data}
      selected={selected}
      nodeTypeIdentifier="chat_model"
      onInfoClick={onInfoClick}
      type={props.type}
      dragging={props.dragging}
      zIndex={props.zIndex}
      selectable={props.selectable}
      isConnectable={props.isConnectable}
      positionAbsoluteX={props.positionAbsoluteX}
      positionAbsoluteY={props.positionAbsoluteY}
      deletable={props.deletable}
      draggable={props.draggable}
    >
      <Handle type="source" position={Position.Bottom} id="output" />
      <div className="space-y-2">
        {/* LLM Type Selection */}
        <div className="space-y-1">
          <label className="text-xs text-neutral-400 block">LLM Type</label>
          <Select value={llmType} onValueChange={(value) => updateNodeData('llmType', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select LLM Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="claude">Anthropic Claude</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Model Selection */}
        <div className="space-y-1">
          <label className="text-xs text-neutral-400 block">Model</label>
          <Select
            value={data.modal || ''}
            onValueChange={(value) => updateNodeData('modal', value)}
            disabled={!modelsData} // Disable until models are loaded
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={modelsData ? "Select Model" : "Loading models..."} />
            </SelectTrigger>
            <SelectContent>
              {chatModels.map((model) => (
                <SelectItem key={model.name} value={model.name}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Temperature Input */}
        <div className="space-y-1">
          <label htmlFor={`temp-${id}`} className="text-xs text-neutral-400 block">
            Temperature
          </label>
          <Input
            id={`temp-${id}`}
            name="temp"
            type="number"
            step="0.1"
            min="0"
            max="2"
            className="nodrag bg-neutral-700 border-neutral-600 text-white text-xs px-2 py-1 h-auto rounded"
            value={data.temp ?? 0.7}
            onChange={(e) => updateNodeData('temp', e.target.value)}
          />
        </div>
      </div>
    </CustomNodeBase>
  );
});