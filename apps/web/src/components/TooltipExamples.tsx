import { useState, useSyncExternalStore } from 'react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Tooltip, TooltipTrigger } from '@tradenetcorp/veli-ui/tooltip';
import { Kbd, KbdGroup } from '@tradenetcorp/veli-ui/kbd';
import { VeliProvider, type VeliColorScheme } from '@tradenetcorp/veli-ui/provider';
import { DocsPreview, DocsPreviewOption } from './DocsPreview';

export function TooltipUsageDemo() {
  return (
    <TooltipTrigger delay={0}>
      <Button intent="secondary">Hover or focus me</Button>
      <Tooltip>Short help text for this action.</Tooltip>
    </TooltipTrigger>
  );
}

export function TooltipVariantsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {(['primary', 'secondary'] as const).map((tone) => (
        <TooltipTrigger key={`sm-${tone}`} delay={0}>
          <Button intent="secondary">Small — {tone}</Button>
          <Tooltip size="sm" tone={tone}>
            Brief help
          </Tooltip>
        </TooltipTrigger>
      ))}
      {(['primary', 'secondary'] as const).map((tone) => (
        <TooltipTrigger key={tone} delay={0}>
          <Button intent="secondary">Large — {tone}</Button>
          <Tooltip size="lg" tone={tone}>
            A tooltip with a caret and a maximum width. Keep its content non-interactive.
          </Tooltip>
        </TooltipTrigger>
      ))}
    </div>
  );
}

export function TooltipPlacementsDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-8">
      {(['top', 'bottom', 'start', 'end'] as const).map((placement) => (
        <TooltipTrigger key={placement} delay={0}>
          <Button intent="secondary">{placement}</Button>
          <Tooltip size="lg" placement={placement}>
            Help beside this control.
          </Tooltip>
        </TooltipTrigger>
      ))}
    </div>
  );
}

export function TooltipShortcutDemo() {
  return (
    <TooltipTrigger delay={0}>
      <Button intent="secondary">Copy</Button>
      <Tooltip className="flex items-center gap-2">
        <span>Copy</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>C</Kbd>
        </KbdGroup>
      </Tooltip>
    </TooltipTrigger>
  );
}

function subscribeToDocsTheme(onChange: () => void) {
  window.addEventListener('veli:color-scheme-change', onChange);
  return () => window.removeEventListener('veli:color-scheme-change', onChange);
}

function getDocsColorScheme(): VeliColorScheme {
  const scheme = document.documentElement.dataset.colorScheme;
  return scheme === 'light' || scheme === 'dark' ? scheme : 'system';
}

export function TooltipRtlDemo() {
  const colorScheme = useSyncExternalStore(
    subscribeToDocsTheme,
    getDocsColorScheme,
    () => 'system' as const,
  );
  const [language, setLanguage] = useState('Dhivehi');
  const isDhivehi = language === 'Dhivehi';
  return (
    <DocsPreview
      codeKey={`tooltip-language-${isDhivehi ? 'dv' : 'en'}`}
      controls={
        <DocsPreviewOption
          label="Language"
          value={language}
          options={['English', 'Dhivehi']}
          onChange={setLanguage}
        />
      }
    >
      <VeliProvider language={isDhivehi ? 'dv' : 'en'} colorScheme={colorScheme}>
        <TooltipTrigger delay={0}>
          <Button intent="secondary">{isDhivehi ? 'ކޮޕީ' : 'Copy'}</Button>
          <Tooltip placement="start" size="lg">
            {isDhivehi ? 'ކްލިޕްބޯޑަށް ކޮޕީކުރައްވާ' : 'Copy to clipboard'}
          </Tooltip>
        </TooltipTrigger>
      </VeliProvider>
    </DocsPreview>
  );
}
