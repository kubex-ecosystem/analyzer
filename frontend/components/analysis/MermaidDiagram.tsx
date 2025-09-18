import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Loader2, AlertTriangle } from 'lucide-react';

interface MermaidDiagramProps {
  chart: string;
}

// Generate a unique ID for each diagram container
let diagramIdCounter = 0;

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uniqueId] = useState(() => `mermaid-diagram-${diagramIdCounter++}`);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
      themeVariables: {
        background: '#1f2937', // gray-800
        primaryColor: '#374151', // gray-700
        primaryTextColor: '#f3f4f6', // gray-100
        lineColor: '#a78bfa', // purple-400
        textColor: '#d1d5db', // gray-300
      }
    });
  }, []);

  useEffect(() => {
    if (chart && containerRef.current) {
      setIsLoading(true);
      setError(null);
      setSvg(null);

      mermaid.render(uniqueId, chart)
        .then(({ svg }) => {
          setSvg(svg);
        })
        .catch(err => {
          console.error("Mermaid render error:", err);
          setError("Failed to render the diagram. The generated syntax might be invalid.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [chart, uniqueId]);

  return (
    <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg min-h-[200px] flex items-center justify-center">
      {isLoading && <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />}
      {error && (
          <div className="text-center text-red-400">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p>{error}</p>
          </div>
      )}
      {svg && !isLoading && (
        <div ref={containerRef} dangerouslySetInnerHTML={{ __html: svg }} className="w-full h-full flex items-center justify-center" />
      )}
    </div>
  );
};

export default MermaidDiagram;
