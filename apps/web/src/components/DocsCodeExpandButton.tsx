import { useEffect, useState } from 'react';
import { Button } from '@veli-design/react/button';

export function DocsCodeExpandButton({
  pre,
  wrapper,
  lineCount,
}: {
  pre: HTMLPreElement;
  wrapper: HTMLElement;
  lineCount: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [currentLineCount, setCurrentLineCount] = useState(lineCount);

  useEffect(() => {
    const updateLineCount = (event: Event) => {
      setCurrentLineCount((event as CustomEvent<{ lineCount: number }>).detail.lineCount);
    };
    wrapper.addEventListener('docs:code-change', updateLineCount);
    return () => wrapper.removeEventListener('docs:code-change', updateLineCount);
  }, [wrapper]);

  function toggle() {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    wrapper.classList.toggle('is-expanded', nextExpanded);
    if (!nextExpanded) {
      pre.scrollTo({ top: 0 });
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      wrapper.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  return (
    <Button
      size="xs"
      intent="secondary"
      appearance="transparent"
      aria-controls={pre.id}
      aria-expanded={expanded}
      onPress={toggle}
    >
      <span className="docs-code-block__expand-icon" aria-hidden="true" />
      {expanded ? 'Collapse' : `Expand (${currentLineCount} lines)`}
    </Button>
  );
}
