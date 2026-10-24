'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { SignOutIcon } from '@phosphor-icons/react';
import { Badge } from '@veli-design/react/badge';
import { Button } from '@veli-design/react/button';

export type PreviewBannerNotice = {
  id: string;
  title: string;
  message: string;
  previewStatus?: 'draft' | 'published';
  statusLabel?: string;
  action?: {
    href: string;
    label: string;
  };
};

export type PreviewBannerProps = {
  notices: PreviewBannerNotice[];
  /** Hide the fixed stack without unmounting (for example while a shell overlay is open). */
  hidden?: boolean;
};

// Figma Circle fills: orange/warning-700 (#eb610b) and green-700 (#09a15f).
const dotFill = {
  draft: 'bg-warning-700',
  published: 'bg-green-700',
  none: 'bg-neutral-600',
};

function StatusDot({ previewStatus }: { previewStatus?: PreviewBannerNotice['previewStatus'] }) {
  const color = dotFill[previewStatus ?? 'none'];
  return (
    // Figma icon-wrapper is 24px; inner 16px box drives the ping scale.
    <div
      data-preview-dot=""
      aria-hidden="true"
      className="relative grid size-6 shrink-0 place-items-center"
    >
      <div className="relative size-4">
        <div
          className={`absolute inset-0 rounded-full opacity-30 motion-safe:animate-ping motion-safe:[animation-duration:2s] ${color}`}
        />
        <div
          className={`absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function ExitPreviewButton({
  action,
  className,
  intent,
  appearance,
}: {
  action: NonNullable<PreviewBannerNotice['action']>;
  className?: string;
  intent: 'accent' | 'secondary';
  appearance?: 'fill' | 'transparent';
}) {
  return (
    <Button
      as="a"
      href={action.href}
      data-preview-banner-action=""
      intent={intent}
      appearance={appearance}
      size="sm"
      className={className}
    >
      <SignOutIcon size={16} weight="bold" aria-hidden="true" />
      {action.label}
    </Button>
  );
}

function StatusBadge({ notice }: { notice: PreviewBannerNotice }) {
  if (!notice.statusLabel) return null;
  return (
    <>
      <span aria-hidden="true" className="bg-border-base-subtle h-3 w-px shrink-0" />
      <Badge
        size="md"
        appearance="outline"
        intent={
          notice.previewStatus === 'published'
            ? 'positive'
            : notice.previewStatus === 'draft'
              ? 'warning'
              : 'neutral'
        }
      >
        {notice.statusLabel}
      </Badge>
    </>
  );
}

function PreviewBannerCard({ notice }: { notice: PreviewBannerNotice }) {
  const { action } = notice;
  let actions: ReactNode = null;
  if (action) {
    actions = (
      <ExitPreviewButton
        action={action}
        intent="secondary"
        appearance="transparent"
        className="shrink-0"
      />
    );
  }

  return (
    // Mobile (Figma 7974:120715): [ping · Preview · Draft] / [message · Exit].
    // Desktop: single horizontal pill. Width matches the floating header pill.
    <aside
      aria-label={notice.title}
      data-preview-banner={notice.id}
      className="bg-surface-raised text-base-strong pointer-events-auto flex w-[calc(100%-1rem)] max-w-[1464px] flex-col items-stretch gap-2 overflow-visible rounded-4xl p-3.5 shadow-lg lg:w-[calc(100%-4rem)] lg:flex-row lg:items-center lg:gap-3 lg:rounded-[2.625rem] lg:p-3"
    >
      <div className="flex w-full min-w-0 items-center gap-3 lg:contents">
        <StatusDot previewStatus={notice.previewStatus} />
        <p className="type-body-lg-medium text-base-strong shrink-0 truncate">{notice.title}</p>
        <StatusBadge notice={notice} />
        <span
          aria-hidden="true"
          className="bg-border-base-subtle hidden h-3 w-px shrink-0 lg:block"
        />
        <p className="type-body-lg-regular text-base-muted hidden min-w-0 flex-1 truncate lg:block">
          {notice.message}
        </p>
      </div>
      <div className="flex w-full min-w-0 items-center gap-2 lg:contents">
        <p className="type-body-lg-regular text-base-muted min-w-0 flex-1 lg:hidden">
          {notice.message}
        </p>
        {actions}
      </div>
    </aside>
  );
}

/**
 * Floating fixed bottom preview banner with a measured scroll spacer so page
 * content is not covered. Hosts supply serializable notices and own draft-mode
 * cookies, translations, and action URLs. Renders nothing when `notices` is empty.
 */
export function PreviewBanner({ notices, hidden = false }: PreviewBannerProps) {
  const regionRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const region = regionRef.current;
    if (!region) {
      setHeight(0);
      return;
    }

    const measure = () => setHeight(region.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(region);
    return () => observer.disconnect();
  }, [notices.length]);

  if (notices.length === 0) return null;

  return (
    <>
      <div
        data-preview-banner-spacer=""
        className="shrink-0"
        style={{ height }}
        aria-hidden="true"
      />
      <div
        ref={regionRef}
        data-preview-banner-region=""
        inert={hidden || undefined}
        aria-hidden={hidden || undefined}
        style={{ visibility: hidden ? 'hidden' : undefined }}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-col items-center gap-2 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:pt-6 lg:pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        {notices.map((notice) => (
          <PreviewBannerCard key={notice.id} notice={notice} />
        ))}
      </div>
    </>
  );
}
