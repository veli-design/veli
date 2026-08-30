import { Button } from '@tradenetcorp/veli-ui/button';
import { ArrowSquareOut, CopySimple } from 'phosphor-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
  markdownPath: string;
  placement: 'inline' | 'utility';
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

export function DocsPageActionButtons({ markdownPath, placement }: Props) {
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

  const viewMarkdown = () => {
    window.open(markdownPath, '_blank', 'noopener,noreferrer');
  };

  const copyLabel =
    copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Try again' : 'Copy page';
  const status =
    copyState === 'copied'
      ? 'Page Markdown copied'
      : copyState === 'error'
        ? 'Unable to copy. Open Markdown to copy it manually.'
        : '';
  const layoutClass = placement === 'utility' ? 'w-full justify-start' : undefined;

  return (
    <>
      <Button
        className={layoutClass}
        intent="primary"
        appearance="transparent"
        size="sm"
        isLoading={isCopying}
        data-copy-markdown
        data-state={copyState}
        onPress={copyPage}
      >
        <CopySimple size={16} aria-hidden="true" />
        <span data-copy-markdown-label>{copyLabel}</span>
      </Button>
      <Button
        className={layoutClass}
        intent="secondary"
        appearance="transparent"
        size="sm"
        onPress={viewMarkdown}
      >
        <ArrowSquareOut size={16} aria-hidden="true" />
        View markdown
      </Button>
      <p className="sr-only" role="status" aria-live="polite" data-copy-markdown-status>
        {status}
      </p>
    </>
  );
}
