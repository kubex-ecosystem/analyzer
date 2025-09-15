import { ChevronDown, Cloud, Cpu, Zap } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';
import { AIProvider } from '../../services/unified-ai';

interface ProviderSelectorProps {
  currentProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
}

const providerInfo = {
  'gemini-direct': {
    name: 'Gemini Direct',
    icon: Zap,
    color: 'text-blue-400',
    description: 'Direct API access'
  },
  'gateway-gemini': {
    name: 'Gateway Gemini',
    icon: Cloud,
    color: 'text-green-400',
    description: 'Via gateway with streaming'
  },
  'gateway-openai': {
    name: 'Gateway OpenAI',
    icon: Cpu,
    color: 'text-orange-400',
    description: 'OpenAI via gateway'
  },
  'gateway-anthropic': {
    name: 'Gateway Anthropic',
    icon: Cloud,
    color: 'text-purple-400',
    description: 'Anthropic via gateway'
  }
};

const ProviderSelector: React.FC<ProviderSelectorProps> = ({ currentProvider, onProviderChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentInfo = providerInfo[currentProvider];
  const CurrentIcon = currentInfo.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors border border-gray-600 hover:border-gray-500"
        aria-label="Select AI Provider"
      >
        <CurrentIcon className={`w-4 h-4 ${currentInfo.color}`} />
        <span className="text-sm font-medium hidden md:block">{currentInfo.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-1 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-20">
            <div className="p-2 space-y-1">
              {Object.entries(providerInfo).map(([provider, info]) => {
                const Icon = info.icon;
                const isSelected = provider === currentProvider;

                return (
                  <button
                    key={provider}
                    onClick={() => {
                      onProviderChange(provider as AIProvider);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${isSelected
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${info.color}`} />
                    <div className="flex-1">
                      <div className="font-medium">{info.name}</div>
                      <div className="text-xs text-gray-400">{info.description}</div>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProviderSelector;
