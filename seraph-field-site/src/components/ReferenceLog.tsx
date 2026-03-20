import React from 'react';
import { ArrowLeft, ExternalLink, GitBranch, TableProperties } from 'lucide-react';
import { motion } from 'motion/react';
import { trackedRepositories } from '../data/content';
import { Category } from '../types';

interface ReferenceLogProps {
  onBack: () => void;
  onOpenPost: (slug: string, category: Category) => void;
}

export const ReferenceLog: React.FC<ReferenceLogProps> = ({ onBack, onOpenPost }) => {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-hud-bg font-ui text-[#e0fbfc]">
      <div className="relative z-10 flex min-h-[100dvh] flex-col p-4 md:h-screen md:min-h-0 md:p-8">
        <header className="mb-4 flex flex-col gap-4 pb-4 md:pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={onBack}
              className="rounded-full border border-neon-cyan/20 p-2 transition-colors group hover:bg-neon-cyan/10"
            >
              <ArrowLeft className="h-5 w-5 text-neon-cyan/60 group-hover:text-neon-cyan" />
            </button>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-neon-cyan/60">
                Reference_Control
              </div>
              <h1 className="text-3xl font-bold uppercase tracking-wider text-neon-cyan/88 md:text-4xl">
                Tracked Repositories
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-neon-cyan/40">
            <TableProperties className="h-4 w-4" />
            {trackedRepositories.length} entries
          </div>
        </header>

        <div className="flex-1 overflow-hidden border border-neon-cyan/20 bg-black/36 backdrop-blur-md">
          <div className="hidden grid-cols-[1.5fr_0.7fr_0.7fr_1.3fr_0.9fr] gap-4 border-b border-neon-cyan/15 px-6 py-4 text-[11px] font-mono uppercase tracking-[0.26em] text-neon-cyan/60 md:grid">
            <span>Repository</span>
            <span>Version</span>
            <span>Tracked</span>
            <span>Source Doc</span>
            <span>Github</span>
          </div>

          <div className="custom-scrollbar h-full overflow-y-auto">
            <div className="md:hidden">
              {trackedRepositories.map((reference, index) => (
                <motion.div
                  key={`${reference.library}-mobile`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="border-b border-neon-cyan/10 px-4 py-4 transition-colors hover:bg-neon-cyan/[0.04]"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <GitBranch className="h-4 w-4 text-neon-cyan/75" />
                    <span className="text-lg font-bold text-white">{reference.library}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="mb-1 text-[10px] font-mono uppercase tracking-[0.18em] text-neon-cyan/50">
                        Version
                      </div>
                      <div className="font-mono text-neon-cyan">{reference.version}</div>
                    </div>
                    <div>
                      <div className="mb-1 text-[10px] font-mono uppercase tracking-[0.18em] text-neon-cyan/50">
                        Tracked
                      </div>
                      <div className="font-mono text-neon-cyan/65">{reference.date.replace(/-/g, '.')}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="mb-1 text-[10px] font-mono uppercase tracking-[0.18em] text-neon-cyan/50">
                        Source Doc
                      </div>
                      <button
                        onClick={() => onOpenPost(reference.sourceSlug, reference.sourceCategory)}
                        className="text-left text-base text-neon-cyan/85 underline decoration-neon-cyan/25 underline-offset-4 transition-colors hover:text-white"
                      >
                        {reference.sourceTitle}
                      </button>
                    </div>
                    <div className="col-span-2">
                      <div className="mb-1 text-[10px] font-mono uppercase tracking-[0.18em] text-neon-cyan/50">
                        Github
                      </div>
                      {reference.url ? (
                        <a
                          href={reference.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-base font-mono text-neon-cyan transition-colors hover:text-white"
                        >
                          OPEN <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="text-base font-mono text-white/25">N/A</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="hidden md:block">
              {trackedRepositories.map((reference, index) => (
                <motion.div
                  key={reference.library}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="grid grid-cols-[1.5fr_0.7fr_0.7fr_1.3fr_0.9fr] items-center gap-4 border-b border-neon-cyan/10 px-6 py-5 transition-colors hover:bg-neon-cyan/[0.04]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <GitBranch className="h-4 w-4 text-neon-cyan/75" />
                      <span className="truncate text-xl font-bold text-white drop-shadow-[0_0_10px_rgba(224,251,252,0.12)]">
                        {reference.library}
                      </span>
                    </div>
                  </div>
                  <div className="text-base font-mono text-neon-cyan">{reference.version}</div>
                  <div className="text-base font-mono text-neon-cyan/65">{reference.date.replace(/-/g, '.')}</div>
                  <button
                    onClick={() => onOpenPost(reference.sourceSlug, reference.sourceCategory)}
                    className="truncate text-left text-base text-neon-cyan/85 underline decoration-neon-cyan/25 underline-offset-4 transition-colors hover:text-white"
                  >
                    {reference.sourceTitle}
                  </button>
                  {reference.url ? (
                    <a
                      href={reference.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-base font-mono text-neon-cyan transition-colors hover:text-white"
                    >
                      OPEN <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="text-base font-mono text-white/25">N/A</span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 229, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-neon-cyan);
        }
      `}</style>
    </div>
  );
};
