import { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface NodeType {
  id: string;
  name: string;
  category: string;
  description: string;
  type: 'chat_model' | 'worker' | 'supervisor' | 'document_loader' | 'embedding' | 'graph' | 'llm' | 'memory' | 'moderation' | 'multi_agent' | 'chain';
  icon?: React.ReactNode;
}

const nodeTypes: NodeType[] = [
  {
    id: 'chatopenai',
    name: 'ChatOpenAI',
    category: 'Chat Models',
    description: 'OpenAI GPT model for chat interactions',
    type: 'chat_model'
  },
  {
    id: 'chatanthropic',
    name: 'ChatAnthropic',
    category: 'Chat Models',
    description: 'Anthropic Claude model for chat interactions',
    type: 'chat_model'
  },
  {
    id: 'openai_moderation',
    name: 'OpenAI Moderation',
    category: 'Moderation',
    description: 'Check content against OpenAI\'s content policy',
    type: 'moderation'
  },
  {
    id: 'worker',
    name: 'Worker',
    category: 'Multi Agents',
    description: 'Worker agent that can execute tools',
    type: 'worker'
  },
  {
    id: 'supervisor',
    name: 'Supervisor',
    category: 'Multi Agents',
    description: 'Orchestrates worker agents',
    type: 'supervisor'
  },
  {
    id: 'pdf_loader',
    name: 'PDF Loader',
    category: 'Document Loaders',
    description: 'Load documents from PDF files',
    type: 'document_loader'
  },
  {
    id: 'csv_loader',
    name: 'CSV Loader',
    category: 'Document Loaders',
    description: 'Load and parse CSV files',
    type: 'document_loader'
  },
  {
    id: 'openai_embeddings',
    name: 'OpenAI Embeddings',
    category: 'Embeddings',
    description: 'Generate embeddings using OpenAI',
    type: 'embedding'
  },
  {
    id: 'knowledge_graph',
    name: 'Knowledge Graph',
    category: 'Graph',
    description: 'Create and query knowledge graphs',
    type: 'graph'
  },
  {
    id: 'gpt4',
    name: 'GPT-4',
    category: 'LLMs',
    description: 'OpenAI GPT-4 language model',
    type: 'llm'
  },
  {
    id: 'buffer_memory',
    name: 'Buffer Memory',
    category: 'Memory',
    description: 'Store and retrieve conversation history',
    type: 'memory'
  },
  {
    id: 'retrieval_chain',
    name: 'Retrieval Chain',
    category: 'Chains',
    description: 'Chain for document retrieval and QA',
    type: 'chain'
  }
];

export function NodeSidebar() {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Chat Models', 'Moderation']);
  const [nodeInfoHover, setNodeInfoHover] = useState<string | null>(null);
  const [showNodeInfoModal, setShowNodeInfoModal] = useState(false);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<NodeType | null>(null);
  
  const categories = Array.from(new Set(nodeTypes.map(node => node.category)));
  
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const filteredNodes = nodeTypes.filter(node =>
    node.name.toLowerCase().includes(search.toLowerCase()) ||
    node.description.toLowerCase().includes(search.toLowerCase())
  );
  
  const onDragStart = (e: React.DragEvent, node: NodeType) => {
    e.dataTransfer.setData('application/json', JSON.stringify(node));
  };
  
  const showNodeInfo = (node: NodeType, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeInfo(node);
    setShowNodeInfoModal(true);
  };
  
  const categorizedNodes = categories.map(category => ({
    category,
    nodes: filteredNodes.filter(node => node.category === category)
  })).filter(group => group.nodes.length > 0);
  
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-medium text-white mb-4">Add Nodes</h2>
      
      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
        <Input
          placeholder="Search nodes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 bg-neutral-800 border-neutral-700 text-white"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-1">
        {categorizedNodes.map(({ category, nodes }) => (
          <div key={category} className="mb-2">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-neutral-800/50 text-white"
            >
              <span className="font-medium">{category}</span>
              {expandedCategories.includes(category) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {expandedCategories.includes(category) && (
              <div className="pl-2 space-y-1 mt-1">
                {nodes.map(node => (
                  <div
                    key={node.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, node)}
                    className="p-2 rounded-md hover:bg-neutral-800 cursor-move flex flex-col relative"
                    onMouseEnter={() => setNodeInfoHover(node.id)}
                    onMouseLeave={() => setNodeInfoHover(null)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-white">{node.name}</div>
                      <Info 
                        size={14} 
                        className="text-neutral-500 hover:text-white cursor-pointer"
                        onClick={(e) => showNodeInfo(node, e)}
                      />
                    </div>
                    <div className="text-xs text-neutral-400">{node.description}</div>
                    
                    {/* Quick tooltip on hover */}
                    {nodeInfoHover === node.id && (
                      <div className="absolute left-full ml-2 top-0 bg-neutral-800 border border-neutral-700 rounded p-2 shadow-lg z-10 w-64">
                        <div className="text-sm font-medium text-white mb-1">{node.name}</div>
                        <div className="text-xs text-neutral-300 mb-2">{node.description}</div>
                        <div className="text-xs text-neutral-400">Type: {node.type}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Node Info Modal */}
      {showNodeInfoModal && selectedNodeInfo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowNodeInfoModal(false)}>
          <div className="bg-neutral-800 text-white border border-neutral-700 rounded-lg max-w-2xl w-full p-5 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-neutral-700 rounded-full flex items-center justify-center">
                  {selectedNodeInfo.type === 'chat_model' && selectedNodeInfo.name.includes('OpenAI') && (
                    <svg viewBox="0 0 24 24" width="24" height="24" className="text-white">
                      <path fill="currentColor" d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729z" />
                    </svg>
                  )}
                  {selectedNodeInfo.type === 'chat_model' && selectedNodeInfo.name.includes('Anthropic') && (
                    <div className="h-6 w-6 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold">
                      A
                    </div>
                  )}
                  {selectedNodeInfo.type === 'worker' && (
                    <div className="h-6 w-6 rounded-full bg-gray-600 flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="5" />
                        <path d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21" />
                      </svg>
                    </div>
                  )}
                  {selectedNodeInfo.type === 'moderation' && (
                    <div className="h-6 w-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">
                      M
                    </div>
                  )}
                </div>
                <div className="text-xl font-medium">{selectedNodeInfo.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs px-2 py-1 rounded bg-neutral-700">{`${selectedNodeInfo.id}_0`}</div>
                <div className="text-xs px-2 py-1 rounded bg-neutral-700">version {
                  selectedNodeInfo.type === 'chat_model' ? '8' : 
                  selectedNodeInfo.type === 'moderation' ? '3' : 
                  selectedNodeInfo.type === 'worker' ? '2' : '1'
                }</div>
              </div>
            </div>
            
            <p className="text-neutral-300 mb-6">
              {selectedNodeInfo.description}
              {selectedNodeInfo.type === 'chat_model' && 
                " Wrapper around large language models that use the Chat endpoint."
              }
              {selectedNodeInfo.type === 'moderation' && 
                " This component checks whether content complies with OpenAI's usage policies."
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
                  {selectedNodeInfo.type === 'chat_model' && selectedNodeInfo.name.includes('OpenAI') && (
                    <>
                      <tr className="border-b border-neutral-700">
                        <td className="py-3 px-4 text-sm">OpenAI API Key</td>
                        <td className="py-3 px-4 text-sm text-neutral-400">openAIApiKey</td>
                        <td className="py-3 px-4 text-sm text-neutral-400">string</td>
                      </tr>
                      <tr className="border-b border-neutral-700">
                        <td className="py-3 px-4 text-sm">Model Name</td>
                        <td className="py-3 px-4 text-sm text-neutral-400">modelName</td>
                        <td className="py-3 px-4 text-sm text-neutral-400">string</td>
                      </tr>
                      <tr className="border-b border-neutral-700">
                        <td className="py-3 px-4 text-sm">Temperature</td>
                        <td className="py-3 px-4 text-sm text-neutral-400">temperature</td>
                        <td className="py-3 px-4 text-sm text-neutral-400">number</td>
                      </tr>
                    </>
                  )}
                  {selectedNodeInfo.type === 'chat_model' && selectedNodeInfo.name.includes('Anthropic') && (
                    <>
                      <tr className="border-b border-neutral-700">
                        <td className="py-3 px-4 text-sm">Anthropic API Key</td>
                        <td className="py-3 px-4 text-sm text-neutral-400">anthropicApiKey</td>
                        <td className="py-3 px-4 text-sm text-neutral-400">string</td>
                      </tr>
                      <tr className="border-b border-neutral-700">
                        <td className="py-3 px-4 text-sm">Model Name</td>
                        <td className="py-3 px-4 text-sm text-neutral-400">modelName</td>
                        <td className="py-3 px-4 text-sm text-neutral-400">string</td>
                      </tr>
                    </>
                  )}
                  {selectedNodeInfo.type === 'moderation' && (
                    <>
                      <tr className="border-b border-neutral-700">
                        <td className="py-3 px-4 text-sm">OpenAI API Key</td>
                        <td className="py-3 px-4 text-sm text-neutral-400">openAIApiKey</td>
                        <td className="py-3 px-4 text-sm text-neutral-400">string</td>
                      </tr>
                      <tr className="border-b border-neutral-700">
                        <td className="py-3 px-4 text-sm">Error Message</td>
                        <td className="py-3 px-4 text-sm text-neutral-400">errorMessage</td>
                        <td className="py-3 px-4 text-sm text-neutral-400">string</td>
                      </tr>
                    </>
                  )}
                  {selectedNodeInfo.type === 'worker' && (
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
                    </>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded text-white"
                onClick={() => setShowNodeInfoModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}