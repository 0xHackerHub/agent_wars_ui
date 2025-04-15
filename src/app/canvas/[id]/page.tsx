"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAgentwflowState } from "@/hooks/useAgentwflowState";
import { NodeSidebar } from "@/components/canvas/NodeSidebar";
import { CanvasArea } from "@/components/canvas/CanvasArea";
import { NodeProperties } from "@/components/canvas/NodeProperties";
import { Console } from "@/components/canvas/Console";
import { Button } from "@/components/ui/button";
import { Settings, ArrowLeft, PanelRightClose, PanelLeftClose, Terminal, Play, RefreshCw } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"; // Import resizable components
import { ReactFlowProvider } from "@xyflow/react"; // Import ReactFlowProvider


// Helper component for conditional rendering with ResizablePanel
const ResizablePanelConditional = ({ children, isVisible, ...props }: any) => {
    if (!isVisible) return null;
    return <ResizablePanel {...props}>{children}</ResizablePanel>;
};

interface WorkerNodeData {
  label?: string;
  workerName?: string;
  workerPrompt?: string; // Used as 'description'
  maxIterations?: number; // Used as 'callCount'
  selectedTool?: string; // Used as 'toolName'
  supervisor?: string;
  llm?: string;
}

export default function CanvasEditor({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = React.use(paramsPromise); // Resolve the promise
  const [title, setTitle] = useState("Untitled Agent"); // Add editable title later
  const [isDark, setIsDark] = useState(true); // Assuming dark theme default

  const {
    nodes, // Get nodes from the store
    isPropertiesOpen, toggleProperties,
    isConsoleOpen, toggleConsole,
    setFlowIsRunning, // Action to set running state
    flowIsRunning, runningNodes, errorNodes // Status flags
} = useAgentwflowState();

   // State for the button icon
   const [isRunning, setIsRunning] = useState(false);
   const [runStatus, setRunStatus] = useState<'idle' | 'success' | 'error'>('idle');

   // Determine overall status for indicator
   const getFlowStatus = () => {
     if (isRunning || flowIsRunning || runningNodes.length > 0) return 'running'; // Use local isRunning too
     if (errorNodes.length > 0) return 'error';
     return 'idle';
   }
   const flowStatus = getFlowStatus();

  // --- Handle Run Flow ---
  const handleRunFlow = useCallback(async () => {
    setIsRunning(true);
    setRunStatus('idle'); // Reset status on new run
    console.clear(); // Clear browser console for new run output
    console.log("[Flow] Starting flow execution...");

    // Find the first worker node
    const workerNode = nodes.find((n): n is Node<WorkerNodeData> => n.type === 'worker');

    if (!workerNode) {
      console.error("[Flow] No Worker node found in the flow.");
      setRunStatus('error');
      setIsRunning(false);
      return;
    }

    const { data } = workerNode;

    // --- Prepare MINIMAL Payload ---
    const toolName = data.selectedTool;
    const callCount = data.maxIterations ?? 1;
    const description = data.workerPrompt || `Execute task for tool: ${toolName || 'unknown'}`; // Fallback description

    if (!toolName) {
        console.error(`[Flow] Worker node (${data.workerName || workerNode.id}) has no tool selected.`);
        setRunStatus('error');
        setIsRunning(false);
        return;
    }

    const payload = {
      metadata: {
        toolName: toolName,
        callCount: callCount,
        description: description,
        // Explicitly do NOT include toolInput, nextToCall, amount etc. unless they
        // are *also* configured directly within the WorkerNode component's data
        // and needed by the generic backend prompt.
      }
    };

    console.log(`[Flow] Found worker: ${data.workerName || workerNode.id}. Sending Tool: ${payload.metadata.toolName}, Iterations: ${payload.metadata.callCount}`);
    console.log("[Flow] Sending request to backend /api/flow...");

    try {
      const response = await fetch('/api/flow', { // Ensure this matches your backend route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), // Send minimal payload
      });

      // --- Handle Initial Response & Errors ---
      if (!response.ok) {
        // Try to parse error message from backend if available
        let errorMsg = `HTTP error! Status: ${response.status}`;
        try {
            const errorBody = await response.json();
            errorMsg = `Backend Error: ${errorBody.error || errorMsg}`;
        } catch (e) { /* Ignore parsing error, stick with HTTP status */ }
        throw new Error(errorMsg); // Throw to be caught below
      }

      // --- Handle Streaming Response TO BROWSER CONSOLE ---
      if (!response.body) {
          throw new Error("Response body is null.");
      }

      console.log("[Flow] Backend connection established. Reading stream...");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let receivedData = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          console.log(chunk); // <<< LOGGING DIRECTLY TO BROWSER CONSOLE
          receivedData = true;
        }
      }

      // --- Stream Finished Successfully ---
      console.log("[Flow] Stream finished.");
      if (!receivedData) {
           console.warn("[Flow] Stream finished, but no data was received.");
      }
      setRunStatus('success'); // Set success status

    } catch (error) {
      // --- Handle Fetch/Streaming Errors ---
      console.error("[Flow] Execution Error:", error);
      setRunStatus('error'); // Set error status
    } finally {
      // --- Cleanup ---
      setIsRunning(false); // Reset button state regardless of outcome
      console.log("[Flow] Execution attempt complete.");
    }
  }, [nodes]); // Dependency: nodes array


  return (
    // Wrap the entire editor in ReactFlowProvider
    <ReactFlowProvider>
      <div className={`flex h-screen overflow-hidden ${isDark ? "bg-neutral-950 text-white" : "bg-white text-black"}`}>

        {/* Main Resizable Layout */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">

          {/* Left Sidebar (Node Types) - Fixed Width */}
          <ResizablePanel defaultSize={18} minSize={15} maxSize={30} className="!overflow-auto">
            <div className={`h-full border-r ${ isDark ? "border-neutral-800 bg-neutral-900" : "border-gray-200 bg-gray-50" }`}>
              <NodeSidebar />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle className="bg-neutral-800 w-1.5 hover:bg-neutral-700 transition-colors"/>

          {/* Center Area (Canvas + Optional Console) */}
          <ResizablePanel defaultSize={62} minSize={30}>
            <ResizablePanelGroup direction="vertical">

              {/* Top Bar */}
              <div className={`relative h-12 ${ isDark ? "bg-neutral-900/80 backdrop-blur-sm border-neutral-800" : "bg-white/80 backdrop-blur-sm border-gray-200" } flex items-center justify-between px-4 z-20 border-b flex-shrink-0`}>
                {/* Left Side - Back Button, Title */}
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" className={`h-8 w-8 ${isDark ? "text-neutral-400 hover:text-white" : "text-gray-500 hover:text-black"}`}>
                      <ArrowLeft className="h-4 w-4" />
                   </Button>
                   <div className="flex items-center gap-1">
                     <span className="text-red-500">*</span> {/* Saved status indicator */}
                     <h1 className={`${isDark ? "text-white" : "text-black"} text-lg font-medium`}>{title}</h1>
                   </div>
                </div>

                {/* Right Side - Settings, Toggles */}
                <div className="flex items-center gap-1">
                   <Button variant="ghost" size="icon" className={`h-8 w-8 ${isDark ? "text-neutral-400" : "text-gray-500 hover:text-black"}`} title="Settings"
                   onClick={handleRunFlow}
                   disabled={isRunning}>
                     <Play className="h-4 w-4" />
                   </Button>
                    {/* Console Toggle */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 relative ${isDark ? "text-neutral-400 hover:text-white" : "text-gray-500 hover:text-black"} ${isConsoleOpen ? 'bg-neutral-700/50' : ''}`}
                      onClick={toggleConsole}
                      title={isConsoleOpen ? "Hide Console" : "Show Console"}
                    >
                      <Terminal className="h-4 w-4" />
                      {/* Status Indicator Dot */}
                      {flowStatus !== 'idle' && (
                         <span className={`absolute top-1 right-1 block h-2 w-2 rounded-full ring-2 ${isDark ? 'ring-neutral-900' : 'ring-white'} ${
                             flowStatus === 'running' ? 'bg-blue-500 animate-pulse' : 'bg-red-500' // Add pulse for running
                         }`} />
                      )}
                    </Button>
                    {/* Properties Panel Toggle */}
                    <Button
                       variant="ghost"
                       size="icon"
                       className={`h-8 w-8 ${isDark ? "text-neutral-400" : "text-gray-500 hover:text-black"} ${isPropertiesOpen ? 'bg-neutral-700/50' : ''}`}
                       onClick={toggleProperties}
                       title={isPropertiesOpen ? "Hide Properties" : "Show Properties"}
                    >
                        {isPropertiesOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                    </Button>
                </div>
              </div>

              {/* Canvas Area - Takes remaining space */}
              <ResizablePanel defaultSize={isConsoleOpen ? 70 : 100} minSize={20} className="relative">
                 <CanvasArea canvasId={params.id} />
              </ResizablePanel>

              {/* Conditionally Render Resizable Console Panel */}
               <ResizablePanelConditional isVisible={isConsoleOpen} minSize={10} defaultSize={30} maxSize={60} collapsible collapsedSize={0}>
                   {/* Add handle only if console is open */}
                   {isConsoleOpen && <ResizableHandle withHandle className="bg-neutral-800 h-1.5 hover:bg-neutral-700 transition-colors" />}
                   <Console />
               </ResizablePanelConditional>

            </ResizablePanelGroup>
          </ResizablePanel>
          {/* Conditionally Render Resizable Properties Panel */}
          <ResizablePanelConditional isVisible={isPropertiesOpen} defaultSize={20} minSize={15} maxSize={30} collapsible collapsedSize={0} order={3}>
              {/* Add handle only if properties panel is open */}
              {isPropertiesOpen && <ResizableHandle withHandle className="bg-neutral-800 w-1.5 hover:bg-neutral-700 transition-colors"/>}
              <NodeProperties />
          </ResizablePanelConditional>

        </ResizablePanelGroup>
      </div>
    </ReactFlowProvider> // Close ReactFlowProvider
  );
}