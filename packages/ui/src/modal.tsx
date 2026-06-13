'use client';

import * as React from 'react';
import {
  Dialog,
  type DialogProps as AriaDialogProps,
  Heading,
  Modal as AriaModal,
  ModalOverlay,
  type ModalOverlayProps as AriaModalOverlayProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { invariantDev, normalizeAccessibleText } from './a11y';
import { Button } from './button';

const overlayVariants = cva(
  'fixed inset-0 z-50 flex min-h-dvh items-center justify-center bg-gray-alpha-900 p-4 backdrop-blur-[2px] transition-opacity duration-200 ease-out data-[entering]:opacity-0 data-[exiting]:opacity-0',
);

const modalVariants = cva(
  'relative w-full max-h-[min(90dvh,720px)] overflow-auto rounded-[20px] border border-border-default-subtle bg-bg-surface-overlay-raised text-text-default-default shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)] outline-none transition duration-200 ease-out data-[entering]:scale-[0.98] data-[entering]:opacity-0 data-[exiting]:scale-[0.98] data-[exiting]:opacity-0',
  {
    variants: {
      size: {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl',
        full: 'max-w-[min(96vw,1200px)] h-[min(90dvh,900px)] overflow-hidden',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

interface ModalSharedProps
  extends
    Omit<AriaModalOverlayProps, 'children' | 'className'>,
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

type ModalWithTitle = ModalSharedProps & {
  title: React.ReactNode;
};

type ModalWithAriaLabel = ModalSharedProps & {
  'aria-label': NonNullable<AriaDialogProps['aria-label']>;
};

type ModalWithAriaLabelledby = ModalSharedProps & {
  'aria-labelledby': NonNullable<AriaDialogProps['aria-labelledby']>;
};

export type ModalProps = ModalWithTitle | ModalWithAriaLabel | ModalWithAriaLabelledby;

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
  const normalizedAriaLabel = normalizeAccessibleText(ariaLabel);
  const normalizedAriaLabelledby = normalizeAccessibleText(ariaLabelledby);
  const titleIsEmptyString = typeof title === 'string' && !normalizeAccessibleText(title);
  const hasTitle = title != null && title !== false && !titleIsEmptyString;
  const hasDialogName = hasTitle || normalizedAriaLabel || normalizedAriaLabelledby;

  invariantDev(
    !titleIsEmptyString,
    'Veli UI: Modal title must not be an empty string. Provide meaningful title content, aria-label, or aria-labelledby.',
  );
  invariantDev(
    ariaLabel == null || Boolean(normalizedAriaLabel),
    'Veli UI: Modal aria-label must be a non-empty string.',
  );
  invariantDev(
    ariaLabelledby == null || Boolean(normalizedAriaLabelledby),
    'Veli UI: Modal aria-labelledby must be a non-empty id reference.',
  );
  invariantDev(
    hasDialogName,
    'Veli UI: Modal requires title, aria-label, or aria-labelledby so the dialog has an accessible name.',
  );

  return (
    <ModalOverlay
      {...overlayProps}
      isDismissable={isDismissable}
      className={twMerge(overlayVariants(), overlayClassName)}
    >
      <AriaModal className={twMerge(modalVariants({ size }), className)}>
        <Dialog
          aria-label={normalizedAriaLabel}
          aria-labelledby={normalizedAriaLabelledby}
          className={twMerge('flex flex-col outline-none', size === 'full' && 'h-full min-h-0')}
        >
          {({ close }) => (
            <>
              {(hasTitle || showCloseButton) && (
                <div className="flex items-start justify-between gap-[16px] px-[24px] pt-[24px]">
                  {hasTitle ? (
                    <Heading
                      slot="title"
                      className="flex-1 min-w-0 type-title-2-bold text-text-default-high-contrast"
                    >
                      {title}
                    </Heading>
                  ) : null}
                  {showCloseButton ? (
                    <Button
                      onPress={close}
                      intent="secondary"
                      appearance="ghost"
                      size="xs"
                      iconOnly
                      aria-label={closeButtonLabel}
                    >
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
                    </Button>
                  ) : null}
                </div>
              )}
              <div
                className={twMerge(
                  'px-[24px] pb-[24px] type-body-md-regular text-text-default-default',
                  hasTitle || showCloseButton ? 'pt-[16px]' : 'pt-[24px]',
                  size === 'full' && 'min-h-0 flex-1 overflow-auto',
                  contentClassName,
                )}
              >
                {children}
              </div>
              {footer ? (
                <div className="flex flex-col-reverse gap-[12px] border-t border-border-default-subtle px-[24px] py-[16px] sm:flex-row sm:justify-end">
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
