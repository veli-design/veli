import type { Meta, StoryObj } from '@storybook/react';

const shadowScales = [
  { name: 'xs', className: 'shadow-xs' },
  { name: 'sm', className: 'shadow-sm' },
  { name: 'md', className: 'shadow-md' },
  { name: 'lg', className: 'shadow-lg' },
  { name: 'xl', className: 'shadow-xl' },
  { name: '2xl', className: 'shadow-2xl' },
  { name: '3xl', className: 'shadow-3xl' },
] as const;

const meta = {
  title: 'Foundations/Shadow',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Figma Effect-styles shadow scale exposed as Tailwind utilities. Shadow ink uses theme-aware `--color-effects-shadow-*` tokens, so elevation updates automatically when switching light/dark via the Storybook theme toolbar.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {
  render: () => (
    <div className="min-h-screen bg-bg-surface-base p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2">
          <h1 className="type-heading-3-medium text-text-default-default">Shadow scale</h1>
          <p className="type-body-md-regular text-text-default-muted">
            Use the theme toolbar to toggle light and dark — shadow colors follow
            `--color-effects-shadow-frame` and depth tokens.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {shadowScales.map(({ name, className }) => (
            <div key={name} className="flex flex-col items-center gap-4">
              <div
                className={`flex h-28 w-full items-center justify-center rounded-xl border border-border-default-subtle bg-bg-surface-raised ${className}`}
              >
                <span className="type-body-sm-medium text-text-default-muted">{name}</span>
              </div>
              <div className="w-full space-y-1 text-center">
                <p className="type-body-sm-medium font-mono text-text-default-default">
                  {className}
                </p>
                <p className="type-caption-medium font-mono text-text-default-muted">
                  var(--shadow-{name})
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

export const Comparison: Story = {
  render: () => (
    <div className="min-h-screen bg-bg-surface-base p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2">
          <h2 className="type-heading-4-medium text-text-default-default">Stacked comparison</h2>
          <p className="type-body-md-regular text-text-default-muted">
            Cards share the same surface; only the shadow utility changes.
          </p>
        </div>

        <div className="space-y-6">
          {shadowScales.map(({ name, className }) => (
            <div
              key={name}
              className={`flex items-center justify-between rounded-xl border border-border-default-subtle bg-bg-surface-raised px-6 py-5 ${className}`}
            >
              <span className="type-body-md-medium text-text-default-default">{name}</span>
              <code className="type-body-sm-regular font-mono text-text-default-muted">
                {className}
              </code>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};
