export interface AIProvider {
  id: string;
  name: string;
  apiKey?: string;
  baseUrl?: string;
  models: AIModel[];
  isLocal?: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  contextLength: number;
  costPerToken?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  tokens?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  path: string;
  lastModified: Date;
  type: 'react' | 'vue' | 'vanilla' | 'node';
  files: ProjectFile[];
  dependencies: Record<string, string>;
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  type: 'file' | 'folder';
  language?: string;
  children?: ProjectFile[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  aiProvider: string;
  defaultModel: string;
  maxTokens: number;
  temperature: number;
  autoSave: boolean;
  showLineNumbers: boolean;
  fontSize: number;
}

export interface ChatContext {
  files: string[];
  activeFile?: string;
  selectedText?: string;
  projectInfo?: {
    name: string;
    type: string;
    dependencies: string[];
  };
}