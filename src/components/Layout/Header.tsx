import React from 'react';
import { 
  Zap, 
  Settings, 
  FolderOpen, 
  Save, 
  Play, 
  Moon, 
  Sun, 
  Monitor 
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  onOpenProject: () => void;
  onOpenSettings: () => void;
  onSave: () => void;
  onPreview: () => void;
}

export function Header({ onOpenProject, onOpenSettings, onSave, onPreview }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      default: return Monitor;
    }
  };

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const;
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const ThemeIcon = getThemeIcon();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-light text-gray-900">Viber.AI</span>
        </div>
        <div className="h-6 w-px bg-gray-300" />
        <span className="text-sm text-gray-500 font-light">Local AI App Builder</span>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenProject}
          className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
          title="Open Project"
        >
          <FolderOpen className="w-5 h-5" />
        </button>
        
        <button
          onClick={onSave}
          className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
          title="Save Project"
        >
          <Save className="w-5 h-5" />
        </button>
        
        <button
          onClick={onPreview}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 font-medium text-sm"
          title="Preview App"
        >
          <Play className="w-4 h-4 mr-2 inline" />
          Preview
        </button>

        <div className="h-6 w-px bg-gray-300" />
        
        <button
          onClick={cycleTheme}
          className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
          title={`Theme: ${theme}`}
        >
          <ThemeIcon className="w-5 h-5" />
        </button>
        
        <button
          onClick={onOpenSettings}
          className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}