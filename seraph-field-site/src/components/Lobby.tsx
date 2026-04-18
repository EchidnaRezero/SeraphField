import React, { useEffect, useState } from 'react';
import type { Category } from '../types';
import { DEFAULT_UI_SETTINGS, loadLobbyUiSettings, saveLobbyUiSettings } from '../lib/lobbySettings';
import type { LobbyUiSettings } from '../lib/lobbySettings';
import { LobbyBackdrop } from './lobby/LobbyBackdrop';
import { LobbyDesktopLayout } from './lobby/LobbyDesktopLayout';
import type { LobbyLayoutProps } from './lobby/LobbyLayoutProps';
import { LobbyMobileLayout } from './lobby/LobbyMobileLayout';

interface LobbyProps {
  onEnter: (category?: Category, slug?: string) => void;
  onOpenReferences: () => void;
  onSearch: (query: string) => void;
  onOpenProfile: () => void;
  onOpenGraph: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  onEnter,
  onOpenReferences,
  onSearch,
  onOpenProfile,
  onOpenGraph,
}) => {
  const backgroundImageSrc = `${import.meta.env.BASE_URL}4th_aniv.png`;
  const [searchInput, setSearchInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [uiSettings, setUiSettings] = useState<LobbyUiSettings>(DEFAULT_UI_SETTINGS);
  const [isMobileLayout, setIsMobileLayout] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.innerWidth < 1024;
  });

  useEffect(() => {
    setUiSettings(loadLobbyUiSettings());
  }, []);

  useEffect(() => {
    saveLobbyUiSettings(uiSettings);
  }, [uiSettings]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileLayout(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const updateUiSetting = (key: keyof LobbyUiSettings, value: number) => {
    setUiSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetUiSettings = () => {
    setUiSettings(DEFAULT_UI_SETTINGS);
  };

  const submitSearch = (query: string) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return;
    }

    onSearch(normalizedQuery);
  };

  const layoutProps: LobbyLayoutProps = {
    backgroundImageSrc,
    searchInput,
    setSearchInput,
    isSettingsOpen,
    setIsSettingsOpen,
    uiSettings,
    onEnter,
    onOpenReferences,
    onSearch: submitSearch,
    onOpenProfile,
    onOpenGraph,
    updateUiSetting,
    resetUiSettings,
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-hud-bg font-ui select-none md:h-screen md:overflow-hidden">
      <LobbyBackdrop backgroundImageSrc={backgroundImageSrc} uiSettings={uiSettings} />
      {isMobileLayout ? <LobbyMobileLayout {...layoutProps} /> : <LobbyDesktopLayout {...layoutProps} />}
    </div>
  );
};
