import React, { useEffect, useId, useState } from 'react';

let mermaidInitialized = false;
let mermaidPromise: Promise<typeof import('mermaid')> | null = null;

const getMermaid = async () => {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid');
  }

  const module = await mermaidPromise;
  return module.default;
};

const ensureMermaid = async () => {
  const mermaid = await getMermaid();

  if (mermaidInitialized) {
    return mermaid;
  }

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    themeVariables: {
      background: '#0b0d0f',
      primaryColor: '#08181a',
      primaryTextColor: '#e0fbfc',
      primaryBorderColor: '#19b8be',
      secondaryColor: '#071316',
      secondaryTextColor: '#e0fbfc',
      secondaryBorderColor: '#19b8be',
      tertiaryColor: '#0e1012',
      tertiaryTextColor: '#e0fbfc',
      tertiaryBorderColor: '#19b8be',
      lineColor: '#19b8be',
      textColor: '#e0fbfc',
      fontFamily: '"Noto Sans KR", sans-serif',
      mainBkg: '#08181a',
      nodeBorder: '#19b8be',
      clusterBkg: '#071316',
      clusterBorder: '#19b8be',
      edgeLabelBackground: '#0e1012',
    },
    flowchart: {
      htmlLabels: false,
      curve: 'basis',
    },
  });

  mermaidInitialized = true;
  return mermaid;
};

interface MermaidBlockProps {
  chart: string;
}

export const MermaidBlock: React.FC<MermaidBlockProps> = ({ chart }) => {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const uniqueId = useId().replace(/:/g, '');

  useEffect(() => {
    let active = true;

    const renderChart = async () => {
      const mermaid = await ensureMermaid();

      try {
        const { svg: renderedSvg } = await mermaid.render(`mermaid-${uniqueId}`, chart);

        if (!active) {
          return;
        }

        setSvg(renderedSvg);
        setError(null);
      } catch (renderError) {
        if (!active) {
          return;
        }

        const message =
          renderError instanceof Error ? renderError.message : 'Mermaid chart render failed';
        setSvg('');
        setError(message);
      }
    };

    void renderChart();

    return () => {
      active = false;
    };
  }, [chart, uniqueId]);

  if (error) {
    return (
      <div className="code-wrapper">
        <div className="code-header">
          <span>Mermaid Diagram</span>
          <span>[MERMAID ERROR]</span>
        </div>
        <pre className="mermaid-error">{chart}</pre>
      </div>
    );
  }

  return (
    <div className="mermaid-wrapper">
      <div
        className="mermaid-surface"
        // Mermaid returns sanitized SVG markup.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
};
