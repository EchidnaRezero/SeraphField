import React, { useMemo } from 'react';
import { Bell, Database, Globe, Tag, Settings, Search, GitBranch, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { CATEGORY_ITEMS } from '../../config/categories';
import { contentStats, popularTags, trackedRepositories } from '../../data/content';
import { SITE_META } from '../../config/siteMeta';
import { SITE_PROFILE } from '../../config/siteProfile';
import { LOBBY_UI_SLIDERS } from '../../lib/lobbySettings';
import type { LobbyUiSettings } from '../../lib/lobbySettings';
import type { Category } from '../../types';
import type { LobbyLayoutProps } from './LobbyLayoutProps';

export const LobbyDesktopLayout: React.FC<LobbyLayoutProps> = ({
  searchInput,
  setSearchInput,
  isSettingsOpen,
  setIsSettingsOpen,
  uiSettings,
  onEnter,
  onOpenReferences,
  onSearch,
  onOpenProfile,
  updateUiSetting,
  resetUiSettings,
}) => {
  const trackedReferencePreview = useMemo(() => trackedRepositories.slice(0, 4), []);

  const submitSearch = (query: string) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return;
    }

    onSearch(normalizedQuery);
  };

  return (
    <div className="relative z-10 flex min-h-[100dvh] flex-col p-4 md:h-full md:min-h-0 md:p-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          <motion.button
            type="button"
            onClick={onOpenProfile}
            aria-label={`${SITE_PROFILE.displayName} profile`}
            data-targetable="true"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileHover={{ x: 2 }}
            className="flex items-center gap-2 pt-1 text-left touch-manipulation"
          >
            <span className="block h-5 w-5 overflow-hidden rounded-full border border-neon-cyan/30 bg-neon-cyan/8">
              <img
                src={SITE_PROFILE.avatarUrl}
                alt={`${SITE_PROFILE.displayName} avatar`}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-neon-cyan/66">
                PROFILE
              </span>
            </div>
          </motion.button>

          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3 sm:gap-4 lg:flex lg:items-center lg:gap-6"
          >
            {[
              { icon: Database, val: String(contentStats.postCount), label: 'POSTS' },
              { icon: Tag, val: String(contentStats.uniqueTagCount), label: 'TAGS' },
              { icon: Globe, val: contentStats.latestPostDate, label: 'LAST_UPDATE' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-[rgba(244,252,255,0.94)]">
                <item.icon className="h-4 w-4 text-neon-cyan/82 drop-shadow-[0_0_8px_rgba(0,229,255,0.18)]" />
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-neon-cyan/66">
                    {item.label}
                  </span>
                  <span className="text-[0.95rem] font-bold text-white/92">{item.val}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="flex gap-3 self-start lg:self-auto">
          <button type="button" className="flex h-10 w-10 items-center justify-center transition-transform hover:scale-105 touch-manipulation">
            <span
              aria-label="Heaven Burns Red"
              className="block h-6 w-6 bg-white/90 drop-shadow-[0_0_10px_rgba(224,251,252,0.12)]"
              style={{
                WebkitMaskImage: `url(${import.meta.env.BASE_URL}logo_hbr.png)`,
                maskImage: `url(${import.meta.env.BASE_URL}logo_hbr.png)`,
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
              }}
            />
          </button>
          <button type="button" className="flex h-10 w-10 items-center justify-center transition-transform hover:scale-105 touch-manipulation">
            <Bell className="h-5 w-5 text-white/90 drop-shadow-[0_0_10px_rgba(224,251,252,0.12)] transition-colors hover:text-white" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-start xl:items-center">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="group relative w-full xl:w-auto"
        >
          <div
            className="relative flex h-auto w-full flex-row items-stretch gap-2 overflow-x-auto border border-neon-cyan/72 bg-black/50 px-3 py-3 backdrop-blur-xl transition-all duration-500 sm:gap-3 xl:h-[500px] xl:w-16 xl:flex-col xl:items-center xl:gap-8 xl:overflow-hidden xl:px-0 xl:py-8 xl:group-hover:w-64"
            style={{
              boxShadow: `0 0 8px rgba(0,229,255,${uiSettings.sidebarGlow}), inset 0 0 20px rgba(0,229,255,0.05)`,
            }}
          >
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-neon-cyan/[0.07] via-neon-cyan/[0.025] to-black/14" />
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,var(--color-neon-cyan)_0%,transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-10" />

            {CATEGORY_ITEMS.map((item) => (
              <button
                key={item.label}
                data-targetable="true"
                onClick={() => onEnter(item.id as Category)}
                className="group/item relative z-10 flex min-w-[9.5rem] items-center gap-3 px-3 py-3 transition-all hover:bg-neon-cyan/18 sm:min-w-[11rem] sm:px-4 sm:py-4 xl:w-full xl:min-w-0 xl:gap-6 xl:px-5"
              >
                <div className="flex min-w-[24px] justify-center">
                  <item.icon className="h-6 w-6 text-neon-cyan drop-shadow-[0_0_8px_rgba(0,229,255,0.24)] transition-colors group-hover/item:text-neon-cyan" />
                </div>
                <div className="flex flex-col whitespace-nowrap opacity-100 transition-all duration-300 xl:translate-x-4 xl:opacity-0 xl:group-hover:translate-x-0 xl:group-hover:opacity-100">
                  <span
                    className="relative text-xl font-bold tracking-wider text-neon-cyan/92 drop-shadow-[0_0_10px_rgba(0,229,255,0.14)] xl:text-2xl"
                    data-text={item.label}
                  >
                    <span className="relative z-10 inline-block">{item.label}</span>
                    <span className="pointer-events-none absolute inset-0 z-20 opacity-0 group-hover/item:opacity-100">
                      <span className="relative inline-block text-xl font-bold tracking-[0.04em] text-white xl:text-2xl">
                        <span className="relative z-10 inline-block">{item.label}</span>
                        <span className="absolute inset-0 z-0 -translate-x-[1px] text-neon-accent opacity-0 group-hover/item:animate-[glitch-1_0.3s_infinite] group-hover/item:opacity-50">
                          {item.label}
                        </span>
                        <span className="absolute inset-0 z-0 translate-x-[1px] text-neon-cyan opacity-0 group-hover/item:animate-[glitch-2_0.3s_infinite] group-hover/item:opacity-45">
                          {item.label}
                        </span>
                      </span>
                    </span>
                    <span className="absolute inset-0 z-0 -translate-x-[2px] text-neon-accent opacity-0 group-hover/item:animate-[glitch-1_0.3s_infinite] group-hover/item:opacity-32">
                      {item.label}
                    </span>
                    <span className="absolute inset-0 z-0 translate-x-[2px] text-neon-cyan opacity-0 group-hover/item:animate-[glitch-2_0.3s_infinite] group-hover/item:opacity-28">
                      {item.label}
                    </span>
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div
            className="absolute -right-4 top-1/2 hidden h-24 w-1 -translate-y-1/2 bg-neon-cyan/58 transition-opacity group-hover:opacity-0 xl:block"
            style={{ boxShadow: `0 0 6px rgba(0,229,255,${Math.max(uiSettings.sidebarGlow * 1.6, 0.08)})` }}
          />
        </motion.div>
      </div>

      <div className="mt-8 hidden xl:absolute xl:left-1/2 xl:top-1/2 xl:mt-0 xl:block xl:-translate-x-1/2 xl:-translate-y-1/2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <div className="center-tagline relative inline-block cursor-default group/center" data-text="待つのは収束か、それともNaNか。">
            <span className="relative z-10 inline-block group-hover/center:animate-[glitch-fast_0.2s_infinite]">
              <span className="center-tagline-dash">──</span>
              <span>待つのは収束か、それともNaNか。</span>
            </span>
            <span className="absolute inset-0 z-0 -translate-x-[1px] text-neon-accent opacity-0 group-hover/center:animate-[glitch-1_0.3s_infinite] group-hover/center:opacity-60">
              <span className="center-tagline-dash">──</span>
              <span>待つのは収束か、それともNaNか。</span>
            </span>
            <span className="absolute inset-0 z-0 translate-x-[1px] text-neon-cyan opacity-0 group-hover/center:animate-[glitch-2_0.3s_infinite] group-hover/center:opacity-60">
              <span className="center-tagline-dash">──</span>
              <span>待つのは収束か、それともNaNか。</span>
            </span>
          </div>
          <div className="mx-auto h-px w-64 bg-gradient-to-r from-transparent via-neon-cyan/10 to-transparent" />
        </motion.div>
      </div>

      <div className="mt-8 flex w-full flex-col items-stretch gap-6 xl:absolute xl:right-8 xl:top-1/2 xl:mt-0 xl:w-[25rem] xl:-translate-y-1/2 xl:items-end">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="w-full border border-neon-cyan/38 bg-black/34 p-4 shadow-[0_0_24px_rgba(0,229,255,0.08)] backdrop-blur-md md:p-5"
        >
          <div className="mb-3 text-[11px] font-mono tracking-[0.24em] text-neon-cyan/70">{SITE_META.name}</div>
          <div className="group/search relative" data-targetable="true">
            <input
              type="text"
              placeholder="FIND_TOPIC..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  submitSearch(searchInput);
                }
              }}
              className="w-full border border-neon-cyan/35 bg-neon-cyan/10 px-4 py-3 text-base font-mono text-neon-cyan placeholder:text-neon-cyan/35 transition-all focus:border-neon-cyan/75 focus:outline-none touch-manipulation"
            />
            <button
              type="button"
              onClick={() => submitSearch(searchInput)}
              className="absolute right-3 top-1/2 -translate-y-1/2 touch-manipulation"
              aria-label="search archive"
            >
              <Search className="h-4 w-4 text-neon-cyan/55 transition-colors group-focus-within/search:text-neon-cyan" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => submitSearch(tag)}
                className="border border-neon-cyan/25 px-2.5 py-1 text-[10px] font-mono text-neon-cyan/75 transition-colors hover:bg-neon-cyan/10 hover:text-white touch-manipulation"
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="w-full border border-neon-cyan/38 bg-black/34 p-4 shadow-[0_0_24px_rgba(0,229,255,0.08)] backdrop-blur-md md:p-5"
        >
          <div className="mb-4 text-[12px] font-mono uppercase tracking-[0.28em] text-neon-cyan/78">
            Tracked_Repositories
          </div>
          <div className="space-y-3">
            {trackedReferencePreview.map((reference) => (
              <a
                key={reference.library}
                href={reference.url}
                target="_blank"
                rel="noreferrer"
                className="group/repo flex items-center justify-between py-1 touch-manipulation"
                data-targetable="true"
              >
                <div className="flex items-center gap-3">
                  <GitBranch className="h-3.5 w-3.5 text-neon-cyan/78 transition-colors group-hover/repo:text-neon-cyan" />
                  <span className="relative text-base font-bold text-white transition-colors group-hover/repo:text-neon-cyan">
                    <span className="relative z-10 inline-block group-hover/repo:animate-[glitch-fast_0.2s_infinite]">
                      {reference.library}
                    </span>
                    <span className="absolute inset-0 z-0 text-neon-accent opacity-0 group-hover/repo:animate-[glitch-1_0.3s_infinite] group-hover/repo:opacity-50">
                      {reference.library}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-neon-cyan">{reference.version}</span>
                  <span className="text-[10px] font-mono text-neon-cyan/65">
                    {reference.date.replace(/-/g, '.')}
                  </span>
                </div>
              </a>
            ))}
          </div>
          <button
            onClick={onOpenReferences}
            className="mt-5 flex w-full items-center justify-center gap-2 border border-neon-cyan/35 py-3 text-[12px] font-mono uppercase tracking-[0.2em] text-neon-cyan transition-all hover:bg-neon-cyan/12 hover:text-white touch-manipulation"
          >
            TRACKED_REPOSITORIES <ExternalLink className="h-3 w-3" />
          </button>
        </motion.div>
      </div>

      <footer className="mt-8 flex flex-col gap-6 xl:mt-auto xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex gap-4">
            <div className="mt-[7px] h-px w-28 bg-gradient-to-r from-neon-cyan/85 via-neon-cyan/35 to-transparent" />
            <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-white/90 leading-relaxed">
              Background Image: Squad 31-A
            </span>
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.06em] text-white/62 leading-relaxed">
            Heaven Burns Red ©WFS, Developed by Wright Flyer Studios, ©VISUAL ARTS/Key
          </div>
        </div>

        <div className="relative self-start xl:self-auto">
          {isSettingsOpen && (
            <div className="absolute bottom-14 right-0 w-72 border border-neon-cyan/42 bg-black/38 p-4 shadow-[0_0_24px_rgba(0,229,255,0.12)] backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-neon-cyan/78">
                  Display Calibration
                </div>
                <button
                  type="button"
                  onClick={resetUiSettings}
                  className="text-[10px] font-mono uppercase text-white/72 transition-colors hover:text-white touch-manipulation"
                >
                  Reset
                </button>
              </div>

              {LOBBY_UI_SLIDERS.map(({ key, label, min, max, step }) => {
                const numericKey = key as keyof LobbyUiSettings;
                const value = uiSettings[numericKey];
                const displayValue = Math.round(value * 100);

                return (
                  <label key={key} className="mb-3 block">
                    <div className="mb-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.12em]">
                      <span className="text-white/82">{label}</span>
                      <span className="text-neon-cyan/80">{displayValue}</span>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={displayValue}
                      onChange={(event) => updateUiSetting(numericKey, Number(event.target.value) / 100)}
                      className="w-full accent-[rgb(25,184,190)]"
                    />
                  </label>
                );
              })}
            </div>
          )}
          <button
            type="button"
            data-targetable="true"
            onClick={() => setIsSettingsOpen((current) => !current)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center transition-transform hover:scale-105 touch-manipulation"
          >
            <Settings className="h-5 w-5 text-white/92 drop-shadow-[0_0_10px_rgba(224,251,252,0.12)]" />
          </button>
        </div>
      </footer>
    </div>
  );
};
