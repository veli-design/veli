import { MenuItem } from '@veli-design/react/menu';
import { Button, Menu, MenuTrigger, Popover, Text } from 'react-aria-components';
import styles from './DocsPageActionButtons.module.css';
import { ArrowSquareOutIcon, CaretDownIcon, CopyIcon } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';

interface Props {
  markdownPath: string;
  compact?: boolean;
  fullWidth?: boolean;
}

type CopyState = 'idle' | 'copied' | 'error';

function copyWithFallback(value: string) {
  const previouslyFocused = document.activeElement;
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();

  try {
    const legacyDocument = document as unknown as {
      execCommand(commandId: string): boolean;
    };
    return legacyDocument.execCommand('copy');
  } finally {
    textarea.remove();
    if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
  }
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Clipboard access can be unavailable in embedded or non-secure contexts.
    }
  }

  try {
    return copyWithFallback(value);
  } catch {
    return false;
  }
}

export function DocsPageActionButtons({ markdownPath, compact = false, fullWidth = false }: Props) {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [isCopying, setIsCopying] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const copyPage = async () => {
    window.clearTimeout(resetTimer.current);
    setIsCopying(true);
    setCopyState('idle');

    let copied = false;
    try {
      const response = await fetch(markdownPath, {
        headers: { Accept: 'text/markdown' },
      });
      const contentType = response.headers.get('content-type') ?? '';
      if (!response.ok || contentType.includes('text/html')) {
        throw new Error(`Markdown request failed with ${response.status}`);
      }

      copied = await copyText(await response.text());
    } catch {
      copied = false;
    }

    setIsCopying(false);
    setCopyState(copied ? 'copied' : 'error');
    resetTimer.current = window.setTimeout(() => setCopyState('idle'), 2500);
  };

  const copyLabel =
    copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Try again' : 'Copy page';
  const status =
    copyState === 'copied'
      ? 'Page Markdown copied'
      : copyState === 'error'
        ? 'Unable to copy. Open Markdown to copy it manually.'
        : '';

  return (
    <div
      className={`${styles.actions} ${compact ? styles.compact : ''} ${
        fullWidth ? styles.fullWidth : ''
      }`}
    >
      <Button
        className={styles.main}
        isDisabled={isCopying}
        aria-busy={isCopying || undefined}
        data-state={copyState}
        onPress={copyPage}
      >
        <CopyIcon size={16} aria-hidden="true" />
        <span>{copyLabel}</span>
      </Button>
      <MenuTrigger>
        <Button className={styles.trigger} aria-label="Choose page action" isDisabled={isCopying}>
          <CaretDownIcon size={16} aria-hidden="true" />
        </Button>
        <Popover className={styles.popover} placement="bottom end" offset={2}>
          <Menu aria-label="Page actions" className={styles.menu}>
            <MenuItem
              id="copy"
              size="sm"
              textValue="Copy page"
              className="px-4"
              onAction={copyPage}
            >
              {() => (
                <div className={styles.item}>
                  <Text slot="label">Copy page</Text>
                  <Text slot="description" className={styles.description}>
                    Copy page as markdown for LLMs
                  </Text>
                </div>
              )}
            </MenuItem>
            <MenuItem
              id="view"
              size="sm"
              textValue="View as Markdown"
              className="px-4"
              href={markdownPath}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<ArrowSquareOutIcon size={16} aria-hidden="true" />}
            >
              <div className={styles.item}>
                <Text slot="label">View as Markdown</Text>
                <Text slot="description" className={styles.description}>
                  Open this page as plain text.
                </Text>
              </div>
            </MenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>
      <p className="sr-only" role="status" aria-live="polite" data-copy-markdown-status>
        {status}
      </p>
    </div>
  );
}
