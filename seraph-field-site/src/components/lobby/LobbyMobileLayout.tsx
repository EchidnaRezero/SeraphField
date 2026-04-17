import React from 'react';
import { Bell, Database, GitBranch, Globe, Search, Settings, Tag } from 'lucide-react';
import { CATEGORY_ITEMS } from '../../config/categories';
import { contentStats, popularTags } from '../../data/content';
import { SITE_META } from '../../config/siteMeta';
import { SITE_PROFILE } from '../../config/siteProfile';
import { LOBBY_UI_SLIDERS } from '../../lib/lobbySettings';
import type { LobbyUiSettings } from '../../lib/lobbySettings';
import type { Category } from '../../types';
import type { LobbyLayoutProps } from './LobbyLayoutProps';

export const LobbyMobileLayout: React.FC<LobbyLayoutProps> = ({
  searchInput,
  setSearchInput,
  isSettingsOpen,
  setIsSettingsOpen,
  uiSettings,
  onEnter,
  onSearch,
  onOpenProfile,
  onOpenGraph,
  updateUiSetting,
  resetUiSettings,
}) => {
  const submitSearch = (query: string) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return;
    }

    onSearch(normalizedQuery);
  };

  return (
    <div className="relative z-10 flex min-h-[100dvh] flex-col gap-4 p-4 pb-5 text-[#e0fbfc]">
      <header className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label={`${SITE_PROFILE.displayName} profile`}
            data-targetable="true"
            className="flex items-center gap-2 text-left touch-manipulation"
          >
            <span className="block h-5 w-5 overflow-hidden rounded-full border border-neon-cyan/30 bg-neon-cyan/8">
              <img
                src={SITE_PROFILE.avatarUrl}
                alt={`${SITE_PROFILE.displayName} avatar`}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-neon-cyan/66">
              PROFILE
            </span>
          </button>

          <div className="flex gap-2">
            <button type="button" className="flex h-10 w-10 items-center justify-center touch-manipulation">
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
            <button type="button" className="flex h-10 w-10 items-center justify-center touch-manipulation">
              <Bell className="h-5 w-5 text-white/90" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Database, val: String(contentStats.postCount), label: 'POSTS' },
            { icon: Tag, val: String(contentStats.uniqueTagCount), label: 'TAGS' },
            { icon: Globe, val: contentStats.latestPostDate, label: 'UPDATE' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex min-h-14 flex-col justify-center border border-neon-cyan/18 bg-black/22 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <item.icon className="h-3.5 w-3.5 text-neon-cyan/82" />
                <span className="text-[9px] font-mono uppercase tracking-[0.16em] text-neon-cyan/60">
                  {item.label}
                </span>
              </div>
              <div className="mt-1 text-[0.92rem] font-bold text-white/92">{item.val}</div>
            </div>
          ))}
        </div>
      </header>

      <div className="min-h-8 flex-1" />

      <section className="grid grid-cols-2 gap-3">
        {CATEGORY_ITEMS.map((item) => (
          <button
            key={item.label}
            data-targetable="true"
            onClick={() => onEnter(item.id as Category)}
            className="group/item flex min-h-24 flex-col items-start justify-center gap-2 border border-neon-cyan/55 bg-black/30 px-4 py-4 text-left transition-colors hover:bg-neon-cyan/14 touch-manipulation"
          >
            <item.icon className="h-5 w-5 text-neon-cyan drop-shadow-[0_0_8px_rgba(0,229,255,0.2)]" />
            <span className="text-lg font-bold tracking-wider text-neon-cyan/92">{item.label}</span>
          </button>
        ))}
      </section>

      <button
        type="button"
        onClick={onOpenGraph}
        data-targetable="true"
        className="w-full rounded border border-neon-cyan/20 bg-black/30 p-4 text-left backdrop-blur-sm hover:border-neon-cyan/40 touch-manipulation"
      >
        <div className="flex items-center gap-3">
          <GitBranch className="h-5 w-5 text-neon-cyan/70" />
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-neon-cyan">Knowledge Graph</div>
            <div className="mt-1 text-[11px] text-hud-text/60">수학 구조 관계 지도</div>
          </div>
        </div>
      </button>

      <section className="border border-neon-cyan/38 bg-black/34 p-4 shadow-[0_0_24px_rgba(0,229,255,0.08)] backdrop-blur-md">
        <div className="mb-2 text-[10px] font-mono tracking-[0.24em] text-neon-cyan/62">{SITE_META.name}</div>
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
            className="w-full border border-neon-cyan/35 bg-neon-cyan/10 px-4 py-3 pr-12 text-sm font-mono text-neon-cyan placeholder:text-neon-cyan/35 transition-all focus:border-neon-cyan/75 focus:outline-none touch-manipulation"
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

        <div className="mt-3 flex flex-wrap gap-2">
          {popularTags.slice(0, 4).map((tag) => (
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
      </section>

      <footer className="mt-auto flex flex-col gap-2 pt-2">
        <div className="text-[9px] font-mono uppercase tracking-[0.08em] text-white/55 leading-relaxed">
          Background Image: Squad 31-A
        </div>
        <div className="text-[9px] font-mono uppercase tracking-[0.06em] text-white/38 leading-relaxed">
          Heaven Burns Red ©WFS, Developed by Wright Flyer Studios, ©VISUAL ARTS/Key
        </div>
      </footer>

      <div className="relative self-start">
        {isSettingsOpen && (
          <div className="fixed bottom-16 left-1/2 z-20 max-h-[70vh] w-[calc(100vw-2rem)] max-w-[20rem] -translate-x-1/2 overflow-y-auto border border-neon-cyan/42 bg-black/38 p-4 shadow-[0_0_24px_rgba(0,229,255,0.12)] backdrop-blur-md">
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
                    className="w-full accent-[rgb(25,184,190)] touch-manipulation"
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
          className="fixed bottom-4 right-4 z-20 flex h-11 w-11 items-center justify-center border border-neon-cyan/34 bg-black/50 shadow-[0_0_18px_rgba(0,229,255,0.12)] backdrop-blur-md touch-manipulation"
        >
          <Settings className="h-5 w-5 text-white/92" />
        </button>
      </div>
    </div>
  );
};
