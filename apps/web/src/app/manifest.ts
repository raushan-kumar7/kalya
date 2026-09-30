import type { MetadataRoute } from 'next';
import { siteConfig } from './metadata';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.tagline}`,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: siteConfig.themeColors.light,
    theme_color: siteConfig.themeColors.primary,
    icons: [
      {
        src: '/kalya_app_icon.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/kalya_icon1.png',
        sizes: '492x690',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
