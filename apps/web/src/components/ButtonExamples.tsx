import { useState, useSyncExternalStore } from 'react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { VeliProvider, type VeliColorScheme } from '@tradenetcorp/veli-ui/provider';
import { ArrowLeft, ArrowRight, Plus, Trash } from 'phosphor-react';
import { DocsPreview, DocsPreviewOption } from './DocsPreview';

const buttonSizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const buttonIconSizes = { xs: 12, sm: 16, md: 16, lg: 20, xl: 20 } as const;
const buttonAppearances = ['fill', 'transparent', 'ghost'] as const;

function subscribeToDocsTheme(onChange: () => void) {
  window.addEventListener('veli:color-scheme-change', onChange);
  return () => window.removeEventListener('veli:color-scheme-change', onChange);
}

function getDocsColorScheme(): VeliColorScheme {
  const colorScheme = document.documentElement.dataset.colorScheme;
  return colorScheme === 'light' || colorScheme === 'dark' ? colorScheme : 'system';
}

export function ButtonUsageDemo() {
  return <Button>Continue</Button>;
}

export function ButtonVariantsDemo() {
  return (
    <div className="space-y-6">
      {(['primary', 'secondary', 'danger'] as const).map((intent) => (
        <div key={intent} className="space-y-2">
          <span className="block type-body-sm-medium text-base-strong capitalize">{intent}</span>
          <div className="flex flex-wrap items-center gap-3">
            {buttonAppearances.map((appearance) => (
              <Button key={appearance} intent={intent} appearance={appearance}>
                {appearance}
              </Button>
            ))}
          </div>
        </div>
      ))}
      <div className="space-y-2">
        <span className="block type-body-sm-medium text-base-strong">Accent</span>
        <Button intent="accent">fill</Button>
      </div>
    </div>
  );
}

export function ButtonIconsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>
        <Plus size={16} aria-hidden="true" weight="bold" />
        Add item
      </Button>
      <Button intent="secondary" appearance="transparent">
        Continue
        <ArrowRight size={16} aria-hidden="true" weight="bold" />
      </Button>
      <Button intent="danger" appearance="ghost" iconOnly aria-label="Delete item">
        <Trash size={16} aria-hidden="true" weight="bold" />
      </Button>
    </div>
  );
}

export function ButtonSizesDemo() {
  return (
    <div className="space-y-4">
      {buttonSizes.map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-3">
          <span className="w-8 type-body-sm-medium text-base-strong uppercase">{size}</span>
          <Button size={size}>Continue</Button>
          <Button size={size} iconOnly aria-label="Add item">
            <Plus size={buttonIconSizes[size]} aria-hidden="true" weight="bold" />
          </Button>
        </div>
      ))}
    </div>
  );
}

export function ButtonStatesDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button isDisabled>Unavailable</Button>
      <Button isLoading>Save changes</Button>
      <Button isPending intent="secondary" appearance="transparent">
        Upload file
      </Button>
      <Button isLoading aria-label="Saving changes" />
    </div>
  );
}

export function ButtonRtlDemo() {
  const [localLanguage, setLocalLanguage] = useState('Dhivehi');
  const colorScheme = useSyncExternalStore(
    subscribeToDocsTheme,
    getDocsColorScheme,
    () => 'system' as const,
  );
  const isDhivehi = localLanguage === 'Dhivehi';
  const ForwardArrow = isDhivehi ? ArrowLeft : ArrowRight;

  return (
    <DocsPreview
      controls={
        <DocsPreviewOption
          label="Language"
          value={localLanguage}
          options={['English', 'Dhivehi']}
          onChange={setLocalLanguage}
        />
      }
    >
      <VeliProvider
        language={isDhivehi ? 'dv' : 'en'}
        colorScheme={colorScheme}
        className="min-w-0"
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button>
            {isDhivehi ? 'ކުރިއަށް' : 'Continue'}
            <ForwardArrow size={16} aria-hidden="true" weight="bold" />
          </Button>
          <Button
            intent="secondary"
            appearance="transparent"
            iconOnly
            aria-label={isDhivehi ? 'އިތުރުކުރޭ' : 'Add item'}
          >
            <Plus size={16} aria-hidden="true" weight="bold" />
          </Button>
        </div>
      </VeliProvider>
    </DocsPreview>
  );
}
