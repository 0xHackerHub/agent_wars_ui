"use client"
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Settings, ArrowLeft, Plus, Minus, Maximize2, Lock } from "lucide-react";
import { NodeSidebar } from "@/components/canvas/NodeSidebar";
import { CanvasArea } from "@/components/canvas/CanvasArea";

export default function CanvasEditor({ params }: { params: { id: string } }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [title, setTitle] = useState("Untitled Agent");
  const [isDark, setIsDark] = useState(true);
  
  // Set up keyboard shortcuts for canvas controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space + drag for panning
      if (e.code === 'Space') {
        document.body.style.cursor = 'grab';
      }
      
      // Zoom in/out with keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=') {
          e.preventDefault();
          // Call zoomIn function
        } else if (e.key === '-') {
          e.preventDefault();
          // Call zoomOut function
        } else if (e.key === '0') {
          e.preventDefault();
          // Call resetView function
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        document.body.style.cursor = 'default';
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className={`flex h-screen ${isDark ? 'bg-neutral-950' : 'bg-white'}`}>
      {/* Left Sidebar - Node Types */}
      {showSidebar && (
        <div className={`w-64 border-r ${isDark ? 'border-neutral-800 bg-neutral-900' : 'border-gray-200 bg-gray-50'} p-4 transition-all`}>
          <NodeSidebar />
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        <CanvasArea canvasId={params.id} />
        
        {/* Top Bar */}
        <div className={`absolute top-0 left-0 right-0 h-12 ${isDark ? 'bg-neutral-900/50 backdrop-blur-sm border-neutral-800' : 'bg-white/50 backdrop-blur-sm border-gray-200'} flex items-center justify-between px-4 z-10 border-b`}>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-8 w-8 ${isDark ? 'text-neutral-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
              onClick={() => {}}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-red-500">*</span>
              <h1 className={`${isDark ? 'text-white' : 'text-black'} text-lg font-medium`}>{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-8 w-8 ${isDark ? 'text-neutral-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-8 w-8 ${isDark ? 'text-neutral-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM13 13V17H11V13H7V11H11V7H13V11H17V13H13Z" fill="currentColor"/>
              </svg>
            </Button>
          </div>
        </div>
        
    

        {/* Settings Sheet */}
        <Sheet open={showSettings} onOpenChange={setShowSettings}>
          <SheetContent className={`${isDark ? 'bg-neutral-900 text-white border-neutral-800' : 'bg-white text-black border-gray-200'}`}>
            <SheetHeader>
              <SheetTitle className={isDark ? 'text-white' : 'text-black'}>Agent Settings</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <div className="space-y-6">
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>Agent Name</h3>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-3 py-2 rounded ${
                      isDark 
                        ? 'bg-neutral-800 border-neutral-700 text-white' 
                        : 'bg-white border-gray-300 text-black'
                    }`}
                  />
                </div>
                
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>Theme</h3>
                  <div className="flex gap-2">
                    <button 
                      className={`px-3 py-1 rounded ${isDark ? 'bg-neutral-800 text-white border border-blue-500' : 'bg-gray-200 text-gray-700'}`}
                      onClick={() => setIsDark(true)}
                    >
                      Dark
                    </button>
                    <button 
                      className={`px-3 py-1 rounded ${!isDark ? 'bg-white text-black border border-blue-500' : 'bg-gray-200 text-gray-700'}`}
                      onClick={() => setIsDark(false)}
                    >
                      Light
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>API Integration</h3>
                  <div className={`p-3 rounded ${isDark ? 'bg-neutral-800' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                      Connect your agent to external services and APIs
                    </p>
                    <button className={`mt-2 text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      Manage API Keys
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>Deployment</h3>
                  <div className={`p-3 rounded ${isDark ? 'bg-neutral-800' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                      Configure how your agent is deployed and accessed
                    </p>
                    <button className={`mt-2 text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      Deployment Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}