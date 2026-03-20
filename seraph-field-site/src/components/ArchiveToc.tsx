import React from 'react';
import { motion } from 'motion/react';
import type { TocItem } from '../lib/archive';

interface ArchiveTocProps {
  items: TocItem[];
  activeHeading: string;
  onSelect: (id: string) => void;
}

export const ArchiveToc: React.FC<ArchiveTocProps> = ({ items, activeHeading, onSelect }) => {
  if (items.length === 0) {
    return (
      <div className="pl-0 text-[9px] font-mono italic uppercase tracking-widest text-white/10 md:pl-6">
        No map data available.
      </div>
    );
  }

  return (
    <nav className="custom-scrollbar flex max-h-56 flex-col gap-3 overflow-y-auto overflow-x-hidden pr-2 md:max-h-none md:gap-4 md:pl-6">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`relative pl-0 text-left text-base tracking-wider transition-all md:pl-4 md:text-lg
            ${activeHeading === item.id ? 'font-bold text-white' : 'text-white/35 hover:text-white/65'}
          `}
        >
          {activeHeading === item.id && (
            <motion.div
              layoutId="toc-indicator"
              className="absolute left-[-12px] top-1/2 h-4 w-1 -translate-y-1/2 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] md:left-[-25px]"
            />
          )}
          {item.text}
        </button>
      ))}
    </nav>
  );
};
