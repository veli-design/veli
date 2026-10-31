import { Kbd, KbdGroup, type KbdProps, type KbdGroupProps, type KbdVariant } from './kbd.js';

export function KbdTypeExpectations() {
  const variant: KbdVariant = 'inverted';
  const key: KbdProps = { children: 'K', lang: 'en', title: 'Key K', variant };
  const group: KbdGroupProps = { variant, dir: 'ltr', 'aria-label': 'Control K' };
  return (
    <>
      <Kbd {...key} />
      <KbdGroup {...group}>
        <Kbd>Ctrl</Kbd>
        <Kbd variant="default">K</Kbd>
      </KbdGroup>
      <KbdGroup variant={null}>
        <span>then</span>
        <Kbd>Enter</Kbd>
      </KbdGroup>
      {/* @ts-expect-error Kbd has no size variants. */}
      <Kbd size="lg">K</Kbd>
      {/* @ts-expect-error A key label is required. */}
      <Kbd />
      {/* @ts-expect-error Only default and inverted are public treatments. */}
      <Kbd variant="primary">K</Kbd>
      {/* @ts-expect-error Group treatment uses the same public variants. */}
      <KbdGroup variant="secondary" />
    </>
  );
}
