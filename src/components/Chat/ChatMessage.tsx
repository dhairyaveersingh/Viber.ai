import React from 'react';
import { User, Bot, FileText, Code } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Check if message contains file modifications
  const hasFileModifications = message.content.includes('<FILE_MODIFICATION>');

  const renderContent = () => {
    if (hasFileModifications) {
      // Extract and display file modifications separately
      const parts = message.content.split(/(<FILE_MODIFICATION>.*?<\/FILE_MODIFICATION>)/gs);
      
      return parts.map((part, index) => {
        if (part.includes('<FILE_MODIFICATION>')) {
          const pathMatch = part.match(/<FILE_PATH>(.*?)<\/FILE_PATH>/s);
          const contentMatch = part.match(/<FILE_CONTENT>(.*?)<\/FILE_CONTENT>/s);
          
          if (pathMatch && contentMatch) {
            const filePath = pathMatch[1].trim();
            const fileContent = contentMatch[1].trim();
            
            return (
              <div key={index} className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-2 mb-3">
                  <FileText className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Modified: {filePath}
                  </span>
                </div>
                <pre className="text-xs bg-white p-3 rounded-lg border border-gray-200 overflow-x-auto text-gray-800 font-mono">
                  <code>{fileContent}</code>
                </pre>
              </div>
            );
          }
        }
        
        return part ? (
          <div key={index} className="whitespace-pre-wrap">
            {part}
          </div>
        ) : null;
      });
    }

    return <div className="whitespace-pre-wrap">{message.content}</div>;
  };

  return (
    <div className={`flex space-x-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      
      <div className={`max-w-[75%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`p-4 rounded-xl ${
            isUser
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-gray-50 text-gray-800 border border-gray-200'
          }`}
        >
          <div className="text-sm font-light leading-relaxed">
            {renderContent()}
          </div>
          
          {hasFileModifications && !isUser && (
            <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
              <Code className="w-3 h-3" />
              <span>Files updated automatically</span>
            </div>
          )}
        </div>
        <div className={`text-xs text-gray-400 mt-2 font-light ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 bg-gray-400 rounded-xl flex items-center justify-center shadow-sm">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
}