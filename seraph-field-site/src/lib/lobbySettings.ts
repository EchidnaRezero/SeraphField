export interface LobbyUiSettings {
  overlayDim: number;
  hudTint: number;
  scanlines: number;
  vignette: number;
  sidebarGlow: number;
}

export interface LobbyUiSliderConfig {
  key: keyof LobbyUiSettings;
  label: string;
  min: number;
  max: number;
  step: number;
}

export const DEFAULT_UI_SETTINGS: LobbyUiSettings = {
  overlayDim: 0.035,
  hudTint: 0.03,
  scanlines: 0.16,
  vignette: 0.12,
  sidebarGlow: 0.06,
};

export const UI_SETTINGS_STORAGE_KEY = 'seraph-field-lobby-ui-settings';

export const LOBBY_UI_SLIDERS: LobbyUiSliderConfig[] = [
  { key: 'overlayDim', label: 'Overlay Dim', min: 0, max: 12, step: 1 },
  { key: 'hudTint', label: 'HUD Tint', min: 0, max: 8, step: 1 },
  { key: 'scanlines', label: 'Scanlines', min: 0, max: 35, step: 1 },
  { key: 'vignette', label: 'Vignette', min: 0, max: 30, step: 1 },
  { key: 'sidebarGlow', label: 'Sidebar Glow', min: 0, max: 18, step: 1 },
];

export const loadLobbyUiSettings = () => {
  const savedSettings = window.localStorage.getItem(UI_SETTINGS_STORAGE_KEY);

  if (!savedSettings) {
    return DEFAULT_UI_SETTINGS;
  }

  try {
    const parsedSettings = JSON.parse(savedSettings) as Partial<LobbyUiSettings>;
    return {
      overlayDim: parsedSettings.overlayDim ?? DEFAULT_UI_SETTINGS.overlayDim,
      hudTint: parsedSettings.hudTint ?? DEFAULT_UI_SETTINGS.hudTint,
      scanlines: parsedSettings.scanlines ?? DEFAULT_UI_SETTINGS.scanlines,
      vignette: parsedSettings.vignette ?? DEFAULT_UI_SETTINGS.vignette,
      sidebarGlow: parsedSettings.sidebarGlow ?? DEFAULT_UI_SETTINGS.sidebarGlow,
    };
  } catch {
    window.localStorage.removeItem(UI_SETTINGS_STORAGE_KEY);
    return DEFAULT_UI_SETTINGS;
  }
};

export const saveLobbyUiSettings = (settings: LobbyUiSettings) => {
  window.localStorage.setItem(UI_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};
