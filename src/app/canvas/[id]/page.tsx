"use client";
import React, { useState, useRef, useEffect } from "react";
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

export default function CanvasEditor({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = React.use(paramsPromise); // Resolve the promise
  const [title, setTitle] = useState("Untitled Agent"); // Add editable title later
  const [isDark, setIsDark] = useState(true); // Assuming dark theme default

  const {
      isPropertiesOpen, toggleProperties,
      isConsoleOpen, toggleConsole,
      flowIsRunning, runningNodes, errorNodes // Get status from store
  } = useAgentwflowState();

  // Determine overall status for indicator
  const getFlowStatus = () => {
    if (flowIsRunning || runningNodes.length > 0) return 'running';
    if (errorNodes.length > 0) return 'error';
    return 'idle';
  }
  const flowStatus = getFlowStatus();

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
                   <Button variant="ghost" size="icon" className={`h-8 w-8 ${isDark ? "text-neutral-400" : "text-gray-500 hover:text-black"}`} title="Settings">
                     <Play className="h-4 w-4" />
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
                    {/* Console Toggle */}
                   <Button
                     variant="ghost"
                     size="icon"
                     className={`h-8 w-8 relative ${isDark ? "text-neutral-400 " : "text-gray-500 hover:text-black"} ${isConsoleOpen ? 'bg-neutral-700/50' : ''}`}
                     onClick={toggleConsole}
                     title={isConsoleOpen ? "Hide Console" : "Show Console"}
                   >
                     <Terminal className="h-4 w-4" />
                     {/* Status Indicator Dot */}
                     {flowStatus !== 'idle' && (
                        <span className={`absolute top-1 right-1 block h-2 w-2 rounded-full ring-2 ring-neutral-900 ${
                            flowStatus === 'running' ? 'bg-blue-500' : 'bg-red-500'
                        }`} />
                     )}
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