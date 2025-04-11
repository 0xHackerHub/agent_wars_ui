import React, { useEffect, useRef } from 'react';
import { useAgentwflowState, OutputType } from "@/hooks/useAgentwflowState"; // Import OutputType
import { ScrollArea } from '../ui/scroll-area';
import { Trash2, ChevronDown, AlertTriangle, RefreshCw } from 'lucide-react';

export function Console() {
  const {
      outputs,
      clearOutputs,
      toggleConsole, // Function to hide console
      flowIsRunning,
      runningNodes,
      errorNodes,
  } = useAgentwflowState();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new output
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
       if (scrollViewport) {
         scrollViewport.scrollTop = scrollViewport.scrollHeight;
       }
    }
  }, [outputs]); // Trigger effect when outputs change

  const getStatusIndicator = () => {
    if (flowIsRunning || runningNodes.length > 0) {
        return <><RefreshCw size={14} className="animate-spin text-blue-400 mr-1" /> Running ({runningNodes.length})</>;
    }
    if (errorNodes.length > 0) {
        return <><AlertTriangle size={14} className="text-red-400 mr-1" /> Errors ({errorNodes.length})</>;
    }
    return "Idle";
  }

  return (
    <div className="bg-neutral-900 text-white border-t border-neutral-800 h-full flex flex-col">
      {/* Console Header */}
      <div className="flex justify-between items-center p-2 border-b border-neutral-800 px-4 h-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold">Console</h3>
          <span className={`text-xs px-1.5 py-0.5 rounded flex items-center
             ${(flowIsRunning || runningNodes.length > 0) ? 'bg-blue-900/50 text-blue-300' :
               (errorNodes.length > 0) ? 'bg-red-900/50 text-red-300' :
               'bg-neutral-700 text-neutral-300'}`}
          >
            {getStatusIndicator()}
          </span>
        </div>
        <div className="flex items-center gap-2">
           <button
             onClick={clearOutputs}
             className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-700"
             title="Clear Console"
           >
             <Trash2 size={16} />
           </button>
          <button
            onClick={toggleConsole} // Use the toggle function from store
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-700"
            title="Minimize Console"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      </div>

      {/* Console Output Area */}
      <ScrollArea className="flex-grow p-2" ref={scrollAreaRef}>
         <div className="output space-y-1 p-2 font-mono text-xs">
           {outputs.length === 0 && (
             <p className="text-neutral-500 italic">Console output will appear here...</p>
           )}
           {outputs.map((output: OutputType, index: number) => {
              let colorClass = "text-neutral-300";
              if (output.type === "error") colorClass = "text-red-400";
              else if (output.type === "success") colorClass = "text-green-400";
              else if (output.type === "warning") colorClass = "text-yellow-400";
              else if (output.type === "info") colorClass = "text-blue-400";

              return (
                <div key={index} className={`whitespace-pre-wrap ${colorClass}`}>
                  {output.preMessage && <span className="text-neutral-500 mr-1">{output.preMessage}</span>}
                  <span>{output.message}</span>
                  {/* Render complex aoMessage if needed */}
                  {/* {output.aoMessage && <pre>{JSON.stringify(output.aoMessage, null, 2)}</pre>} */}
                </div>
              );
            })}
         </div>
      </ScrollArea>
    </div>
  );
}