'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { Divider } from './divider';
import { hasRenderableMessage } from './field-shared';

const cardVariants = cva(
  'flex w-full flex-col font-sans antialiased type-body-md-regular rounded-2xl border border-border-default-subtle bg-bg-surface-raised text-text-default-default',
  {
    variants: {
      elevation: {
        none: 'shadow-none',
        xs: 'shadow-xs',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
      },
      interactive: {
        true: 'cursor-pointer transition-colors hover:bg-gray-alpha-100 active:bg-gray-alpha-200',
        false: '',
      },
      spacing: {
        sm: 'gap-3 p-4',
        md: 'gap-4 p-5',
        lg: 'gap-5 p-6',
        xl: 'gap-7 p-8',
      },
    },
    defaultVariants: {
      elevation: 'xs',
      interactive: false,
      spacing: 'md',
    },
  },
);

const cardTitleVariants = cva(
  'type-subtitle-medium text-text-default-strong -mt-[calc((1lh-1em)/2)]',
);

const cardDescriptionVariants = cva('type-body-md-regular text-text-default-strong');

const cardContentVariants = cva('min-w-0 flex-1');

function CardSectionDivider() {
  return (
    <div className="flex w-full items-end">
      <Divider className="w-full" />
    </div>
  );
}

function isElementOfType<P>(
  child: React.ReactNode,
  component: React.ComponentType<P>,
): child is React.ReactElement<P> {
  return React.isValidElement(child) && child.type === component;
}

function splitHeaderChildren(children: React.ReactNode) {
  const titles: React.ReactNode[] = [];
  const descriptions: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (isElementOfType(child, CardDescription)) {
      descriptions.push(child);
      return;
    }

    titles.push(child);
  });

  return { titles, descriptions };
}

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  className?: string;
}

export function Card({
  children,
  className,
  elevation,
  spacing,
  interactive,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={twMerge(cardVariants({ elevation, interactive, spacing }), className)}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function CardHeader({ children, className, action }: CardHeaderProps) {
  const { titles, descriptions } = splitHeaderChildren(children);
  const hasDescription = descriptions.length > 0;
  const hasTitles = titles.length > 0;

  if (!hasTitles && !hasDescription && !action) {
    return null;
  }

  return (
    <div className={twMerge('flex shrink-0 flex-col gap-1', className)}>
      <div className="flex items-end justify-between gap-2">
        {titles.length > 0 ? (
          <div className="flex min-w-0 flex-1 flex-col justify-center">{titles}</div>
        ) : null}
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {descriptions}
      {hasDescription ? <Divider className="w-full mt-2" /> : null}
    </div>
  );
}

export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return <h3 className={twMerge(cardTitleVariants(), className)}>{children}</h3>;
}

export interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  if (!hasRenderableMessage(children)) {
    return null;
  }

  return <p className={twMerge(cardDescriptionVariants(), className)}>{children}</p>;
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={twMerge(cardContentVariants(), className)}>{children}</div>;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  if (!hasRenderableMessage(children)) {
    return null;
  }

  return (
    <div className={twMerge('flex shrink-0 flex-col gap-2', className)}>
      <CardSectionDivider />
      <div className="flex w-full items-center justify-end gap-2 pt-2">{children}</div>
    </div>
  );
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;
