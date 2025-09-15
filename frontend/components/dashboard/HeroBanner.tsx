import { BarChart3, Sparkles } from 'lucide-react';
import * as React from 'react';

const HeroBanner: React.FC = () => {
  return (
    <div className="p-8 text-center bg-gray-900/30 rounded-xl border border-gray-800">
      <div className="inline-flex items-center justify-center gap-3 group">
        <BarChart3 className="w-10 h-10 text-blue-400" />
        <h1 className="text-4xl font-bold text-white">Project Analyzer</h1>
        <Sparkles className="w-10 h-10 text-purple-400" />
      </div>
      <p className="text-gray-400 mt-4 max-w-3xl mx-auto">
        This is a placeholder Hero Banner. The main implementation is inside DashboardEmptyState.
      </p>
    </div>
  );
};

export default HeroBanner;
