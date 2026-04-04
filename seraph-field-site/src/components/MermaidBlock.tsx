import React, { useEffect, useId, useRef, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

const INITIAL_MERMAID_SCALE = 1.12;
const PAN_UNLOCK_EPSILON = 0.01;

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
    htmlLabels: true,
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
      edgeLabelBackground: 'transparent',
    },
    flowchart: {
      padding: 24,
      curve: 'basis',
    },
  });

  mermaidInitialized = true;
  return mermaid;
};

const waitForDocumentFonts = async () => {
  if (typeof document === 'undefined' || !('fonts' in document)) {
    return;
  }

  try {
    await document.fonts.ready;
  } catch {
    // Ignore font loading failures and render with the current fallback stack.
  }
};

interface MermaidBlockProps {
  chart: string;
}

interface NormalizedSvgMetrics {
  estimatedHeight: number;
}

const normalizeRenderedSvg = (
  diagramElement: HTMLDivElement | null,
  surfaceElement: HTMLDivElement | null,
  isVerticalFlow: boolean,
) : NormalizedSvgMetrics | null => {
  if (!diagramElement) {
    return null;
  }

  const svgElement = diagramElement.querySelector('svg');
  const graphRoot = diagramElement.querySelector<SVGGElement>('svg g.root');

  if (!svgElement || !graphRoot || typeof graphRoot.getBBox !== 'function') {
    return null;
  }

  try {
    const box = graphRoot.getBBox();

    if (box.width <= 0 || box.height <= 0) {
      return null;
    }

    const padding = 18;
    const viewBox = [
      Math.floor(box.x - padding),
      Math.floor(box.y - padding),
      Math.ceil(box.width + padding * 2),
      Math.ceil(box.height + padding * 2),
    ].join(' ');

    svgElement.setAttribute('viewBox', viewBox);
    svgElement.setAttribute('preserveAspectRatio', 'xMidYMin meet');

    if (surfaceElement) {
      if (isVerticalFlow) {
        surfaceElement.style.width = `${Math.ceil(box.width + padding * 2)}px`;
        surfaceElement.style.maxWidth = '100%';
        surfaceElement.style.marginInline = 'auto';
      } else {
        surfaceElement.style.width = '';
        surfaceElement.style.maxWidth = '';
        surfaceElement.style.marginInline = '';
      }
    }

    return {
      estimatedHeight: Math.ceil(box.height + padding * 2 + 36),
    };
  } catch {
    // Skip normalization when the browser cannot measure the SVG yet.
    return null;
  }
};

