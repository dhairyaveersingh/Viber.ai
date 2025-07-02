import React, { useEffect, useRef } from 'react';
import { File } from 'lucide-react';
import { ProjectFile } from '../../types';
import { useSettings } from '../../hooks/useSettings';

interface CodeEditorProps {
  file: ProjectFile | null;
  onChange: (content: string) => void;
}

export function CodeEditor({ file, onChange }: CodeEditorProps) {
  const { settings } = useSettings();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && file) {
      textareaRef.current.value = file.content;
    }
  }, [file]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (file) {
      onChange(e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      // Insert tab character
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      textarea.value = newValue;
      textarea.selectionStart = textarea.selectionEnd = start + 2;
      
      if (file) {
        onChange(newValue);
      }
    }
  };

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <File className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="font-light">Select a file to start editing</p>
        </div>
      </div>
    );
  }

  const lineCount = file.content.split('\n').length;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <File className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">{file.name}</span>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-md">{file.language}</span>
        </div>
      </div>
      
      <div className="flex-1 relative overflow-hidden">
        {settings.showLineNumbers && (
          <div className="absolute left-0 top-0 w-16 h-full bg-gray-50 border-r border-gray-200 p-3 text-right text-xs text-gray-400 font-mono select-none overflow-hidden">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i + 1} style={{ lineHeight: '1.6', fontSize: `${settings.fontSize}px` }}>
                {i + 1}
              </div>
            ))}
          </div>
        )}
        
        <textarea
          ref={textareaRef}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full h-full bg-white text-gray-800 font-mono resize-none border-none outline-none"
          style={{ 
            tabSize: 2,
            lineHeight: '1.6',
            fontSize: `${settings.fontSize}px`,
            paddingLeft: settings.showLineNumbers ? '5rem' : '1.5rem',
            paddingTop: '1.5rem',
            paddingRight: '1.5rem',
            paddingBottom: '1.5rem'
          }}
          spellCheck={false}
          placeholder="Start typing..."
        />
      </div>
    </div>
  );
}