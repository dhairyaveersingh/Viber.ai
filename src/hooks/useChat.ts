import { useState } from 'react';
import { ChatMessage } from '../types';
import { useSettings } from './useSettings';
import { useProject } from './useProject';

export function useChat() {
  const { settings } = useSettings();
  const { currentProject, updateFileContent, setCurrentProject } = useProject();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant in Dyad. I can help you build applications, write code, debug issues, and modify your project files directly. What would you like to create or change today?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Check if API key is configured
      const apiKey = localStorage.getItem(`${settings.aiProvider}-api-key`);
      if (!apiKey) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `To use AI features, please configure your ${settings.aiProvider.toUpperCase()} API key in Settings. Click the Settings button in the top right corner and add your API key under the AI Provider section.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }

      // Create enhanced prompt with project context
      const enhancedPrompt = createEnhancedPrompt(content, currentProject);

      // Make API call based on provider with retry logic
      let response;
      if (settings.aiProvider === 'openai') {
        response = await callOpenAI(enhancedPrompt, apiKey);
      } else if (settings.aiProvider === 'anthropic') {
        response = await callAnthropic(enhancedPrompt, apiKey);
      } else if (settings.aiProvider === 'gemini') {
        response = await callGeminiWithRetry(enhancedPrompt, apiKey);
      } else {
        throw new Error(`Provider ${settings.aiProvider} not implemented yet`);
      }

      // Process the response for file modifications
      const { displayMessage, fileModifications } = processAIResponse(response);

      // Apply file modifications if any
      if (fileModifications.length > 0) {
        applyFileModifications(fileModifications);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: displayMessage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      let errorMessage = 'Failed to get AI response. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          errorMessage = `Rate limit exceeded for ${settings.aiProvider.toUpperCase()}. Please wait a moment and try again. Consider upgrading your API plan for higher limits.`;
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage = `Invalid API key for ${settings.aiProvider.toUpperCase()}. Please check your API key in Settings.`;
        } else if (error.message.includes('400')) {
          errorMessage = `Invalid request to ${settings.aiProvider.toUpperCase()}. Please try a different message or check your settings.`;
        } else {
          errorMessage = `${settings.aiProvider.toUpperCase()} API error: ${error.message}`;
        }
      }

      const errorChatMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const createEnhancedPrompt = (userMessage: string, project: any) => {
    if (!project) {
      return `You are an AI assistant that helps build applications. The user wants to: ${userMessage}

Please provide helpful guidance and if they want to create files or make changes, let them know they need to create a project first.`;
    }

    // Get current project context
    const projectContext = `
Current Project: ${project.name}
Type: ${project.type}
Files:
${getFileTreeString(project.files)}

Current file contents:
${getCurrentFileContents(project.files)}
`;

    return `You are an AI assistant that helps build applications. You can modify files directly by providing file modifications in a specific format.

${projectContext}

User Request: ${userMessage}

When you need to modify files, use this exact format:
<FILE_MODIFICATION>
<FILE_PATH>/src/App.tsx</FILE_PATH>
<FILE_CONTENT>
// Your complete file content here
</FILE_CONTENT>
</FILE_MODIFICATION>

You can include multiple FILE_MODIFICATION blocks for different files. Always provide the COMPLETE file content, not just the changes.

Provide a helpful explanation of what you're doing, then include the file modifications if needed.`;
  };

  const getFileTreeString = (files: any[], depth = 0): string => {
    return files.map(file => {
      const indent = '  '.repeat(depth);
      if (file.type === 'folder') {
        const children = file.children ? getFileTreeString(file.children, depth + 1) : '';
        return `${indent}📁 ${file.name}/\n${children}`;
      } else {
        return `${indent}📄 ${file.name} (${file.language || 'text'})`;
      }
    }).join('\n');
  };

  const getCurrentFileContents = (files: any[]): string => {
    const allFiles: any[] = [];
    
    const collectFiles = (fileList: any[]) => {
      fileList.forEach(file => {
        if (file.type === 'file') {
          allFiles.push(file);
        } else if (file.children) {
          collectFiles(file.children);
        }
      });
    };
    
    collectFiles(files);
    
    return allFiles.slice(0, 5).map(file => 
      `--- ${file.path} ---\n${file.content.slice(0, 500)}${file.content.length > 500 ? '...' : ''}`
    ).join('\n\n');
  };

  const processAIResponse = (response: string) => {
    const fileModifications: Array<{path: string, content: string}> = [];
    
    // Extract file modifications using regex
    const fileModRegex = /<FILE_MODIFICATION>\s*<FILE_PATH>(.*?)<\/FILE_PATH>\s*<FILE_CONTENT>(.*?)<\/FILE_CONTENT>\s*<\/FILE_MODIFICATION>/gs;
    let match;
    
    while ((match = fileModRegex.exec(response)) !== null) {
      const path = match[1].trim();
      const content = match[2].trim();
      fileModifications.push({ path, content });
    }
    
    // Remove file modification blocks from display message
    const displayMessage = response.replace(fileModRegex, '').trim();
    
    return { displayMessage, fileModifications };
  };

  const applyFileModifications = (modifications: Array<{path: string, content: string}>) => {
    if (!currentProject) return;

    modifications.forEach(({ path, content }) => {
      // Find the file by path
      const file = findFileByPath(currentProject.files, path);
      if (file) {
        updateFileContent(file.id, content);
      } else {
        // Create new file if it doesn't exist
        createNewFile(path, content);
      }
    });
  };

  const findFileByPath = (files: any[], targetPath: string): any => {
    for (const file of files) {
      if (file.path === targetPath) {
        return file;
      }
      if (file.children) {
        const found = findFileByPath(file.children, targetPath);
        if (found) return found;
      }
    }
    return null;
  };

  const createNewFile = (path: string, content: string) => {
    if (!currentProject) return;

    const pathParts = path.split('/').filter(Boolean);
    const fileName = pathParts[pathParts.length - 1];
    const language = getLanguageFromFileName(fileName);
    
    const newFile = {
      id: Date.now().toString(),
      name: fileName,
      path: path,
      content: content,
      type: 'file' as const,
      language: language
    };

    // For simplicity, add to the src folder if it exists, otherwise to root
    const updatedFiles = [...currentProject.files];
    const srcFolder = updatedFiles.find(f => f.name === 'src' && f.type === 'folder');
    
    if (srcFolder && srcFolder.children) {
      srcFolder.children.push(newFile);
    } else {
      updatedFiles.push(newFile);
    }

    setCurrentProject({
      ...currentProject,
      files: updatedFiles,
      lastModified: new Date()
    });
  };

  const getLanguageFromFileName = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx': case 'ts': return 'typescript';
      case 'jsx': case 'js': return 'javascript';
      case 'css': return 'css';
      case 'html': return 'html';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'text';
    }
  };

  const callOpenAI = async (content: string, apiKey: string): Promise<string> => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: settings.defaultModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI assistant that helps build applications. You can modify files directly using the FILE_MODIFICATION format. Always provide complete file contents when making changes.'
          },
          {
            role: 'user',
            content: content
          }
        ],
        max_tokens: settings.maxTokens,
        temperature: settings.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response received';
  };

  const callAnthropic = async (content: string, apiKey: string): Promise<string> => {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: settings.defaultModel,
        max_tokens: settings.maxTokens,
        messages: [
          {
            role: 'user',
            content: content
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || 'No response received';
  };

  const callGeminiWithRetry = async (content: string, apiKey: string, retries = 2): Promise<string> => {
    for (let i = 0; i <= retries; i++) {
      try {
        return await callGemini(content, apiKey);
      } catch (error) {
        if (error instanceof Error && error.message.includes('429') && i < retries) {
          // Wait with exponential backoff before retrying
          const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  };

  const callGemini = async (content: string, apiKey: string): Promise<string> => {
    // Use the correct Gemini API endpoint
    const model = settings.defaultModel.includes('gemini-') ? settings.defaultModel : 'gemini-1.5-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: content
              }
            ]
          }
        ],
        generationConfig: {
          temperature: settings.temperature,
          maxOutputTokens: Math.min(settings.maxTokens, 8192), // Gemini has a max limit
          topP: 0.8,
          topK: 40
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}${errorData.error?.message ? ` - ${errorData.error.message}` : ''}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else if (data.candidates && data.candidates[0]?.finishReason === 'SAFETY') {
      return 'Response was blocked due to safety filters. Please try rephrasing your request.';
    } else {
      throw new Error('No valid response received from Gemini API');
    }
  };

  return { messages, isLoading, sendMessage };
}