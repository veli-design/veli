import * as React from 'react';
import {
  Button as AriaButton,
  Dialog,
  type DialogProps as AriaDialogProps,
  Heading,
  Modal as AriaModal,
  ModalOverlay,
  type ModalOverlayProps as AriaModalOverlayProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const overlayVariants = cva(
  'fixed inset-0 z-50 flex min-h-dvh items-center justify-center bg-gray-alpha-900 p-4 backdrop-blur-[2px] transition-opacity duration-200 ease-out data-[entering]:opacity-0 data-[exiting]:opacity-0'
);

const modalVariants = cva(
  'relative w-full max-h-[min(90dvh,720px)] overflow-hidden rounded-2xl border border-fg-border-default-subtle bg-bg-surface-surface-overlay-raised text-fg-text-default-default shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)] outline-none transition duration-200 ease-out data-[entering]:scale-[0.98] data-[entering]:opacity-0 data-[exiting]:scale-[0.98] data-[exiting]:opacity-0',
  {
    variants: {
      size: {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl',
        full: 'max-w-[min(96vw,1200px)] h-[min(90dvh,900px)]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface ModalProps
  extends Omit<AriaModalOverlayProps, 'children' | 'className'>,
    VariantProps<typeof modalVariants> {
  title?: React.ReactNode;
  'aria-label'?: AriaDialogProps['aria-label'];
  'aria-labelledby'?: AriaDialogProps['aria-labelledby'];
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  overlayClassName?: string;
  showCloseButton?: boolean;
  closeButtonLabel?: string;
}

export function Modal({
  title,
  children,
  footer,
  size,
  className,
  contentClassName,
  overlayClassName,
  showCloseButton = true,
  closeButtonLabel = 'Close dialog',
  isDismissable = true,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  ...overlayProps
}: ModalProps) {
  return (
    <ModalOverlay
      {...overlayProps}
      isDismissable={isDismissable}
      className={twMerge(overlayVariants(), overlayClassName)}
    >
      <AriaModal className={twMerge(modalVariants({ size }), className)}>
        <Dialog
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          className={twMerge('flex flex-col min-h-0 outline-none', size === 'full' && 'h-full')}
        >
          {({ close }) => (
            <>
              {(title || showCloseButton) && (
                <div className="flex items-start justify-between gap-4 px-6 pt-6">
                  {title ? (
                    <Heading
                      slot="title"
                      className="flex-1 min-w-0 text-[24px] leading-7 font-bold text-fg-text-default-high-contrast"
                    >
                      {title}
                    </Heading>
                  ) : null}
                  {showCloseButton ? (
                    <AriaButton
                      onPress={close}
                      className="ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-fg-icons-default-muted transition-colors hover:bg-bg-button-secondary-subtle-default hover:text-fg-icons-default-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-border-focus focus-visible:ring-offset-2"
                    >
                      <span className="sr-only">{closeButtonLabel}</span>
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 5L15 15M15 5L5 15"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                        />
                      </svg>
                    </AriaButton>
                  ) : null}
                </div>
              )}
              <div
                className={twMerge(
                  'min-h-0 flex-1 overflow-auto px-6 pb-6 text-[16px] leading-6 text-fg-text-default-default',
                  title || showCloseButton ? 'pt-4' : 'pt-6',
                  contentClassName
                )}
              >
                {children}
              </div>
              {footer ? (
                <div className="flex flex-col-reverse gap-3 border-t border-fg-border-default-subtle px-6 py-4 sm:flex-row sm:justify-end">
                  {footer}
                </div>
              ) : null}
            </>
          )}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  );
}
