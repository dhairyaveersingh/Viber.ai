import { useState, useEffect } from 'react';
import { AppSettings } from '../types';

const defaultSettings: AppSettings = {
  theme: 'system',
  aiProvider: 'openai',
  defaultModel: 'gpt-4',
  maxTokens: 4096,
  temperature: 0.7,
  autoSave: true,
  showLineNumbers: true,
  fontSize: 14,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem('dyad-settings');
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  });

  const updateSettings = (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    
    // Auto-update default model when provider changes
    if (updates.aiProvider && updates.aiProvider !== settings.aiProvider) {
      switch (updates.aiProvider) {
        case 'openai':
          newSettings.defaultModel = 'gpt-4';
          break;
        case 'anthropic':
          newSettings.defaultModel = 'claude-3-sonnet-20240229';
          break;
        case 'gemini':
          newSettings.defaultModel = 'gemini-1.5-flash'; // Use Flash as default for better rate limits
          break;
        case 'openrouter':
          newSettings.defaultModel = 'openai/gpt-4';
          break;
        case 'ollama':
          newSettings.defaultModel = 'llama2';
          break;
      }
    }
    
    setSettings(newSettings);
    localStorage.setItem('dyad-settings', JSON.stringify(newSettings));
  };

  return { settings, updateSettings };
}