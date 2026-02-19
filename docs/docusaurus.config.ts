import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'ngrx-addons',
  tagline:
    'A collection of NgRx addons for state persistence and synchronization',
  favicon: 'img/favicon.ico',
  future: {
    v4: true,
  },
  url: 'https://michsior14.github.io',
  baseUrl: '/ngrx-addons/',
  organizationName: 'Michsior14',
  projectName: 'ngrx-addons',
  onBrokenLinks: 'throw',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/Michsior14/ngrx-addons/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'ngrx-addons',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/Michsior14/ngrx-addons',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Packages',
          items: [
            {
              label: '@ngrx-addons/persist-state',
              href: 'https://www.npmjs.com/package/@ngrx-addons/persist-state',
            },
            {
              label: '@ngrx-addons/sync-state',
              href: 'https://www.npmjs.com/package/@ngrx-addons/sync-state',
            },
            {
              label: '@ngrx-addons/common',
              href: 'https://www.npmjs.com/package/@ngrx-addons/common',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/Michsior14/ngrx-addons',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ngrx-addons. MIT License.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
