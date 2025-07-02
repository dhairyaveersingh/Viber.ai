import React, { useState } from 'react';
import { Header } from './components/Layout/Header';
import { StatusBar } from './components/Layout/StatusBar';
import { ChatInterface } from './components/Chat/ChatInterface';
import { FileExplorer } from './components/Editor/FileExplorer';
import { CodeEditor } from './components/Editor/CodeEditor';
import { PreviewPane } from './components/Preview/PreviewPane';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { useProject } from './hooks/useProject';
import { useSettings } from './hooks/useSettings';

function App() {
  const { currentProject, activeFile, setActiveFile, updateFileContent } = useProject();
  const { settings } = useSettings();
  const [expandedFolders, setExpandedFolders] = useState(new Set(['1'])); // src folder expanded by default
  const [showSettings, setShowSettings] = useState(false);
  const [status, setStatus] = useState<'ready' | 'building' | 'error'>('ready');

  const handleToggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileContentChange = (content: string) => {
    if (activeFile) {
      updateFileContent(activeFile.id, content);
    }
  };

  const handleSave = () => {
    setStatus('building');
    setTimeout(() => setStatus('ready'), 1000);
  };

  const handlePreview = () => {
    // Preview is already live, just focus the preview pane
    console.log('Preview focused');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header
        onOpenProject={() => console.log('Open project')}
        onOpenSettings={() => setShowSettings(true)}
        onSave={handleSave}
        onPreview={handlePreview}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat */}
        <div className="w-80 border-r border-gray-300 bg-white">
          <ChatInterface />
        </div>

        {/* Middle Panel - File Explorer & Editor */}
        <div className="flex-1 flex">
          <div className="w-64 border-r border-gray-300 bg-gray-50">
            {currentProject && (
              <FileExplorer
                files={currentProject.files}
                activeFile={activeFile}
                onFileSelect={setActiveFile}
                expandedFolders={expandedFolders}
                onToggleFolder={handleToggleFolder}
              />
            )}
          </div>
          
          <div className="flex-1 bg-white">
            <CodeEditor
              file={activeFile}
              onChange={handleFileContentChange}
            />
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-96 border-l border-gray-300 bg-white">
          <PreviewPane project={currentProject} />
        </div>
      </div>

      <StatusBar
        status={status}
        message={
          status === 'ready' 
            ? 'Ready' 
            : status === 'building' 
            ? 'Saving project...' 
            : 'Build error'
        }
        aiProvider={settings.aiProvider}
        model={settings.defaultModel}
      />

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

export default App;