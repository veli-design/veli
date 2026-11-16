import { useState } from 'react';
import { Breadcrumb, BreadcrumbOverflow, Breadcrumbs } from '@veli-design/react/breadcrumbs';

type BreadcrumbTrailItem = {
  id: string;
  label: string;
  href?: string;
};

const BREADCRUMB_TRAIL: BreadcrumbTrailItem[] = [
  { id: 'home', label: 'Home', href: '#' },
  { id: 'services', label: 'Services', href: '#' },
  { id: 'permits', label: 'Permits', href: '#' },
  { id: 'fishing', label: 'Fishing permit' },
];

const BREADCRUMB_OVERFLOW_ITEMS = [
  { id: 'applications', label: 'Applications', href: '#' },
  { id: 'permits', label: 'Permits', href: '#' },
];

export function BreadcrumbsUsageDemo() {
  return (
    <Breadcrumbs aria-label="Breadcrumb">
      <Breadcrumb href="#">Home</Breadcrumb>
      <Breadcrumb href="#">Services</Breadcrumb>
      <Breadcrumb href="#">Permits</Breadcrumb>
      <Breadcrumb>Fishing permit</Breadcrumb>
    </Breadcrumbs>
  );
}

export function BreadcrumbsBackLinkDemo() {
  return (
    <Breadcrumbs aria-label="Back breadcrumb" showBackLink backLinkHref="#" backLinkLabel="Back">
      <Breadcrumb href="#">Services</Breadcrumb>
      <Breadcrumb>Fishing permit</Breadcrumb>
    </Breadcrumbs>
  );
}

export function BreadcrumbsOverflowDemo() {
  return (
    <Breadcrumbs aria-label="Overflow breadcrumb">
      <Breadcrumb href="#">Home</Breadcrumb>
      <BreadcrumbOverflow items={BREADCRUMB_OVERFLOW_ITEMS} />
      <Breadcrumb href="#">Permits</Breadcrumb>
      <Breadcrumb>Fishing permit</Breadcrumb>
    </Breadcrumbs>
  );
}

export function BreadcrumbsDisabledDemo() {
  return (
    <Breadcrumbs aria-label="Disabled breadcrumb">
      <Breadcrumb href="#">Home</Breadcrumb>
      <Breadcrumb href="#" isDisabled>
        Archived services
      </Breadcrumb>
      <Breadcrumb>Permit details</Breadcrumb>
    </Breadcrumbs>
  );
}

export function BreadcrumbsDataDrivenDemo() {
  const [currentIndex, setCurrentIndex] = useState(BREADCRUMB_TRAIL.length - 1);
  const items = BREADCRUMB_TRAIL.slice(0, currentIndex + 1);

  return (
    <Breadcrumbs
      aria-label="Application breadcrumb"
      items={items}
      onAction={(key) => {
        const nextIndex = BREADCRUMB_TRAIL.findIndex((item) => item.id === key);
        if (nextIndex >= 0) {
          setCurrentIndex(nextIndex);
        }
      }}
    >
      {(item) => <Breadcrumb href={item.href}>{item.label}</Breadcrumb>}
    </Breadcrumbs>
  );
}
