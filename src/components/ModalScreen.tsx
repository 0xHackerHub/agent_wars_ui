import { Box } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function ModelsScreen(){
    const mockModels = [
      {
        name: "Claude 3.5 Sonnet",
        modified_at: "2024-03-20T10:00:00Z",
        size: 4096,
        details: {
          parameter_size: "7B",
          family: "Anthropic"
        }
      },
      {
        name: "GPT-4o",
        modified_at: "2024-03-19T15:30:00Z",
        size: 8192,
        details: {
          parameter_size: "7B",
          family: "OpenAI"
        }
      }
    ];
  
    return (
      <div className="flex flex-col h-full p-6 rounded-3xl">
        <div className="flex items-center mb-6">
          <Box className="w-5 h-5 mr-2 text-gray-600 dark:text-neutral-400" />
          <h2 className="text-xl font-medium text-gray-800 dark:text-neutral-200">Available Models</h2>
        </div>
        
        <div className="space-y-4">
          {mockModels.map((model) => (
            <div
              key={model.name}
              className="bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-neutral-800/50 backdrop-blur-xl rounded-2xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-neutral-200">
                    {model.name}
                  </h3>
                  <div className="mt-1 space-y-1">
                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                      Family: {model.details.family} • Size: {model.details.parameter_size}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                      Modified: {new Date(model.modified_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={true}
                  disabled={true}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };