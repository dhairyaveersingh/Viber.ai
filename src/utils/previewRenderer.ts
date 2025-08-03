export interface PreviewFile {
  path: string;
  content: string;
  language: string;
}

export class PreviewRenderer {
  private iframe: HTMLIFrameElement | null = null;
  private files: Map<string, PreviewFile> = new Map();

  setIframe(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
  }

  updateFiles(files: PreviewFile[]) {
    this.files.clear();
    files.forEach(file => {
      this.files.set(file.path, file);
    });
    this.render();
  }

  private render() {
    if (!this.iframe) return;

    const appFile = this.files.get('/src/App.tsx') || this.files.get('/src/App.jsx');
    const cssFile = this.files.get('/src/index.css');
    
    if (!appFile) {
      this.renderError('No App component found');
      return;
    }

    const html = this.generateHTML(appFile, cssFile);
    
    // Use srcdoc for immediate rendering
    this.iframe.srcdoc = html;
  }

  private generateHTML(appFile: PreviewFile, cssFile?: PreviewFile): string {
    const cssContent = cssFile?.content || `
      @tailwind base;
      @tailwind components;
      @tailwind utilities;
      
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #f8fafc;
        font-weight: 300;
      }
      * { box-sizing: border-box; }
    `;

    // Clean and prepare the component code
    const componentCode = this.prepareComponentCode(appFile.content);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${cssContent}
    .preview-error {
      padding: 2rem;
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 0.75rem;
      margin: 1rem;
      color: #991b1b;
      font-family: monospace;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel">
    const { useState, useEffect, useRef, useCallback, useMemo } = React;
    
    // Error Boundary Component
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
      }
      
      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }
      
      componentDidCatch(error, errorInfo) {
        console.error('Preview Error:', error, errorInfo);
        this.setState({ errorInfo });
      }
      
      render() {
        if (this.state.hasError) {
          return (
            <div className="preview-error">
              <h2>Component Error</h2>
              <p><strong>Error:</strong> {this.state.error?.toString()}</p>
              {this.state.errorInfo && (
                <details style={{marginTop: '1rem'}}>
                  <summary>Error Details</summary>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </details>
              )}
            </div>
          );
        }
        
        return this.props.children;
      }
    }
    
    try {
      // Execute the component code
      ${componentCode}
      
      // Render the app
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(
        React.createElement(ErrorBoundary, null,
          React.createElement(App, null)
        )
      );
      
    } catch (error) {
      console.error('Compilation Error:', error);
      document.getElementById('root').innerHTML = \`
        <div class="preview-error">
          <h2>Compilation Error</h2>
          <p><strong>Error:</strong> \${error.toString()}</p>
          <p style="margin-top: 1rem; font-size: 0.875rem; opacity: 0.8;">
            Check your component syntax and try again.
          </p>
        </div>
      \`;
    }
  </script>
</body>
</html>`;
  }

  private prepareComponentCode(code: string): string {
    // Remove import statements (they're not needed in the browser environment)
    let cleanCode = code.replace(/^import.*$/gm, '');
    
    // Remove export default statement
    cleanCode = cleanCode.replace(/export\s+default\s+\w+;?\s*$/gm, '');
    
    // Clean up extra whitespace
    cleanCode = cleanCode.trim();
    
    return cleanCode;
  }

  private renderError(message: string) {
    if (!this.iframe) return;
    
    this.iframe.srcdoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              margin: 0; 
              padding: 2rem; 
              background: #f8fafc; 
            }
            .error { 
              background: #fee2e2; 
              border: 1px solid #fecaca; 
              border-radius: 0.75rem; 
              padding: 2rem; 
              color: #991b1b; 
            }
          </style>
        </head>
        <body>
          <div class="error">
            <h2>Preview Error</h2>
            <p>${message}</p>
          </div>
        </body>
      </html>
    `;
  }
}