// Inference Mode Routes
export type InferenceRoute = 'new-chat' | 'new-agent' | 'browse-agents';

// Operator Mode Routes
export type OperatorRoute = 'configuration' | 'connections' | 'status' | 'node-status' | 'operator-welcome';

// Combined Route Type
export type Route = 'chat' | 'new-chat' | 'new-agent' | 'browse-agents' | 'configuration' | 'connections' | 'status' | 'models' | 'node-status' | 'operator-welcome' | 'canvas'; 