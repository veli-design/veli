'use client';

import * as React from 'react';
import {
  DropZone as AriaDropZone,
  FileTrigger,
  Label,
  Text,
  type DropZoneProps as AriaDropZoneProps,
} from 'react-aria-components';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { StaticFieldMessage } from './field-shared';

const dropzoneRootVariants = cva('flex w-full flex-col gap-[6px] font-sans antialiased');

const labelVariants = cva('type-body-sm-regular text-text-default-default');

const dropzoneVariants = cva(
  'flex min-h-[96px] w-full flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center outline-none transition-colors',
  {
    variants: {
      size: {
        sm: 'min-h-[80px] py-4 type-body-sm-regular',
        md: 'min-h-[96px] type-body-md-regular',
        lg: 'min-h-[128px] py-8 type-body-md-regular',
      },
      isDisabled: {
        true: 'cursor-not-allowed border-border-default-subtle bg-text-input-bg-default text-text-disabled-disabled',
        false: 'border-border-default-subtle bg-text-input-bg-default text-text-default-muted',
      },
      isDropTarget: {
        true: 'border-border-focus bg-button-primary-subtle-default text-text-primary-muted',
        false: '',
      },
      isFocusVisible: {
        true: 'ring-2 ring-border-focus ring-offset-2 ring-offset-bg-surface-base',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      isDisabled: false,
      isDropTarget: false,
      isFocusVisible: false,
    },
  },
);

const dropzoneLabelVariants = cva('text-balance');

const dropzoneHintVariants = cva('mt-1 type-caption-regular text-text-default-subtle');

export type DropzoneSize = 'sm' | 'md' | 'lg';

export interface DropzoneProps extends Omit<AriaDropZoneProps, 'className' | 'style' | 'children'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  hint?: React.ReactNode;
  children?: React.ReactNode | AriaDropZoneProps['children'];
  className?: string;
  size?: DropzoneSize;
  /** Enable click-to-browse via FileTrigger. */
  allowsBrowse?: boolean;
  acceptedFileTypes?: string[];
  onSelect?: (files: FileList | null) => void;
}

export function Dropzone({
  label,
  description,
  errorMessage,
  hint,
  children,
  className,
  size = 'md',
  isDisabled = false,
  allowsBrowse = false,
  acceptedFileTypes,
  onSelect,
  ...props
}: DropzoneProps) {
  const defaultLabel = 'Drop files here or click to browse';

  const dropzoneContent = (
    <AriaDropZone
      {...props}
      isDisabled={isDisabled}
      className={(state) =>
        twMerge(
          dropzoneVariants({
            size,
            isDisabled: state.isDisabled,
            isDropTarget: state.isDropTarget,
            isFocusVisible: state.isFocusVisible,
          }),
          className,
        )
      }
    >
      {(state) => {
        if (typeof children === 'function') {
          return children(state);
        }

        if (children) {
          return children;
        }

        return (
          <>
            <Text slot="label" className={dropzoneLabelVariants()}>
              {state.isDropTarget ? 'Release to upload' : defaultLabel}
            </Text>
            {hint ? <span className={dropzoneHintVariants()}>{hint}</span> : null}
          </>
        );
      }}
    </AriaDropZone>
  );

  return (
    <div className={dropzoneRootVariants()}>
      {label ? <Label className={labelVariants()}>{label}</Label> : null}
      {allowsBrowse ? (
        <FileTrigger acceptedFileTypes={acceptedFileTypes} allowsMultiple onSelect={onSelect}>
          {dropzoneContent}
        </FileTrigger>
      ) : (
        dropzoneContent
      )}
      <StaticFieldMessage description={description} errorMessage={errorMessage} />
    </div>
  );
}
