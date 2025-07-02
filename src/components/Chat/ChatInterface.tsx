import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, Paperclip, Image, Zap } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { ChatMessage } from './ChatMessage';

export function ChatInterface() {
  const { messages, isLoading, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  const quickActions = [
    { text: "Create a todo app", icon: "📝" },
    { text: "Add a dark theme toggle", icon: "🌙" },
    { text: "Create a contact form", icon: "📧" },
    { text: "Add responsive navigation", icon: "📱" }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-medium text-gray-900">AI Assistant</h2>
        </div>
        <p className="text-sm text-gray-500 font-light">
          Chat with AI to build and modify your application files
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 1 && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-4 font-medium">Quick actions:</p>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => setInput(action.text)}
                  className="text-left p-4 text-sm bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-100 hover:border-gray-200"
                >
                  <span className="mr-3 text-base">{action.icon}</span>
                  <span className="text-gray-700">{action.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <div className="flex items-center space-x-3 text-gray-500 p-4 bg-gray-50 rounded-xl">
            <Loader className="w-5 h-5 animate-spin text-orange-500" />
            <span className="font-light">AI is thinking and may modify files...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe what you want to build or change..."
              className="w-full p-4 pr-16 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white transition-all duration-200 font-light"
              disabled={isLoading}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-2">
              <button
                type="button"
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
                title="Upload image"
              >
                <Image className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-3 text-xs text-gray-400 font-light">
          💡 Try: "Add a button that changes the background color" or "Create a new component"
        </div>
      </form>
    </div>
  );
}