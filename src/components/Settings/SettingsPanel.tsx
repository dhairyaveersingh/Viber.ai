import React, { useState } from 'react';
import { X, Key, Zap, Palette, Code, Eye, EyeOff } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, updateSettings } = useSettings();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    openai: localStorage.getItem('openai-api-key') || '',
    anthropic: localStorage.getItem('anthropic-api-key') || '',
    gemini: localStorage.getItem('gemini-api-key') || '',
    openrouter: localStorage.getItem('openrouter-api-key') || '',
    ollama: localStorage.getItem('ollama-api-key') || ''
  });

  const handleApiKeyChange = (provider: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
    localStorage.setItem(`${provider}-api-key`, value);
  };

  const getModelOptions = () => {
    switch (settings.aiProvider) {
      case 'openai':
        return [
          { value: 'gpt-4', label: 'GPT-4' },
          { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
        ];
      case 'anthropic':
        return [
          { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
          { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
          { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' }
        ];
      case 'gemini':
        return [
          { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Recommended)' },
          { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
          { value: 'gemini-pro', label: 'Gemini Pro' }
        ];
      case 'openrouter':
        return [
          { value: 'openai/gpt-4', label: 'GPT-4 (OpenRouter)' },
          { value: 'anthropic/claude-3-opus', label: 'Claude 3 Opus (OpenRouter)' }
        ];
      case 'ollama':
        return [
          { value: 'llama2', label: 'Llama 2' },
          { value: 'codellama', label: 'Code Llama' },
          { value: 'mistral', label: 'Mistral' }
        ];
      default:
        return [];
    }
  };

  const getApiKeyPlaceholder = () => {
    switch (settings.aiProvider) {
      case 'openai':
        return 'sk-...';
      case 'anthropic':
        return 'sk-ant-...';
      case 'gemini':
        return 'AIza...';
      case 'openrouter':
        return 'sk-or-...';
      case 'ollama':
        return 'Local model (no key needed)';
      default:
        return 'Enter API key';
    }
  };

  const getApiKeyInstructions = () => {
    switch (settings.aiProvider) {
      case 'openai':
        return 'Get your API key from https://platform.openai.com/api-keys';
      case 'anthropic':
        return 'Get your API key from https://console.anthropic.com/';
      case 'gemini':
        return 'Get your API key from https://aistudio.google.com/app/apikey (Free tier has rate limits)';
      case 'openrouter':
        return 'Get your API key from https://openrouter.ai/keys';
      case 'ollama':
        return 'Ollama runs locally - no API key required';
      default:
        return 'Your API key is stored locally and never sent to our servers';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-medium text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-5rem)]">
          {/* AI Provider Settings */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Key className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">AI Provider</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Provider
                </label>
                <select
                  value={settings.aiProvider}
                  onChange={(e) => updateSettings({ aiProvider: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="ollama">Ollama (Local)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKeys[settings.aiProvider as keyof typeof apiKeys]}
                    onChange={(e) => handleApiKeyChange(settings.aiProvider, e.target.value)}
                    placeholder={getApiKeyPlaceholder()}
                    disabled={settings.aiProvider === 'ollama'}
                    className="w-full p-3 pr-12 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  />
                  {settings.aiProvider !== 'ollama' && (
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2 font-light">
                  {getApiKeyInstructions()}
                </p>
                {settings.aiProvider === 'gemini' && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                    <strong>Note:</strong> Gemini free tier has strict rate limits. Consider using Gemini 1.5 Flash for better performance, or upgrade to a paid plan for higher limits.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Default Model
                </label>
                <select
                  value={settings.defaultModel}
                  onChange={(e) => updateSettings({ defaultModel: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                >
                  {getModelOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Performance Settings */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Performance</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Max Tokens: {settings.maxTokens}
                </label>
                <input
                  type="range"
                  min="1024"
                  max="8192"
                  step="512"
                  value={settings.maxTokens}
                  onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) })}
                  className="w-full accent-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Temperature: {settings.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                  className="w-full accent-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Editor Settings */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Code className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Editor</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Font Size: {settings.fontSize}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                  className="w-full accent-orange-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="line-numbers"
                  checked={settings.showLineNumbers}
                  onChange={(e) => updateSettings({ showLineNumbers: e.target.checked })}
                  className="rounded accent-orange-500"
                />
                <label htmlFor="line-numbers" className="text-sm text-gray-700 font-light">
                  Show line numbers
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="auto-save"
                  checked={settings.autoSave}
                  onChange={(e) => updateSettings({ autoSave: e.target.checked })}
                  className="rounded accent-orange-500"
                />
                <label htmlFor="auto-save" className="text-sm text-gray-700 font-light">
                  Auto-save changes
                </label>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Palette className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => updateSettings({ theme: e.target.value as any })}
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}