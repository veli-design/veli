'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import {
  Heading,
  HeadingContext,
  Text,
  useSlottedContext,
  type HeadingProps,
  type TextProps,
} from 'react-aria-components';
import {
  Sheet as AriaSheet,
  SheetBackdrop,
  SheetContent,
  SheetTrigger,
  SheetOverlay,
  type SheetOverlayProps,
} from 'react-aria-components/Sheet';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { XIcon } from '@phosphor-icons/react';
import { Button, type ButtonProps } from './button.js';
import { useVeliColorScheme, useVeliLanguage } from './provider.js';
import { invariantDev, isDevelopment, normalizeAccessibleText } from './a11y.js';

const sheetVariants = cva(
  // Clip corners without creating a scroll container that intercepts the native swipe timeline.
  'veli-sheet max-w-full max-h-[calc(var(--visual-viewport-height)-var(--veli-spacing-8))] overflow-clip bg-modal-bg-solid text-base-default shadow-sm outline-none forced-colors:outline-solid forced-colors:outline-1 forced-colors:-outline-offset-1 forced-colors:outline-[CanvasText]',
  {
    variants: {
      position: {
        bottom: 'rounded-t-4xl',
        // Keep a dismissal rail: React Aria 1.22 can stall at exactly full viewport width.
        start:
          'h-[var(--visual-viewport-height)] max-h-[var(--visual-viewport-height)] max-w-[calc(100%-var(--veli-spacing-8))] data-[position=left]:rounded-r-4xl data-[position=right]:rounded-l-4xl',
        end: 'h-[var(--visual-viewport-height)] max-h-[var(--visual-viewport-height)] max-w-[calc(100%-var(--veli-spacing-8))] data-[position=left]:rounded-r-4xl data-[position=right]:rounded-l-4xl',
      },
      size: { sm: 'w-md', md: 'w-xl', lg: 'w-3xl', full: 'w-full' },
      height: { content: '', viewport: '' },
    },
    compoundVariants: [
      {
        position: 'bottom',
        height: 'viewport',
        className: 'h-[calc(var(--visual-viewport-height)-var(--veli-spacing-16))]',
      },
    ],
    defaultVariants: { position: 'bottom', size: 'md', height: 'content' },
  },
);

interface SheetLayout {
  position: NonNullable<SheetProps['position']>;
  isWide: boolean;
}

const SheetDescriptionContext = createContext<((id: string) => () => void) | null>(null);

const SheetLayoutContext = createContext<SheetLayout | null>(null);

function useSheetLayout() {
  const context = useContext(SheetLayoutContext);
  if (!context) throw new Error('Veli UI: Sheet subcomponents must be used within a Sheet.');
  return context;
}

// React Aria owns gestures, focus and scroll locking.
export interface SheetProps extends Pick<
  SheetOverlayProps,
  'isOpen' | 'defaultOpen' | 'onOpenChange'
> {
  position?: 'bottom' | 'start' | 'end';
  /** Width preset for every placement, capped to the available viewport. */
  size?: 'sm' | 'md' | 'lg' | 'full';
  /** Bottom sheet height; side drawers fill the available viewport. */
  height?: 'content' | 'viewport';
  /** Allow Escape, backdrop and swipe dismissal. Explicit close is always available. */
  isDismissable?: boolean;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
}

export function Sheet({
  position = 'bottom',
  size = 'md',
  height = 'content',
  isDismissable = true,
  isOpen,
  defaultOpen,
  onOpenChange,
  children,
  className,
  overlayClassName,
}: SheetProps) {
  const language = useVeliLanguage();
  const { resolvedColorScheme } = useVeliColorScheme();
  const isWide = position === 'bottom' && size === 'full';
  const layout = useMemo(() => ({ position, isWide }), [position, isWide]);

  return (
    <SheetOverlay
      position={position}
      preventDismissal={!isDismissable}
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      lang={language.lang}
      dir={language.direction}
      data-theme={resolvedColorScheme}
      // Fractional page heights can clip the last pixel and prevent native entry from completing.
      className={twMerge(
        'veli-sheet-overlay z-50 min-h-[round(up,max(var(--page-height),100dvh),1px)]',
        overlayClassName,
      )}
    >
      <SheetBackdrop
        swipeAnimation="veli-sheet-scrim"
        className="veli-sheet-backdrop bg-black/60 backdrop-blur-[6px] motion-reduce:animate-none!"
      />
      <AriaSheet
        data-size={size}
        data-height={height}
        className={twMerge(sheetVariants({ position, size, height }), className)}
      >
        <SheetLayoutContext.Provider value={layout}>
          <SheetDialog>{children}</SheetDialog>
        </SheetLayoutContext.Provider>
      </AriaSheet>
    </SheetOverlay>
  );
}

