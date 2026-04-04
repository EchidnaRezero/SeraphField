import type { Dispatch, SetStateAction } from 'react';
import type { Category } from '../../types';
import type { LobbyUiSettings } from '../../lib/lobbySettings';

export interface LobbyLayoutProps {
  backgroundImageSrc: string;
  searchInput: string;
  setSearchInput: Dispatch<SetStateAction<string>>;
  isSettingsOpen: boolean;
  setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
  uiSettings: LobbyUiSettings;
  onEnter: (category?: Category, slug?: string) => void;
  onOpenReferences: () => void;
  onSearch: (query: string) => void;
  onOpenProfile: () => void;
  updateUiSetting: (key: keyof LobbyUiSettings, value: number) => void;
  resetUiSettings: () => void;
}
