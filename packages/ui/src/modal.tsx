'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTrigger as AriaDialogTrigger,
  type DialogProps as AriaDialogProps,
  Heading,
  type HeadingProps,
  Text,
  type TextProps,
  Modal as AriaModal,
  ModalOverlay,
  type ModalOverlayProps as AriaModalOverlayProps,
  OverlayTriggerStateContext,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { invariantDev, normalizeAccessibleText } from './a11y.js';
import { Button, type ButtonProps } from './button.js';
import { Divider } from './divider.js';
import { hasRenderableMessage } from './field-shared.js';
import { useVeliLanguage } from './provider.js';

const overlayVariants = cva([
  'fixed inset-0 z-50 flex min-h-dvh items-center justify-center bg-black/60 p-4 backdrop-blur-[6px]',
  'motion-safe:transition-opacity motion-safe:duration-normal motion-safe:ease-out',
  'motion-safe:data-[entering]:opacity-0 motion-safe:data-[exiting]:opacity-0',
  'motion-safe:data-[exiting]:duration-fast motion-safe:data-[exiting]:ease-in',
  'motion-reduce:transition-none',
]);

const modalVariants = cva(
  [
    'relative w-full max-h-[90dvh] overflow-auto rounded-4xl bg-modal-bg-solid text-base-default outline-none shadow-sm',
    'motion-safe:transition motion-safe:duration-normal motion-safe:ease-spring',
    'motion-safe:data-[entering]:scale-[0.98] motion-safe:data-[entering]:opacity-0',
    'motion-safe:data-[exiting]:scale-[0.98] motion-safe:data-[exiting]:opacity-0',
    'motion-safe:data-[exiting]:duration-fast motion-safe:data-[exiting]:ease-in',
    'motion-reduce:transition-none',
  ],
  {
    variants: {
      size: {
        xs: 'max-w-[440px]',
        sm: 'max-w-[440px]',
        md: 'max-w-[576px]',
        lg: 'max-w-[776px]',
        xl: 'max-w-[1024px]',
        full: 'max-w-[1200px]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

type ModalLayoutPart = 'header' | 'description' | 'title';

interface ModalLayoutState {
  hasHeader: boolean;
  hasDescription: boolean;
  hasTitle: boolean;
}

interface ModalLayoutContextValue extends ModalLayoutState {
  register: (part: ModalLayoutPart) => () => void;
}

const ModalCloseContext = React.createContext<(() => void) | null>(null);
const ModalLayoutContext = React.createContext<ModalLayoutContextValue | null>(null);

function useModalClose() {
  const close = React.useContext(ModalCloseContext);
  if (close == null) {
    invariantDev(false, 'Veli UI: Modal.CloseButton must be used within a Modal.');
    throw new Error('Veli UI: Modal.CloseButton must be used within a Modal.');
  }
  return close;
}

function useModalLayout() {
  const context = React.useContext(ModalLayoutContext);
  if (context == null) {
    invariantDev(false, 'Veli UI: Modal subcomponents must be used within a Modal.');
    throw new Error('Veli UI: Modal subcomponents must be used within a Modal.');
  }
  return context;
}

function isElementOfType<P>(
  child: React.ReactNode,
  component: React.ComponentType<P>,
): child is React.ReactElement<P> {
  return React.isValidElement(child) && child.type === component;
}

function splitHeaderChildren(children: React.ReactNode) {
  const closeButton: React.ReactNode[] = [];
  const titles: React.ReactNode[] = [];
  const descriptions: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (isElementOfType(child, ModalCloseButton)) {
      closeButton.push(child);
      return;
    }

    if (isElementOfType(child, ModalDescription)) {
      descriptions.push(child);
      return;
    }

    titles.push(child);
  });

  return { titles, descriptions, closeButton };
}

function ModalSectionDivider() {
  return (
    <div className="flex h-4 w-full items-end">
      <Divider className="w-full" />
    </div>
  );
}

export interface ModalProps
  extends
    Omit<AriaModalOverlayProps, 'children' | 'className'>,
    VariantProps<typeof modalVariants> {
  children: React.ReactNode;
  'aria-label'?: AriaDialogProps['aria-label'];
  'aria-labelledby'?: AriaDialogProps['aria-labelledby'];
  className?: string;
  overlayClassName?: string;
}

export function Modal({
  children,
  size = 'md',
  className,
  overlayClassName,
  isDismissable = true,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  isOpen: isOpenProp,
  defaultOpen,
  onOpenChange,
  ...overlayProps
}: ModalProps) {
  const languageConfig = useVeliLanguage();
  const triggerState = React.useContext(OverlayTriggerStateContext);
  const isInsideTrigger = triggerState != null;
  const normalizedAriaLabel = normalizeAccessibleText(ariaLabel);
  const normalizedAriaLabelledby = normalizeAccessibleText(ariaLabelledby);
  const isControlled = isOpenProp !== undefined;
  const uncontrolledOpenRef = React.useRef(defaultOpen ?? false);
  const openValidationFrameRef = React.useRef<number | null>(null);
  const layoutStateRef = React.useRef<ModalLayoutState>({
    hasHeader: false,
    hasDescription: false,
    hasTitle: false,
  });
  const [layoutState, setLayoutState] = React.useState<ModalLayoutState>({
    hasHeader: false,
    hasDescription: false,
    hasTitle: false,
  });

  const register = React.useCallback((part: ModalLayoutPart) => {
    const next = {
      ...layoutStateRef.current,
      hasHeader: part === 'header' ? true : layoutStateRef.current.hasHeader,
      hasDescription: part === 'description' ? true : layoutStateRef.current.hasDescription,
      hasTitle: part === 'title' ? true : layoutStateRef.current.hasTitle,
    };
    layoutStateRef.current = next;
    setLayoutState(next);

    return () => {
      const cleared = {
        ...layoutStateRef.current,
        hasHeader: part === 'header' ? false : layoutStateRef.current.hasHeader,
        hasDescription: part === 'description' ? false : layoutStateRef.current.hasDescription,
        hasTitle: part === 'title' ? false : layoutStateRef.current.hasTitle,
      };
      layoutStateRef.current = cleared;
      setLayoutState(cleared);
    };
  }, []);

  const validateDialogName = React.useCallback(() => {
    const hasDialogName =
      layoutStateRef.current.hasTitle ||
      Boolean(normalizedAriaLabel) ||
      Boolean(normalizedAriaLabelledby);

    invariantDev(
      hasDialogName,
      'Veli UI: Modal requires Modal.Title, aria-label, or aria-labelledby so the dialog has an accessible name.',
    );
  }, [normalizedAriaLabel, normalizedAriaLabelledby]);

  const scheduleOpenValidation = React.useCallback(() => {
    if (openValidationFrameRef.current != null) {
      cancelAnimationFrame(openValidationFrameRef.current);
    }

    openValidationFrameRef.current = requestAnimationFrame(() => {
      openValidationFrameRef.current = null;

      const open = isInsideTrigger
        ? Boolean(triggerState?.isOpen)
        : isControlled
          ? Boolean(isOpenProp)
          : uncontrolledOpenRef.current;

      if (open) {
        validateDialogName();
      }
    });
  }, [isControlled, isInsideTrigger, isOpenProp, triggerState, validateDialogName]);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!isControlled) {
        uncontrolledOpenRef.current = open;
      }

      if (open) {
        scheduleOpenValidation();
      }

      onOpenChange?.(open);
    },
    [isControlled, onOpenChange, scheduleOpenValidation],
  );

  const layoutContext = React.useMemo<ModalLayoutContextValue>(
    () => ({
      ...layoutState,
      register,
    }),
    [layoutState, register],
  );

  const resolvedSize = size ?? 'md';

  invariantDev(
    ariaLabel == null || Boolean(normalizedAriaLabel),
    'Veli UI: Modal aria-label must be a non-empty string.',
  );
  invariantDev(
    ariaLabelledby == null || Boolean(normalizedAriaLabelledby),
    'Veli UI: Modal aria-labelledby must be a non-empty id reference.',
  );
  invariantDev(
    !isInsideTrigger ||
      (isOpenProp === undefined && defaultOpen === undefined && onOpenChange == null),
    'Veli UI: Modal open state is controlled by Modal.Trigger. Pass isOpen, defaultOpen, and onOpenChange to Modal.Trigger instead.',
  );

  React.useLayoutEffect(() => {
    const open = isInsideTrigger
      ? Boolean(triggerState?.isOpen)
      : isControlled
        ? Boolean(isOpenProp)
        : uncontrolledOpenRef.current;

    if (!open) {
      return;
    }

    validateDialogName();
  }, [
    isControlled,
    isInsideTrigger,
    isOpenProp,
    layoutState.hasTitle,
    triggerState?.isOpen,
    validateDialogName,
  ]);

  React.useEffect(
    () => () => {
      if (openValidationFrameRef.current != null) {
        cancelAnimationFrame(openValidationFrameRef.current);
      }
    },
    [],
  );

  return (
    <ModalOverlay
      {...overlayProps}
      {...(!isInsideTrigger && isControlled ? { isOpen: isOpenProp } : {})}
      {...(!isInsideTrigger && defaultOpen !== undefined && !isControlled ? { defaultOpen } : {})}
      {...(!isInsideTrigger ? { onOpenChange: handleOpenChange } : {})}
      isDismissable={isDismissable}
      lang={languageConfig.lang}
      dir={languageConfig.direction}
      className={twMerge(overlayVariants(), overlayClassName)}
    >
      <AriaModal
        lang={languageConfig.lang}
        dir={languageConfig.direction}
        className={twMerge(modalVariants({ size: resolvedSize }), className)}
      >
        <Dialog
          aria-label={normalizedAriaLabel}
          aria-labelledby={normalizedAriaLabelledby}
          lang={languageConfig.lang}
          dir={languageConfig.direction}
          className="flex flex-col px-6 pt-4 pb-6 outline-none"
        >
          {({ close }) => (
            <ModalCloseContext.Provider value={close}>
              <ModalLayoutContext.Provider value={layoutContext}>
                {children}
              </ModalLayoutContext.Provider>
            </ModalCloseContext.Provider>
          )}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  );
}

export interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalHeader({ children, className }: ModalHeaderProps) {
  const { register } = useModalLayout();
  const { titles, descriptions, closeButton } = splitHeaderChildren(children);
  const hasDescription = descriptions.length > 0;

  React.useLayoutEffect(() => register('header'), [register]);

  return (
    <div className={twMerge('flex shrink-0 flex-col', className)}>
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between gap-2">
          {titles.length > 0 ? (
            <div className="flex min-w-0 flex-1 flex-col justify-center pt-2">{titles}</div>
          ) : null}
          {closeButton}
        </div>
        {descriptions}
      </div>
      {hasDescription ? <ModalSectionDivider /> : null}
    </div>
  );
}

export interface ModalTitleProps extends Omit<HeadingProps, 'className' | 'children'> {
  children: React.ReactNode;
  className?: string;
}

export function ModalTitle({ children, className, ...props }: ModalTitleProps) {
  const { register } = useModalLayout();
  const titleHasRenderableContent = hasRenderableMessage(children);

  invariantDev(
    titleHasRenderableContent,
    'Veli UI: Modal.Title must not be an empty string. Provide meaningful title content, aria-label, or aria-labelledby.',
  );

  React.useLayoutEffect(() => register('title'), [register]);

  return (
    <Heading
      {...props}
      slot="title"
      className={twMerge('type-subtitle-medium text-base-strong', className)}
    >
      {children}
    </Heading>
  );
}

