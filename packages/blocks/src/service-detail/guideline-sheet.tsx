'use client';

import {
  Fragment,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Button as AriaButton,
  Dialog,
  DialogTrigger,
  Heading,
  Popover,
} from 'react-aria-components';
import { Button } from '@veli-design/react/button';
import { useVeliLanguage, useVeliColorScheme } from '@veli-design/react/provider';
import {
  CaretRightIcon,
  ListBulletsIcon,
  ShareIcon,
  SparkleIcon,
  XIcon,
} from '@phosphor-icons/react';
import type { ServiceDetailProps, ServiceGuideline } from './types';
import { DialogSurface } from './dialog-surface';

/** Opaque host-rendered elements own their content; normalize only known-empty nodes. */
function hasDisplayContent(content: ReactNode): boolean {
  if (content == null || typeof content === 'boolean') return false;
  if (typeof content === 'string') return content.trim().length > 0;
  if (Array.isArray(content)) return content.some(hasDisplayContent);
  if (isValidElement<{ children?: ReactNode }>(content) && content.type === Fragment)
    return hasDisplayContent(content.props.children);
  return true;
}

export function GuidelineSheet({
  guideline,
  labels,
  isOpen,
  defaultOpen = false,
  onOpenChange,
  dialogClassName,
  overlayClassName,
}: {
  guideline: ServiceGuideline;
  labels: ServiceDetailProps['labels'];
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  dialogClassName?: string;
  overlayClassName?: string;
}) {
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = isOpen ?? localOpen;
  const changeOpen = (next: boolean) => {
    if (isOpen === undefined) setLocalOpen(next);
    onOpenChange?.(next);
  };
  const hasContent = guideline.content.sections
    ? guideline.content.sections.some((section) => hasDisplayContent(section.body))
    : hasDisplayContent(guideline.content.body);
  if (!hasContent)
    return <p className="veli-service-detail-body-text">{labels.guidelineUnavailable}</p>;
  return (
    <DialogTrigger isOpen={open} onOpenChange={changeOpen}>
      <AriaButton className="veli-service-detail-guideline-trigger">
        <span className="veli-service-detail-guideline-link">
          {labels.readGuideline}
          <CaretRightIcon
            aria-hidden
            className="veli-service-detail-small-icon veli-service-detail-directional-icon"
          />
        </span>
        <span className="veli-service-detail-body-text">{labels.guidelineIntroduction}</span>
      </AriaButton>
      <DialogSurface sheet dialogClassName={dialogClassName} overlayClassName={overlayClassName}>
        <GuidelineContentView guideline={guideline} labels={labels} />
      </DialogSurface>
    </DialogTrigger>
  );
}

