import React from 'react';
import { Handle, Position } from '@xyflow/react';

export const ChatModelNode = ({ data }: { data: any }) => {
  return (
    <div
      style={{
        padding: 10,
        background: '#ffffff',
        border: '1px solid #dddddd',
        borderRadius: 5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: 150,
      }}
    >
      {/* Input Handle on the Left */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      />

      {/* Node Content */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {data.name.includes('OpenAI') && (
          <svg viewBox="0 0 24 24" width="24" height="24" className="text-black">
            <path
              fill="currentColor"
              d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729z"
            />
          </svg>
        )}
        {data.name.includes('Anthropic') && (
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            A
          </div>
        )}
        <span>{data.name}</span>
      </div>

      {/* Output Handle on the Right */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      />
    </div>
  );
};