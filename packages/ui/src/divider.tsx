import {
  Separator as AriaSeparator,
  type SeparatorProps as AriaSeparatorProps,
} from 'react-aria-components';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const dividerVariants = cva('shrink-0 bg-fg-border-default-subtle', {
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'h-full min-h-[24px] w-px self-stretch',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

export interface DividerProps
  extends Omit<AriaSeparatorProps, 'className' | 'style'> {
  className?: string;
}

export function Divider({
  className,
  orientation = 'horizontal',
  ...props
}: DividerProps) {
  return (
    <AriaSeparator
      {...props}
      orientation={orientation}
      className={twMerge(dividerVariants({ orientation }), className)}
    />
  );
}
