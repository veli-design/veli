import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  SiteFooter,
  SiteFooterThemeToggle,
  type SiteFooterColorScheme,
} from '@tradenetcorp/veli-blocks/site-footer';

const meta = {
  title: 'Blocks/Site footer',
  component: SiteFooter,
  parameters: { layout: 'fullscreen' },
  args: {
    startLabel: 'Service information',
    endLabel: 'Policies',
    startLinks: [
      { id: 'about', label: 'About', href: '#about' },
      { id: 'roadmap', label: 'Roadmap', href: '#roadmap' },
    ],
    endLinks: [
      { id: 'privacy', label: 'Privacy policy', href: '#privacy' },
      { id: 'terms', label: 'Terms of use', href: '#terms' },
    ],
  },
} satisfies Meta<typeof SiteFooter>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const LongLabels: Story = {
  args: {
    startLinks: [
      {
        id: 'about',
        label:
          'Information about this public service and the organization responsible for delivering it',
        href: '#about',
      },
    ],
  },
};
export const EmptyGroups: Story = { args: { startLinks: [], endLinks: [] } };
function ThemeToggleSlot() {
  const [colorScheme, setColorScheme] = useState<SiteFooterColorScheme>('system');
  return (
    <SiteFooterThemeToggle
      colorScheme={colorScheme}
      onColorSchemeChange={setColorScheme}
      labels={{
        change: 'Change theme',
        label: 'Theme',
        light: 'Light',
        dark: 'Dark',
        auto: 'Auto',
      }}
    />
  );
}
export const WithEndSlot: Story = {
  args: { endSlot: <span className="type-caption-regular">Version 2.4.0</span> },
};
export const WithThemeToggle: Story = { args: { endSlot: <ThemeToggleSlot /> } };
