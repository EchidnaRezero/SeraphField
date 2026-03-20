import { SITE_META } from './siteMeta';

export const SITE_PROFILE = {
  displayName: 'Echidna',
  githubUrl: 'https://github.com/EchidnaRezero',
  roleLabel: SITE_META.name,
  avatarUrl: `${import.meta.env.BASE_URL}echidna.png`,
} as const;
