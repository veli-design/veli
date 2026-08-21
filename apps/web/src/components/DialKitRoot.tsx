import { useEffect } from 'react';
import { DialRoot } from 'dialkit';
import 'dialkit/styles.css';

/** Global DialKit host. Panels register independently from client components. */
export default function DialKitRoot() {
  useEffect(() => {
    function annotateTrigger() {
      for (const panel of document.querySelectorAll<HTMLElement>('.dialkit-panel-inner')) {
        const collapsed = panel.dataset.collapsed === 'true';
        if (collapsed) {
          panel.setAttribute('role', 'button');
          panel.setAttribute('tabindex', '0');
          panel.setAttribute('aria-label', 'Open homepage shader settings');
        } else {
          panel.removeAttribute('role');
          panel.removeAttribute('tabindex');
          panel.removeAttribute('aria-label');
        }
      }
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const target = event.target as HTMLElement | null;
      const trigger = target?.closest<HTMLElement>('.dialkit-panel-inner[data-collapsed="true"]');
      if (!trigger) return;
      event.preventDefault();
      trigger.click();
    }

    const observer = new MutationObserver(annotateTrigger);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-collapsed'],
    });
    document.addEventListener('keydown', handleKeydown);
    annotateTrigger();

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  return <DialRoot position="bottom-right" defaultOpen={false} theme="system" productionEnabled />;
}
