// useAgentwflowState.ts
import { create } from "zustand";
import { Node, Edge, XYPosition } from "@xyflow/react";
import React from "react";
import { produce } from "immer";
import { nanoid } from 'nanoid';
import { getModels } from '@/lib/getModel';

interface ModelInfo {
  label: string;
  name: string;
  description?: string;
}

interface ChatModel {
  name: string;
  models: ModelInfo[];
}

interface ModelsData {
  chat: ChatModel[];
  llm: ChatModel[];
  embedding: ChatModel[];
}

// --- Define OutputType ---
export type OutputType = {
  type: "output" | "error" | "success" | "info" | "warning";
  message: string;
  preMessage?: string;
  aoMessage?: any; // Consider a more specific type if possible
};

// --- Define NodeTypeInfo (Export this type) ---
export interface NodeTypeInfo {
  id: string; // Unique identifier for the type (e.g., 'chatopenai')
  name: string; // Display name (e.g., 'ChatOpenAI')
  category: string; // Category (e.g., 'Chat Models')
  description: string; // Short description
  type: // Technical type used by React Flow
    | "chat_model"
    | "worker"
    | "supervisor"
    | "document_loader"
    | "embedding"
    | "graph"
    | "llm"
    | "memory"
    | "moderation"
    | "multi_agent"
    | "chain"
    | string; // Allow custom types
  icon?: React.ReactNode; // Optional icon component
  version: string; // Version of the node/component
  documentationUrl?: string; // Link to docs
  inputs?: { name: string; type: string; description: string }[]; // Expected inputs
  outputs?: { name: string; type: string; description: string }[]; // Produced outputs
  parameters?: { name: string; type: string; description: string; required?: boolean }[]; // Configurable parameters
}

// --- Define AgentwflowState Interface ---
interface AgentwflowState {
  // Panel Refs and Toggles
  modelsData: ModelsData | null;
  loadModels: () => void;
  consoleRef: React.RefObject<HTMLDivElement> | null;
  sidebarRef: React.RefObject<HTMLDivElement> | null;
  setConsoleRef: (ref: React.RefObject<HTMLDivElement>) => void;
  setSidebarRef: (ref: React.RefObject<HTMLDivElement>) => void;
  isPropertiesOpen: boolean;
  toggleProperties: () => void;
  isConsoleOpen: boolean;
  toggleConsole: () => void;

  // Console Outputs
  outputs: OutputType[];
  addOutput: (output: OutputType) => void;
  clearOutputs: () => void;

  // Flow Execution State
  flowIsRunning: boolean;
  setFlowIsRunning: (running: boolean) => void;
  runningNodes: string[];
  successNodes: string[];
  errorNodes: string[];
  addRunningNode: (nodeId: string) => void;
  addSuccessNode: (nodeId: string) => void;
  addErrorNode: (nodeId: string) => void;
  resetNodeStatus: (nodeId: string) => void;
  resetAllNodeStatuses: () => void;

