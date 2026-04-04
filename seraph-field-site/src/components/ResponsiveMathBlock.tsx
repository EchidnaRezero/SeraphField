import React from 'react';

interface ResponsiveMathBlockProps {
  children: React.ReactNode;
}

const MOBILE_BREAKPOINT = 1024;
const MIN_SCALE = 0.6;

export const ResponsiveMathBlock: React.FC<ResponsiveMathBlockProps> = ({ children }) => {
  const outerRef = React.useRef<HTMLDivElement | null>(null);
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = React.useState(1);
  const [scaledHeight, setScaledHeight] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;

    const updateScale = () => {
      const outerElement = outerRef.current;
      const innerElement = innerRef.current;

      if (!outerElement || !innerElement) {
        return;
      }

      if (window.innerWidth >= MOBILE_BREAKPOINT) {
        setScale(1);
        setScaledHeight(null);
        return;
      }

      const availableWidth = outerElement.clientWidth - 2;
      const contentWidth = innerElement.scrollWidth;
      const contentHeight = innerElement.scrollHeight;

      if (!availableWidth || !contentWidth || contentWidth <= availableWidth) {
        setScale(1);
        setScaledHeight(null);
        return;
      }

      const nextScale = Math.max(MIN_SCALE, Math.min(1, availableWidth / contentWidth));
      setScale(nextScale);
      setScaledHeight(Math.ceil(contentHeight * nextScale));
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateScale);
    };

    scheduleUpdate();
    window.addEventListener('resize', scheduleUpdate);

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(scheduleUpdate);
      if (outerRef.current) {
        resizeObserver.observe(outerRef.current);
      }
      if (innerRef.current) {
        resizeObserver.observe(innerRef.current);
      }
    }

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', scheduleUpdate);
      resizeObserver?.disconnect();
    };
  }, [children]);

  return (
    <div className="math-block responsive-math-block" ref={outerRef}>
      <div
        className="responsive-math-block__viewport"
        style={{ height: scaledHeight ? `${scaledHeight}px` : undefined }}
      >
        <div
          ref={innerRef}
          className="responsive-math-block__inner"
          style={{
            transform: scale === 1 ? undefined : `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
