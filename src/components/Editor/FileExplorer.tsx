import React from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen 
} from 'lucide-react';
import { ProjectFile } from '../../types';

interface FileExplorerProps {
  files: ProjectFile[];
  activeFile: ProjectFile | null;
  onFileSelect: (file: ProjectFile) => void;
  expandedFolders: Set<string>;
  onToggleFolder: (folderId: string) => void;
}

export function FileExplorer({ 
  files, 
  activeFile, 
  onFileSelect, 
  expandedFolders, 
  onToggleFolder 
}: FileExplorerProps) {
  const renderFile = (file: ProjectFile, depth = 0) => {
    const isExpanded = expandedFolders.has(file.id);
    const isActive = activeFile?.id === file.id;

    return (
      <div key={file.id}>
        <div
          className={`flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-100 cursor-pointer transition-all duration-200 ${
            isActive ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500' : 'text-gray-600'
          }`}
          style={{ paddingLeft: `${16 + depth * 20}px` }}
          onClick={() => {
            if (file.type === 'folder') {
              onToggleFolder(file.id);
            } else {
              onFileSelect(file);
            }
          }}
        >
          {file.type === 'folder' ? (
            <>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-orange-500" />
              ) : (
                <Folder className="w-4 h-4 text-gray-400" />
              )}
            </>
          ) : (
            <>
              <div className="w-4" />
              <File className="w-4 h-4 text-gray-400" />
            </>
          )}
          <span className="text-sm font-light">{file.name}</span>
        </div>
        
        {file.type === 'folder' && isExpanded && file.children && (
          <div>
            {file.children.map(child => renderFile(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Files</h3>
      </div>
      <div className="py-2">
        {files.map(file => renderFile(file))}
      </div>
    </div>
  );
}