export const MermaidBlock: React.FC<MermaidBlockProps> = ({ chart }) => {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(INITIAL_MERMAID_SCALE);
  const [isPanUnlocked, setIsPanUnlocked] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [viewerHeight, setViewerHeight] = useState<number | null>(null);
  const uniqueId = useId().replace(/:/g, '');
  const diagramRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const effectiveChart =
    isCompactViewport && /(?:flowchart|graph)\s+(LR|RL)\b/i.test(chart)
      ? chart.replace(/((?:flowchart|graph)\s+)(LR|RL)\b/i, '$1TB')
      : chart;
  const chartDirectionMatch = effectiveChart.match(/(?:flowchart|graph)\s+(TB|TD|BT|LR|RL)\b/i);
  const chartDirection = chartDirectionMatch?.[1].toUpperCase() ?? 'TB';
  const isVerticalFlow = chartDirection === 'TB' || chartDirection === 'TD' || chartDirection === 'BT';
  const useInlineMobileViewer = isCompactViewport && isVerticalFlow;
  const panUnlockThreshold = isCoarsePointer ? INITIAL_MERMAID_SCALE + PAN_UNLOCK_EPSILON : 1.01;

  useEffect(() => {
    setScale(INITIAL_MERMAID_SCALE);
    setIsPanUnlocked(false);
    setViewerHeight(null);
  }, [effectiveChart]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(pointer: coarse)');
    const compactViewportQuery = window.matchMedia('(max-width: 767px)');
    const updatePointerMode = () => {
      setIsCoarsePointer(mediaQuery.matches);
    };
    const updateViewportMode = () => {
      setIsCompactViewport(compactViewportQuery.matches);
    };

    updatePointerMode();
    updateViewportMode();
    mediaQuery.addEventListener?.('change', updatePointerMode);
    compactViewportQuery.addEventListener?.('change', updateViewportMode);

    return () => {
      mediaQuery.removeEventListener?.('change', updatePointerMode);
      compactViewportQuery.removeEventListener?.('change', updateViewportMode);
    };
  }, []);

  useEffect(() => {
    setIsPanUnlocked(scale > panUnlockThreshold);
  }, [panUnlockThreshold, scale]);

  useEffect(() => {
    if (!svg) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      const metrics = normalizeRenderedSvg(diagramRef.current, surfaceRef.current, isVerticalFlow);

      if (!metrics || !isVerticalFlow || typeof window === 'undefined') {
        setViewerHeight(null);
        return;
      }

      const maxViewerHeight = Math.min(window.innerHeight * 0.52, 520);
      setViewerHeight(metrics.estimatedHeight > maxViewerHeight ? Math.round(maxViewerHeight) : null);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [svg]);

  useEffect(() => {
    let active = true;
    let renderSequence = 0;

    const renderChart = async () => {
      const currentSequence = ++renderSequence;
      await waitForDocumentFonts();

      const mermaid = await ensureMermaid();

      try {
        const { svg: renderedSvg } = await mermaid.render(`mermaid-${uniqueId}`, effectiveChart);

        if (!active || currentSequence !== renderSequence) {
          return;
        }

        setSvg(renderedSvg);
        setError(null);
      } catch (renderError) {
        if (!active || currentSequence !== renderSequence) {
          return;
        }

        const message =
          renderError instanceof Error ? renderError.message : 'Mermaid chart render failed';
        setSvg('');
        setError(message);
      }
    };

    void renderChart();

    const fontSet = typeof document !== 'undefined' && 'fonts' in document ? document.fonts : null;
    const handleFontLoadingDone = () => {
      void renderChart();
    };

    fontSet?.addEventListener?.('loadingdone', handleFontLoadingDone);

    return () => {
      active = false;
      fontSet?.removeEventListener?.('loadingdone', handleFontLoadingDone);
    };
  }, [effectiveChart, uniqueId]);

  if (error) {
    return (
      <div className="code-wrapper">
        <div className="code-header">
          <span>Mermaid Diagram</span>
          <span>[MERMAID ERROR]</span>
        </div>
        <pre className="mermaid-error">{effectiveChart}</pre>
      </div>
    );
  }

  if (useInlineMobileViewer) {
    return (
      <div className="mermaid-wrapper">
        <div className="mermaid-toolbar">
          <div className="mermaid-toolbar__status">
            <span className="mermaid-toolbar__zoom">{Math.round(scale * 100)}%</span>
          </div>
          <div className="mermaid-toolbar__controls">
            <button
              type="button"
              className="mermaid-toolbar__button"
              aria-label="Zoom out diagram"
              onClick={() => setScale((current) => Math.max(0.7, Number((current - 0.15).toFixed(2))))}
            >
              -
            </button>
            <button
              type="button"
              className="mermaid-toolbar__button"
              aria-label="Zoom in diagram"
              onClick={() => setScale((current) => Math.min(2.5, Number((current + 0.15).toFixed(2))))}
            >
              +
            </button>
            <button
              type="button"
              className="mermaid-toolbar__button mermaid-toolbar__button--reset"
              aria-label="Reset diagram zoom"
              onClick={() => setScale(1)}
            >
              reset
            </button>
          </div>
        </div>
        <div ref={surfaceRef} className="mermaid-surface mermaid-surface--inline">
          <div
            ref={diagramRef}
            className="mermaid-diagram mermaid-diagram--inline"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
            }}
            // Mermaid returns sanitized SVG markup.
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mermaid-wrapper">
      <TransformWrapper
        key={`${uniqueId}-${svg.length}`}
        initialScale={INITIAL_MERMAID_SCALE}
        minScale={0.7}
        maxScale={4}
        limitToBounds
        centerOnInit={false}
        centerZoomedOut={false}
        disablePadding
        wheel={{
          activationKeys: ['Control'],
          step: 0.14,
          smoothStep: 0.01,
        }}
        pinch={{
          step: 4,
        }}
        doubleClick={{
          disabled: true,
        }}
        panning={{
          disabled: !isPanUnlocked,
          velocityDisabled: true,
          wheelPanning: false,
        }}
        onInit={(ref) => {
          setScale(ref.state.scale);
        }}
        onTransformed={(_, state) => {
          setScale(state.scale);
        }}
      >
        {({ resetTransform, zoomIn, zoomOut }) => (
          <>
            <div className="mermaid-toolbar">
              <div className="mermaid-toolbar__status">
                <span className="mermaid-toolbar__zoom">{Math.round(scale * 100)}%</span>
              </div>
              <div className="mermaid-toolbar__controls">
                <button
                  type="button"
                  className="mermaid-toolbar__button"
                  aria-label="Zoom out diagram"
                  onClick={() => zoomOut(0.2)}
                >
                  -
                </button>
                <button
                  type="button"
                  className="mermaid-toolbar__button"
                  aria-label="Zoom in diagram"
                  onClick={() => zoomIn(0.2)}
                >
                  +
                </button>
                <button
                  type="button"
                  className="mermaid-toolbar__button mermaid-toolbar__button--reset"
                  aria-label="Reset diagram zoom"
                  onClick={() => resetTransform(180)}
                >
                  reset
                </button>
              </div>
            </div>
            <TransformComponent
              wrapperClass={`mermaid-transform-wrapper${isPanUnlocked ? ' mermaid-transform-wrapper--zoomed' : ''}`}
              contentClass="mermaid-transform-content"
              wrapperStyle={{ width: '100%', height: viewerHeight ? `${viewerHeight}px` : undefined }}
              contentStyle={{ width: '100%' }}
            >
              <div ref={surfaceRef} className="mermaid-surface">
                <div
                  ref={diagramRef}
                  className="mermaid-diagram"
                  // Mermaid returns sanitized SVG markup.
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};
