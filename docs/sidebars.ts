import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Persist State',
      items: [
        'persist-state/getting-started',
        'persist-state/configuration',
        'persist-state/advanced',
      ],
    },
    {
      type: 'category',
      label: 'Sync State',
      items: ['sync-state/getting-started', 'sync-state/configuration'],
    },
    'common/utilities',
  ],
};

export default sidebars;
