export default function NewAgentScreen(){
    return (
      <div className="flex flex-col h-full p-6 rounded-3xl">
        <h1 className="text-2xl font-semibold mb-4">New Agent</h1>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-medium">Create a New Agent</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              Design and configure a new AI agent with custom capabilities and behaviors.
            </p>
          </div>
        </div>
      </div>
    );
  };