function GuidelineContentView({
  guideline,
  labels,
}: {
  guideline: ServiceGuideline;
  labels: ServiceDetailProps['labels'];
}) {
  const id = useId();
  const language = useVeliLanguage();
  const [activeSection, setActiveSection] = useState('');
  const tocSelection = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copyStatus, setCopyStatus] = useState('');
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const tocButtonRef = useRef<HTMLButtonElement>(null);
  const { resolvedColorScheme } = useVeliColorScheme();
  useEffect(() => {
    const mobile = window.matchMedia('(width < 768px)');
    const closeOnDesktop = () => {
      if (!mobile.matches) setTocOpen(false);
    };
    mobile.addEventListener('change', closeOnDesktop);
    return () => mobile.removeEventListener('change', closeOnDesktop);
  }, []);
  const sections =
    guideline.content.sections
      ?.filter((section) => hasDisplayContent(section.body))
      .map((section) => ({ ...section, domId: `${id}-${section.id}` })) ?? [];
  const headings = sections.filter((section) => section.title);
  const summary =
    guideline.summary &&
    (hasDisplayContent(guideline.summary.content) ||
      guideline.summary.isPending ||
      guideline.summary.error?.trim() ||
      guideline.summary.onRequest)
      ? guideline.summary
      : undefined;
  const showingSummary = summaryOpen && Boolean(summary);
  const navigateTo = (domId: string) => {
    tocSelection.current = true;
    setActiveSection(domId);
    setTocOpen(false);
    const target = Array.from(
      scrollRef.current?.querySelectorAll<HTMLElement>('[data-guideline-section]') ?? [],
    ).find((node) => node.id === domId);
    target?.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  };
  const updateActiveSection = (container: HTMLDivElement) => {
    if (tocSelection.current) return;
    const items = Array.from(container.querySelectorAll<HTMLElement>('[data-guideline-section]'));
    const top = container.getBoundingClientRect().top;
    const atEnd =
      container.scrollHeight > container.clientHeight + 1 &&
      container.scrollTop + container.clientHeight >= container.scrollHeight - 1;
    const passed = items.filter(
      (section) =>
        section.getBoundingClientRect().top <=
        top + (Number.parseFloat(getComputedStyle(section).scrollMarginBlockStart) || 0) + 1,
    );
    const current = atEnd ? items[items.length - 1] : passed[passed.length - 1] || items[0];
    if (current) setActiveSection(current.id);
  };
  const resumeTracking = () => {
    tocSelection.current = false;
    if (scrollRef.current) updateActiveSection(scrollRef.current);
  };
  const toc = () => (
    <ul className="veli-service-detail-toc">
      {headings.map((heading) => (
        <li key={heading.domId}>
          <a
            className="veli-service-detail-toc-link"
            href={`#${heading.domId}`}
            aria-current={
              (activeSection || headings[0]?.domId) === heading.domId ? 'location' : undefined
            }
            onClick={(event) => {
              event.preventDefault();
              navigateTo(heading.domId);
            }}
          >
            <span>{heading.title}</span>
          </a>
        </li>
      ))}
    </ul>
  );
  return (
    <>
      <div className="veli-service-detail-dialog-header veli-service-detail-guideline-sheet-header">
        <Heading slot="title">{guideline.title}</Heading>
        <AriaButton
          slot="close"
          className="veli-service-detail-close-button"
          aria-label={labels.closeGuideline}
        >
          <XIcon aria-hidden className="veli-service-detail-small-icon" />
        </AriaButton>
      </div>
      <div className="veli-service-detail-guideline-layout">
        {!!headings.length && !showingSummary && (
          <nav
            aria-label={labels.guidelineContents}
            className="veli-service-detail-guideline-sidebar"
          >
            {toc()}
          </nav>
        )}
        {/* The focusable native scroll region needs these input events to resume TOC tracking.
            It remains a labelled region rather than pretending to be a button. */}
        {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
        <div
          ref={scrollRef}
          role="region"
          aria-label={labels.guidelineCaption}
          tabIndex={0}
          className="veli-service-detail-guideline-scroll"
          dir="ltr"
          onWheel={resumeTracking}
          onTouchStart={resumeTracking}
          onPointerDown={resumeTracking}
          onKeyDown={(event) => {
            if (
              ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)
            )
              resumeTracking();
          }}
          onScroll={(event) => updateActiveSection(event.currentTarget)}
        >
          <div className="veli-service-detail-guideline-content" dir={language.direction}>
            <header className="veli-service-detail-guideline-header">
              <div className="veli-service-detail-guideline-meta-text">
                <p className="veli-service-detail-guideline-caption">{labels.guidelineCaption}</p>
                {guideline.updatedText && (
                  <p className="veli-service-detail-guideline-meta">{guideline.updatedText}</p>
                )}
              </div>
              <div className="veli-service-detail-guideline-actions">
                {summary && (
                  <Button
                    intent="secondary"
                    appearance="transparent"
                    iconOnly
                    aria-label={showingSummary ? labels.showFullGuideline : labels.showSummary}
                    aria-pressed={showingSummary}
                    onPress={() => {
                      const next = !showingSummary;
                      setSummaryOpen(next);
                      setTocOpen(false);
                      if (next && !hasDisplayContent(summary.content) && !summary.isPending)
                        summary.onRequest?.();
                    }}
                  >
                    <SparkleIcon aria-hidden className="veli-service-detail-small-icon" />
                  </Button>
                )}
                {guideline.onCopyLink && (
                  <Button
                    intent="secondary"
                    appearance="transparent"
                    iconOnly
                    aria-label={labels.copyGuidelineLink}
                    onPress={async () => {
                      try {
                        await guideline.onCopyLink?.();
                        setCopyStatus(labels.linkCopied);
                      } catch {
                        setCopyStatus(labels.linkCopyFailed);
                      }
                    }}
                  >
                    <ShareIcon aria-hidden className="veli-service-detail-small-icon" />
                  </Button>
                )}
              </div>
              <span role="status" className="veli-service-detail-sr-only">
                {copyStatus}
              </span>
            </header>
            {guideline.description && (
              <p className="veli-service-detail-guideline-description">{guideline.description}</p>
            )}
            {showingSummary ? (
              <div className="veli-service-detail-rich-text" aria-busy={summary?.isPending}>
                {(summary?.isPending ||
                  (!hasDisplayContent(summary?.content) && !summary?.error?.trim())) && (
                  <p role="status">{labels.summaryPending}</p>
                )}
                {summary?.error?.trim() && <p role="alert">{summary.error}</p>}
                {summary?.content}
              </div>
            ) : sections.length ? (
              sections.map((section) => (
                <section
                  key={section.domId}
                  id={section.domId}
                  data-guideline-section={section.title ? '' : undefined}
                  data-heading-spacing={section.headingSpacing}
                  className={`veli-service-detail-guideline-block ${section.title ? 'veli-service-detail-guideline-section' : ''}`}
                >
                  {section.title && <h2>{section.title}</h2>}
                  <div className="veli-service-detail-rich-text">{section.body}</div>
                </section>
              ))
            ) : (
              <div className="veli-service-detail-rich-text">{guideline.content.body}</div>
            )}
          </div>
        </div>
      </div>
      {!!headings.length && !showingSummary && (
        <>
          <Button
            ref={tocButtonRef}
            size="lg"
            iconOnly
            className="veli-service-detail-mobile-toc-button"
            aria-label={labels.guidelineContents}
            aria-expanded={tocOpen}
            aria-controls={tocOpen ? `${id}-mobile-toc` : undefined}
            onPress={() => setTocOpen(!tocOpen)}
          >
            {tocOpen ? (
              <XIcon aria-hidden className="veli-service-detail-toc-icon" />
            ) : (
              <ListBulletsIcon
                weight="bold"
                aria-hidden
                focusable="false"
                className="veli-service-detail-toc-icon"
              />
            )}
          </Button>
          <Popover
            triggerRef={tocButtonRef}
            isOpen={tocOpen}
            onOpenChange={setTocOpen}
            placement="top end"
            offset={12}
            containerPadding={20}
            lang={language.lang}
            dir={language.direction}
            data-theme={resolvedColorScheme}
            className={`veli-service-detail-mobile-toc-panel ${resolvedColorScheme === 'dark' ? 'dark' : ''}`}
          >
            <Dialog
              id={`${id}-mobile-toc`}
              aria-label={labels.guidelineContents}
              className="veli-service-detail-mobile-toc-dialog"
            >
              <Heading className="veli-service-detail-mobile-toc-heading">
                {labels.guidelineContents}
              </Heading>
              <nav aria-label={labels.guidelineContents}>{toc()}</nav>
            </Dialog>
          </Popover>
        </>
      )}
      {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
    </>
  );
}