  // Nodes and Edges
  nodes: Node[];
  setNodes: (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void;
  edges: Edge[];
  setEdges: (edges: Edge[] | ((prevEdges: Edge[]) => Edge[])) => void;
  addNode: (node: Node) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;

  // Active Element
  activeNodeId: string | null;
  setActiveNodeId: (nodeId: string | null) => void;
  getActiveNode: () => Node | undefined;

  // Available Node Types (Using the detailed NodeTypeInfo)
  nodeTypeRegistry: Map<string, NodeTypeInfo>; // Use a Map for efficient lookup
  getNodeTypeInfo: (typeId: string) => NodeTypeInfo | undefined; // Function to get info by ID
}

// --- Initial Node Type Definitions (Using NodeTypeInfo) ---
const initialNodeTypeDetails: NodeTypeInfo[] = [
   {
    id: "chatopenai", name: "ChatOpenAI", category: "Chat Models", description: "OpenAI GPT model for chat interactions", type: "chat_model", version: "1.2.0",
    parameters: [ { name: 'modelName', type: 'string', description: 'Specify the OpenAI model', required: true}, { name: 'temperature', type: 'number', description: 'Controls randomness (0-1)', required: false} ],
    inputs: [{ name: 'Input', type: 'string', description: 'Prompt or messages'}],
    outputs: [{ name: 'Output', type: 'string', description: 'Generated response'}],
   },
  {
    id: "chatanthropic", name: "ChatAnthropic", category: "Chat Models", description: "Anthropic Claude model for chat interactions", type: "chat_model", version: "1.1.0",
    parameters: [ { name: 'modelName', type: 'string', description: 'Specify the Anthropic model', required: true}, { name: 'temperature', type: 'number', description: 'Controls randomness (0-1)', required: false} ],
    inputs: [{ name: 'Input', type: 'string', description: 'Prompt or messages'}],
    outputs: [{ name: 'Output', type: 'string', description: 'Generated response'}],
  },
  { id: "openai_moderation", name: "OpenAI Moderation", category: "Moderation", description: "Check content against OpenAI's content policy", type: "moderation", version: "1.0.0" },
  {
    id: "worker", name: "Worker", category: "Multi Agents", description: "Worker agent that can execute tools", type: "worker", version: "0.9.0",
    parameters: [ { name: 'workerName', type: 'string', description: 'Unique name for the worker', required: true}, { name: 'workerPrompt', type: 'string', description: 'System prompt for the worker', required: true}, { name: 'maxIterations', type: 'number', description: 'Max steps worker can take', required: false} ],
    inputs: [{ name: 'Task', type: 'any', description: 'Input task or data'}, { name: 'Tools', type: 'array', description: 'List of tools'}, { name: 'Supervisor', type: 'string', description: 'Connected Supervisor ID'}],
    outputs: [{ name: 'Result', type: 'any', description: 'Output from the worker'}],
   },
  {
    id: "supervisor", name: "Supervisor", category: "Multi Agents", description: "Orchestrates worker agents", type: "supervisor", version: "1.0.5",
    parameters: [ { name: 'supervisorName', type: 'string', description: 'Name for the supervisor', required: true} ],
    inputs: [{ name: 'Goal', type: 'string', description: 'Overall objective'}, { name: 'Tool Calling Chat Model', type: 'string', description: 'Chat model ID'}, { name: 'Agent Memory', type: 'string', description: 'Memory ID'}],
    outputs: [{ name: 'Final Output', type: 'any', description: 'Result of the orchestration'}],
  },
  { id: "pdf_loader", name: "PDF Loader", category: "Document Loaders", description: "Load documents from PDF files", type: "document_loader", version: "1.0.0" },
  { id: "csv_loader", name: "CSV Loader", category: "Document Loaders", description: "Load and parse CSV files", type: "document_loader", version: "1.0.0" },
  { id: "openai_embeddings", name: "OpenAI Embeddings", category: "Embeddings", description: "Generate embeddings using OpenAI", type: "embedding", version: "1.0.0" },
  { id: "knowledge_graph", name: "Knowledge Graph", category: "Graph", description: "Create and query knowledge graphs", type: "graph", version: "1.0.0" },
  { id: "gpt4", name: "GPT-4", category: "LLMs", description: "OpenAI GPT-4 language model", type: "llm", version: "1.0.0" }, // Could add more LLMs
  { id: "agent_memory", name: "Agent Memory", category: "Memory", description: "Store and retrieve conversation history", type: "memory", version: "1.0.0" },
  { id: "retrieval_chain", name: "Retrieval Chain", category: "Chains", description: "Chain for document retrieval and QA", type: "chain", version: "1.0.0" },
];

// Create the registry Map from the detailed array
const nodeTypeRegistry = new Map<string, NodeTypeInfo>(
  initialNodeTypeDetails.map(nodeType => [nodeType.id, nodeType])
);

// --- Create Zustand Store ---
export const useAgentwflowState = create<AgentwflowState>((set, get) => ({
  modelsData: null,
  loadModels: async () => {
    try {
      const data = await getModels();
      set({ modelsData: data });
    } catch (error) {
      // Error is logged in getModels; we can decide to set a fallback here if needed
      set({ modelsData: null });
    }
  },
  // Panel Refs and Toggles
  consoleRef: null,
  setConsoleRef: (ref) => set({ consoleRef: ref }),
  sidebarRef: null,
  setSidebarRef: (ref) => set({ sidebarRef: ref }),
  isPropertiesOpen: true,
  toggleProperties: () => set((state) => ({ isPropertiesOpen: !state.isPropertiesOpen })),
  isConsoleOpen: false,
  toggleConsole: () => set((state) => ({ isConsoleOpen: !state.isConsoleOpen })),

  // Console Outputs
  outputs: [],
  addOutput: (output) => set(produce((state: AgentwflowState) => { state.outputs.push(output); })),
  clearOutputs: () => set({ outputs: [] }),

  // Flow Execution State
  flowIsRunning: false,
  setFlowIsRunning: (running) => set({ flowIsRunning: running }),
  runningNodes: [],
  successNodes: [],
  errorNodes: [],
  addRunningNode: (nodeId) => set(produce((state: AgentwflowState) => {
    state.resetNodeStatus(nodeId);
    if (!state.runningNodes.includes(nodeId)) state.runningNodes.push(nodeId);
  })),
  addSuccessNode: (nodeId) => set(produce((state: AgentwflowState) => {
    state.runningNodes = state.runningNodes.filter(id => id !== nodeId);
    if (!state.successNodes.includes(nodeId)) state.successNodes.push(nodeId);
  })),
  addErrorNode: (nodeId) => set(produce((state: AgentwflowState) => {
    state.runningNodes = state.runningNodes.filter(id => id !== nodeId);
    if (!state.errorNodes.includes(nodeId)) state.errorNodes.push(nodeId);
  })),
  resetNodeStatus: (nodeId) => set(produce((state: AgentwflowState) => {
    state.runningNodes = state.runningNodes.filter(id => id !== nodeId);
    state.successNodes = state.successNodes.filter(id => id !== nodeId);
    state.errorNodes = state.errorNodes.filter(id => id !== nodeId);
  })),
  resetAllNodeStatuses: () => set({ runningNodes: [], successNodes: [], errorNodes: [] }),

  // Nodes and Edges
  nodes: [],
  setNodes: (nodesUpdater) => set(produce((state: AgentwflowState) => {
      if (typeof nodesUpdater === 'function') {
          state.nodes = nodesUpdater(state.nodes);
      } else {
          state.nodes = nodesUpdater;
      }
      if (state.activeNodeId && !state.nodes.find(n => n.id === state.activeNodeId)) {
          state.activeNodeId = null;
      }
  })),
  edges: [],
  setEdges: (edgesUpdater) => set(produce((state: AgentwflowState) => {
      if (typeof edgesUpdater === 'function') {
          state.edges = edgesUpdater(state.edges);
      } else {
          state.edges = edgesUpdater;
      }
  })),
   addNode: (node) => set(produce((state: AgentwflowState) => { state.nodes.push(node); })),
  deleteNode: (nodeId) => set(produce((state: AgentwflowState) => {
    state.nodes = state.nodes.filter((node) => node.id !== nodeId);
    state.edges = state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
    if (state.activeNodeId === nodeId) {
      state.activeNodeId = null;
    }
    state.resetNodeStatus(nodeId);
  })),
  duplicateNode: (nodeId) => set(produce((state: AgentwflowState) => {
    const nodeToDuplicate = state.nodes.find((node) => node.id === nodeId);
    if (nodeToDuplicate) {
      const newNodeId = `${nodeToDuplicate.type}_${nanoid(6)}`; // More robust unique ID
      const newNode: Node = {
        ...nodeToDuplicate,
        id: newNodeId,
        position: {
          x: nodeToDuplicate.position.x + 40, // Offset slightly more
          y: nodeToDuplicate.position.y + 40,
        },
        selected: false,
        data: JSON.parse(JSON.stringify(nodeToDuplicate.data || {})), // Deep copy data
      };
      state.nodes.push(newNode);
    }
  })),

  // Active Element
  activeNodeId: null,
  setActiveNodeId: (nodeId) => set({ activeNodeId: nodeId }),
  getActiveNode: () => {
    const state = get();
    return state.nodes.find(node => node.id === state.activeNodeId);
  },

  // Available Node Types (Using the detailed registry)
  nodeTypeRegistry: nodeTypeRegistry, // Store the Map
  getNodeTypeInfo: (typeId) => { // Function to retrieve info
    return get().nodeTypeRegistry.get(typeId);
  },

  // --- Deprecated/Unused fields from original hook - can be removed ---
  // toggleSidebar: (open) => { ... }, // Replaced by specific panel toggles if needed
  // attach: undefined,
  // setAttach: (attach) => set({ attach }),
  // availableNodes: [], // Replaced by nodeTypeRegistry
  // setAvailableNodes: (nodes) => set({ availableNodes: nodes }),
  // order: {},
  // setOrder: (order) => set({ order }),
  // activeProcess: "",
  // setActiveProcess: (process) => set({ activeProcess: process }),
  // activeNode: undefined, // Replaced by activeNodeId and getActiveNode
  // setActiveNode: (node) => set({ activeNode: node }),
  // resetNodes: () => set({ runningNodes: [], successNodes: [], errorNodes: [] }), // Use resetAllNodeStatuses
  // resetNode: (id) => set((state) => ({...})), // Use resetNodeStatus
}));

// Optional: Helper hook to get specific node type info easily
export const useNodeTypeInfo = (typeId: string | undefined): NodeTypeInfo | undefined => {
  const getNodeTypeInfo = useAgentwflowState((state) => state.getNodeTypeInfo);
  return typeId ? getNodeTypeInfo(typeId) : undefined;
};

export const useNodeStatus = (nodeId: string): 'running' | 'success' | 'error' | 'idle' => {
  const runningNodes = useAgentwflowState((state) => state.runningNodes);
  const successNodes = useAgentwflowState((state) => state.successNodes);
  const errorNodes = useAgentwflowState((state) => state.errorNodes);

  if (runningNodes.includes(nodeId)) return 'running';
  if (successNodes.includes(nodeId)) return 'success';
  if (errorNodes.includes(nodeId)) return 'error';
  return 'idle';
};