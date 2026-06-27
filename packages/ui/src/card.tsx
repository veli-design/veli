'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const cardPaddingClasses: Record<CardPadding, { header: string; content: string; footer: string }> =
  {
    none: { header: 'p-0', content: 'p-0', footer: 'p-0' },
    sm: { header: 'px-4 pt-4 pb-2', content: 'px-4 py-2', footer: 'px-4 py-4' },
    md: { header: 'px-6 pt-6 pb-3', content: 'px-6 py-3', footer: 'px-6 py-6' },
    lg: { header: 'px-8 pt-8 pb-4', content: 'px-8 py-4', footer: 'px-8 py-8' },
  };

const cardVariants = cva(
  'flex w-full flex-col font-sans antialiased rounded-2xl border border-border-default-subtle bg-bg-surface-raised text-text-default-default',
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
        true: 'transition-colors hover:bg-gray-alpha-100 active:bg-gray-alpha-200',
        false: '',
      },
    },
    defaultVariants: {
      elevation: 'xs',
      interactive: false,
    },
  },
);

const cardHeaderVariants = cva('flex items-start justify-between gap-4');

const cardTitleVariants = cva('type-subtitle-medium text-text-default-emphasis');

const cardDescriptionVariants = cva('mt-1 type-body-sm-regular text-text-default-muted');

const cardContentVariants = cva('type-body-md-regular text-text-default-default');

const cardFooterVariants = cva(
  'flex items-center justify-end gap-2 border-t border-border-default-subtle',
);

const CardPaddingContext = React.createContext<CardPadding>('md');

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  className?: string;
  padding?: CardPadding;
}

export function Card({
  children,
  className,
  elevation = 'xs',
  padding = 'md',
  interactive = false,
  ...props
}: CardProps) {
  return (
    <CardPaddingContext.Provider value={padding ?? 'md'}>
      <div {...props} className={twMerge(cardVariants({ elevation, interactive }), className)}>
        {children}
      </div>
    </CardPaddingContext.Provider>
  );
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function CardHeader({ children, className, action }: CardHeaderProps) {
  const padding = React.useContext(CardPaddingContext);

  return (
    <div className={twMerge(cardHeaderVariants(), cardPaddingClasses[padding].header, className)}>
      <div className="min-w-0 flex-1">{children}</div>
      {action ? <div className="shrink-0">{action}</div> : null}
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
  return <p className={twMerge(cardDescriptionVariants(), className)}>{children}</p>;
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  const padding = React.useContext(CardPaddingContext);

  return (
    <div className={twMerge(cardContentVariants(), cardPaddingClasses[padding].content, className)}>
      {children}
    </div>
  );
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  const padding = React.useContext(CardPaddingContext);

  return (
    <div className={twMerge(cardFooterVariants(), cardPaddingClasses[padding].footer, className)}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;