export interface ModalDescriptionProps extends Omit<TextProps, 'className' | 'children'> {
  children: React.ReactNode;
  className?: string;
}

export function ModalDescription({ children, className, ...props }: ModalDescriptionProps) {
  const { register } = useModalLayout();

  React.useLayoutEffect(() => register('description'), [register]);

  if (!hasRenderableMessage(children)) {
    return null;
  }

  return (
    <Text
      {...props}
      slot="description"
      className={twMerge('type-body-md-regular text-base-strong', className)}
    >
      {children}
    </Text>
  );
}

export type ModalCloseButtonProps = Omit<
  Extract<ButtonProps, { iconOnly: true }>,
  'aria-label' | 'children' | 'iconOnly' | 'onPress'
> & {
  'aria-label'?: string;
};

export function ModalCloseButton({
  'aria-label': ariaLabel,
  intent = 'secondary',
  appearance = 'ghost',
  size = 'xs',
  ...props
}: ModalCloseButtonProps) {
  const close = useModalClose();
  const languageConfig = useVeliLanguage();
  const resolvedAriaLabel =
    ariaLabel ?? (languageConfig.language === 'dv' ? 'ލައްޕާ' : 'Close dialog');

  return (
    <Button
      {...props}
      onPress={close}
      intent={intent}
      appearance={appearance}
      size={size}
      iconOnly
      aria-label={resolvedAriaLabel}
    >
      <svg
        aria-hidden="true"
        className="size-4"
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
  );
}

export interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalContent({ children, className }: ModalContentProps) {
  return (
    <div className={twMerge('type-body-md-regular py-4 text-base-default', className)}>
      {children}
    </div>
  );
}

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={twMerge('flex shrink-0 flex-col gap-2', className)}>
      <ModalSectionDivider />
      <div className="flex w-full items-center justify-between gap-2 pt-2">{children}</div>
    </div>
  );
}

export interface ModalTriggerProps extends React.ComponentProps<typeof AriaDialogTrigger> {}

export function ModalTrigger(props: ModalTriggerProps) {
  return <AriaDialogTrigger {...props} />;
}

Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Description = ModalDescription;
Modal.CloseButton = ModalCloseButton;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;
Modal.Trigger = ModalTrigger;
