import { useState } from 'react';
import { Kbd, KbdGroup, type KbdVariant } from '@tradenetcorp/veli-ui/kbd';
import { DocsPreview, DocsPreviewOption } from './DocsPreview';

const shortcuts = {
  'Command K': { id: 'command-k', keys: ['⌘', 'K'] },
  'Control Shift P': { id: 'control-shift-p', keys: ['Ctrl', 'Shift', 'P'] },
  Escape: { id: 'escape', keys: ['Esc'] },
} as const;

export function KbdUsageDemo() {
  const [shortcut, setShortcut] = useState<keyof typeof shortcuts>('Command K');
  const { id, keys } = shortcuts[shortcut];
  return (
    <DocsPreview
      codeKey={`kbd-shortcut-${id}`}
      controls={
        <DocsPreviewOption
          label="Shortcut"
          value={shortcut}
          options={Object.keys(shortcuts)}
          onChange={(value) => setShortcut(value as keyof typeof shortcuts)}
        />
      }
    >
      {keys.length === 1 ? (
        <Kbd>{keys[0]}</Kbd>
      ) : (
        <KbdGroup dir="ltr" aria-label={shortcut}>
          {keys.map((key) => (
            <Kbd key={key}>{key}</Kbd>
          ))}
        </KbdGroup>
      )}
    </DocsPreview>
  );
}

export function KbdVariantsDemo() {
  const [variant, setVariant] = useState<KbdVariant>('default');
  return (
    <DocsPreview
      codeKey={`kbd-variant-${variant}`}
      controls={
        <DocsPreviewOption
          label="Variant"
          value={variant}
          options={['default', 'inverted']}
          onChange={(value) => setVariant(value as KbdVariant)}
        />
      }
    >
      <KbdGroup variant={variant} dir="ltr" aria-label="Command Enter">
        <Kbd>⌘</Kbd>
        <Kbd>Enter</Kbd>
      </KbdGroup>
    </DocsPreview>
  );
}