function SheetDialog({ children }: { children: ReactNode }) {
  const language = useVeliLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const descriptionIds = useRef(new Set<string>());
  const [describedBy, setDescribedBy] = useState<string>();
  const updateDescriptions = useCallback(() => {
    const dialog = ref.current;
    if (!dialog) return;

    const elements = Array.from(descriptionIds.current, (id) =>
      dialog.ownerDocument.getElementById(id),
    ).filter((element): element is HTMLElement => Boolean(element && dialog.contains(element)));
    // Mount order can differ from reading order after conditional parts or keyed reorders.
    elements.sort((a, b) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    );
    setDescribedBy(elements.map((element) => element.id).join(' ') || undefined);
  }, []);
  const registerDescription = useCallback(
    (id: string) => {
      descriptionIds.current.add(id);
      updateDescriptions();
      return () => {
        descriptionIds.current.delete(id);
        updateDescriptions();
      };
    },
    [updateDescriptions],
  );
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    updateDescriptions();
    // Consumer components can move memoized parts without rerendering them.
    // Observe child moves, not text/attribute changes, and disconnect on close.
    const observer = new MutationObserver(updateDescriptions);
    observer.observe(dialog, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [updateDescriptions]);

  // Validate mounted content, including titles supplied through consumer components.
  useEffect(() => {
    if (!isDevelopment()) return;
    const title = ref.current?.querySelector('[slot="title"]');
    invariantDev(
      normalizeAccessibleText(title?.textContent),
      'Veli UI: Sheet requires a nonempty Sheet.Title so the dialog has an accessible name.',
    );
  });

  return (
    <SheetContent
      ref={ref}
      aria-describedby={describedBy}
      lang={language.lang}
      dir={language.direction}
      className="veli-sheet-content type-body-md-regular flex max-h-[inherit] flex-col overflow-auto wrap-anywhere outline-none"
    >
      <SheetDescriptionContext.Provider value={registerDescription}>
        {children}
      </SheetDescriptionContext.Provider>
    </SheetContent>
  );
}

export type SheetHeaderProps = ComponentPropsWithRef<'header'>;

export function SheetHeader({ className, ...props }: SheetHeaderProps) {
  const { isWide } = useSheetLayout();
  return (
    <header
      {...props}
      className={twMerge(
        'veli-sheet-header flex shrink-0 items-center justify-between gap-4 bg-modal-bg-solid px-6 py-4',
        isWide && 'lg:px-14 lg:py-5',
        className,
      )}
    />
  );
}

export type SheetTitleProps = Omit<HeadingProps, 'slot'> &
  Omit<ComponentPropsWithRef<'h2'>, 'slot'>;

export function SheetTitle({ className, ...props }: SheetTitleProps) {
  const { isWide } = useSheetLayout();
  return (
    <Heading
      {...props}
      slot="title"
      className={twMerge(
        'type-subtitle-medium text-base-strong',
        isWide && 'lg:type-title-2-semibold',
        className,
      )}
    />
  );
}

export type SheetDescriptionProps = Omit<TextProps, 'slot'> &
  Omit<ComponentPropsWithRef<'span'>, 'slot'>;

export function SheetDescription({ id, className, ...props }: SheetDescriptionProps) {
  useSheetLayout();
  const generatedId = useId();
  const descriptionId = id ?? generatedId;
  const register = useContext(SheetDescriptionContext)!;
  useLayoutEffect(() => register(descriptionId), [register, descriptionId]);
  return (
    <Text
      {...props}
      id={descriptionId}
      slot="description"
      className={twMerge('type-body-md-regular text-base-muted', className)}
    />
  );
}

export type SheetBodyProps = ComponentPropsWithRef<'div'>;

export function SheetBody({ className, ...props }: SheetBodyProps) {
  const { isWide } = useSheetLayout();
  const title = useSlottedContext(HeadingContext, 'title');
  return (
    // Allow scroll chaining into React Aria's swipe container at body boundaries.
    <div
      role="region"
      aria-labelledby={props['aria-label'] ? undefined : title?.id}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      {...props}
      className={twMerge(
        'veli-sheet-body flex min-h-24 flex-1 flex-col gap-4 overflow-auto px-6 py-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus forced-colors:focus-visible:outline-solid forced-colors:focus-visible:outline-2 forced-colors:focus-visible:-outline-offset-2 forced-colors:focus-visible:outline-[Highlight]',
        isWide && 'lg:px-14 lg:py-8',
        className,
      )}
    />
  );
}

export type SheetFooterProps = ComponentPropsWithRef<'footer'>;

export function SheetFooter({ className, ...props }: SheetFooterProps) {
  const { isWide } = useSheetLayout();
  return (
    <footer
      {...props}
      className={twMerge(
        'veli-sheet-footer flex shrink-0 flex-wrap items-center justify-end gap-2 bg-modal-bg-solid px-6 pt-2 pb-6',
        isWide && 'lg:px-14',
        className,
      )}
    />
  );
}

export type SheetHandleProps = Omit<ComponentPropsWithRef<'div'>, 'children'>;

export function SheetHandle({ className, ...props }: SheetHandleProps) {
  const { position } = useSheetLayout();
  if (position !== 'bottom') return null;
  return (
    <div
      {...props}
      aria-hidden
      className={twMerge('flex shrink-0 justify-center py-2 lg:hidden', className)}
    >
      <div className="h-1 w-10 rounded-full bg-neutral-alpha-600" />
    </div>
  );
}

export type SheetCloseProps = Omit<ButtonProps<'button'>, 'slot' | 'as' | 'iconOnly'>;

export function SheetClose({ children, ...props }: SheetCloseProps) {
  useSheetLayout();
  const language = useVeliLanguage();
  return (
    <Button
      intent="secondary"
      appearance="ghost"
      size="sm"
      iconOnly
      {...props}
      aria-label={props['aria-label'] ?? (language.language === 'dv' ? 'ލައްޕާ' : 'Close sheet')}
      slot="close"
    >
      {children ?? <XIcon aria-hidden className="size-4" />}
    </Button>
  );
}

Sheet.Trigger = SheetTrigger;
Sheet.Header = SheetHeader;
Sheet.Title = SheetTitle;
Sheet.Description = SheetDescription;
Sheet.Body = SheetBody;
Sheet.Footer = SheetFooter;
Sheet.Handle = SheetHandle;
Sheet.Close = SheetClose;
