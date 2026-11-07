// Site-wide constants shared across pages and components: the public
// hostname, the Discord invite, the contribution repo and inbox, and the
// blueteam.id social links shown in the footer. Centralized here so every
// place that needs one of these values (Header, Footer, ContributingView,
// TrackLandingView, DiscordBand) stays in sync when it changes.

export const SITE_HOSTNAME = 'start.blueteam.id';

export const DISCORD_INVITE_URL = 'https://blueteam.id/discord/';

export const CONTRIBUTION_REPO_URL = 'https://github.com/blueteam-id/start-here';

export const CONTRIBUTION_EMAIL = 'info@blueteam.id';

export interface SocialLink {
  label: string;
  url: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/company/blueteamid/' },
  { label: 'Instagram', url: 'https://www.instagram.com/blueteam_id' },
  { label: 'YouTube', url: 'https://www.youtube.com/channel/UCUeh0C1SzR-1xW6r2WLVASQ' },
];
