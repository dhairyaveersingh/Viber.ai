import { useState, useEffect } from 'react';
import { Project, ProjectFile } from '../types';

const sampleProject: Project = {
  id: '1',
  name: 'My React App',
  description: 'A sample React application built with Viber.AI',
  path: '/projects/my-react-app',
  lastModified: new Date(),
  type: 'react',
  dependencies: {
    'react': '^18.3.1',
    'react-dom': '^18.3.1',
    'typescript': '^5.5.3'
  },
  files: [
    {
      id: '1',
      name: 'src',
      path: '/src',
      content: '',
      type: 'folder',
      children: [
        {
          id: '2',
          name: 'App.tsx',
          path: '/src/App.tsx',
          content: `import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [bgColor, setBgColor] = useState('from-orange-400 to-red-500');

  const colors = [
    'from-orange-400 to-red-500',
    'from-purple-400 to-pink-500',
    'from-blue-400 to-cyan-500',
    'from-green-400 to-emerald-500',
    'from-yellow-400 to-orange-500'
  ];

  const changeBg = () => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setBgColor(randomColor);
  };

  return (
    <div className={\`min-h-screen bg-gradient-to-br \${bgColor} flex items-center justify-center p-8\`}>
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200 max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-light text-gray-900 mb-3">
            Welcome to <span className="text-orange-500 font-medium">Viber.AI</span>
          </h1>
          <p className="text-gray-600 font-light">Your sleek AI-powered app builder</p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <p className="text-orange-500 text-sm mb-3 font-medium">Counter Example</p>
            <div className="text-4xl font-light text-gray-900 mb-6">{count}</div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setCount(count - 1)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-all duration-200 font-medium"
              >
                −
              </button>
              <button
                onClick={() => setCount(0)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-all duration-200 font-medium"
              >
                Reset
              </button>
              <button
                onClick={() => setCount(count + 1)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-all duration-200 font-medium"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={changeBg}
            className="w-full px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
          >
            🎨 Change Background
          </button>

          <div className="text-xs text-gray-500 space-y-1 font-light">
            <p>✨ Built with Viber.AI</p>
            <p>🚀 Ready for AI-powered development</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;`,
          type: 'file',
          language: 'typescript'
        },
        {
          id: '3',
          name: 'index.css',
          path: '/src/index.css',
          content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f8fafc;
  font-weight: 300;
}

* {
  box-sizing: border-box;
}`,
          type: 'file',
          language: 'css'
        }
      ]
    },
    {
      id: '4',
      name: 'package.json',
      path: '/package.json',
      content: `{
  "name": "viber-ai-sample-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "^5.5.3"
  }
}`,
      type: 'file',
      language: 'json'
    }
  ]
};

export function useProject() {
  const [currentProject, setCurrentProject] = useState<Project | null>(sampleProject);
  const [activeFile, setActiveFile] = useState<ProjectFile | null>(
    sampleProject.files[0]?.children?.[0] || null
  );

  const updateFileContent = (fileId: string, content: string) => {
    if (!currentProject) return;

    const updateFileInTree = (files: ProjectFile[]): ProjectFile[] => {
      return files.map(file => {
        if (file.id === fileId) {
          return { ...file, content };
        }
        if (file.children) {
          return { ...file, children: updateFileInTree(file.children) };
        }
        return file;
      });
    };

    const updatedProject = {
      ...currentProject,
      files: updateFileInTree(currentProject.files),
      lastModified: new Date()
    };

    setCurrentProject(updatedProject);
    
    if (activeFile?.id === fileId) {
      setActiveFile({ ...activeFile, content });
    }
  };

  return {
    currentProject,
    activeFile,
    setActiveFile,
    updateFileContent,
    setCurrentProject
  };
}