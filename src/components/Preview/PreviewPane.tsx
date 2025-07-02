import React, { useMemo, useState } from 'react';
import { Monitor, Smartphone, Tablet, RotateCcw, ExternalLink } from 'lucide-react';
import { Project } from '../../types';

interface PreviewPaneProps {
  project: Project | null;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

export function PreviewPane({ project }: PreviewPaneProps) {
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');
  const [key, setKey] = useState(0);

  const previewContent = useMemo(() => {
    if (!project) return null;

    // Find the main App component
    const appFile = project.files
      .flatMap(file => file.type === 'folder' ? file.children || [] : [file])
      .find(file => file.name === 'App.tsx' || file.name === 'App.jsx');

    if (!appFile) return 'No App component found';

    // Create a comprehensive HTML preview with better styling
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview - ${project.name}</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { 
      margin: 0; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; 
      background: #f8fafc;
    }
    .error-boundary {
      padding: 2rem;
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 0.5rem;
      margin: 1rem;
      color: #991b1b;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef } = React;
    
    // Error boundary component
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      
      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }
      
      componentDidCatch(error, errorInfo) {
        console.error('Preview error:', error, errorInfo);
      }
      
      render() {
        if (this.state.hasError) {
          return (
            <div className="error-boundary">
              <h2>Preview Error</h2>
              <p>There was an error rendering your component:</p>
              <pre>{this.state.error?.toString()}</pre>
            </div>
          );
        }
        
        return this.props.children;
      }
    }
    
    try {
      ${appFile.content.replace('export default App;', '')}
      
      ReactDOM.render(
        <ErrorBoundary>
          <App />
        </ErrorBoundary>, 
        document.getElementById('root')
      );
    } catch (error) {
      document.getElementById('root').innerHTML = \`
        <div class="error-boundary">
          <h2>Compilation Error</h2>
          <p>There was an error compiling your component:</p>
          <pre>\${error.toString()}</pre>
        </div>
      \`;
    }
  </script>
</body>
</html>`;
  }, [project, key]);

  const getViewportClasses = () => {
    switch (viewportSize) {
      case 'mobile':
        return 'w-80 h-[600px]';
      case 'tablet':
        return 'w-[768px] h-[600px]';
      default:
        return 'w-full h-full';
    }
  };

  const refresh = () => {
    setKey(prev => prev + 1);
  };

  const openInNewTab = () => {
    if (previewContent) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(previewContent);
        newWindow.document.close();
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Live Preview</h3>
          
          <div className="flex items-center space-x-3">
            <div className="flex bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setViewportSize('desktop')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewportSize === 'desktop'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Desktop"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewportSize('tablet')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewportSize === 'tablet'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Tablet"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewportSize('mobile')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewportSize === 'mobile'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Mobile"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={refresh}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              title="Refresh"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={openInNewTab}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 bg-gray-100 flex items-center justify-center">
        {previewContent ? (
          <div className={`${getViewportClasses()} bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 border border-gray-200`}>
            <iframe
              key={key}
              srcDoc={previewContent}
              className="w-full h-full border-none"
              title="App Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <Monitor className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-light">No project loaded</p>
            <p className="text-sm mt-2 font-light">Create or open a project to see the preview</p>
          </div>
        )}
      </div>
    </div>
  );
}