import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

let mermaidInitialized = false;

function initMermaid(theme = 'dark') {
  mermaid.initialize({
    startOnLoad: false,
    theme: theme === 'dark' ? 'dark' : 'default',
    securityLevel: 'loose',
    flowchart: {
      htmlLabels: true,
      curve: 'basis',
      useMaxWidth: true,
      padding: 16,
    },
    themeVariables: theme === 'dark' ? {
      primaryColor: '#6366f1',
      primaryTextColor: '#e2e8f0',
      primaryBorderColor: '#4f46e5',
      lineColor: '#64748b',
      secondaryColor: '#1e293b',
      tertiaryColor: '#0f172a',
      background: '#0f172a',
      mainBkg: '#1e293b',
      nodeBorder: '#334155',
      clusterBkg: '#1e293b',
      clusterBorder: '#334155',
      titleColor: '#e2e8f0',
      edgeLabelBackground: '#1e293b',
      nodeTextColor: '#e2e8f0',
    } : {},
  });
  mermaidInitialized = true;
}

export default function MermaidDiagram({ chart, className = '' }) {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const idRef = useRef(`mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    if (!chart || !chart.trim()) {
      setLoading(false);
      setError('No diagram data available');
      return;
    }

    let cancelled = false;

    const renderDiagram = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!mermaidInitialized) {
          initMermaid('dark');
        }

        // Clean up the chart code — remove click directives that may cause issues
        let cleanChart = chart
          .replace(/click\s+\S+\s+"[^"]*"/g, '')
          .replace(/click\s+\S+\s+href\s+"[^"]*"/g, '')
          .trim();

        // Validate syntax first
        const isValid = await mermaid.parse(cleanChart).catch(() => false);

        if (!isValid && isValid !== undefined) {
          // Try a simplified version
          cleanChart = cleanChart
            .replace(/classDef\s+\w+[^\n]*/g, '')
            .replace(/class\s+\w+\s+\w+/g, '')
            .replace(/:::\w+/g, '')
            .trim();
        }

        const { svg: renderedSvg } = await mermaid.render(idRef.current, cleanChart);

        if (!cancelled) {
          setSvg(renderedSvg);
          setLoading(false);
        }
      } catch (err) {
        console.warn('[MermaidDiagram] Render failed:', err.message);
        if (!cancelled) {
          // Try one more time with ultra-simplified chart
          try {
            const simplifiedChart = chart
              .split('\n')
              .filter(line => {
                const t = line.trim().toLowerCase();
                return !t.startsWith('click ') &&
                       !t.startsWith('classdef ') &&
                       !t.startsWith('class ') &&
                       !t.includes(':::');
              })
              .join('\n')
              .trim();

            const retryId = `${idRef.current}-retry`;
            const { svg: retrySvg } = await mermaid.render(retryId, simplifiedChart);
            if (!cancelled) {
              setSvg(retrySvg);
              setLoading(false);
            }
          } catch (retryErr) {
            if (!cancelled) {
              setError(`Diagram rendering failed: ${retryErr.message}`);
              setLoading(false);
            }
          }
        }
      }
    };

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 rounded-xl bg-secondary/30 border border-border ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-muted-foreground font-medium">Rendering architecture diagram...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive ${className}`}>
        <span className="font-semibold">Diagram Error:</span> {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`mermaid-diagram overflow-x-auto rounded-xl bg-secondary/20 border border-border p-4 ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
