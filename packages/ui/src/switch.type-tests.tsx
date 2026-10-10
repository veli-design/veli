import { useRef } from 'react';
import { Switch, type SwitchProps } from './switch.js';

export function SwitchTypeExpectations() {
  const rootRef = useRef<HTMLLabelElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const controlled: SwitchProps = {
    isSelected: true,
    onChange: (selected: boolean) => void selected,
    appearance: 'subtle',
    size: 'sm',
  };

  return (
    <>
      <Switch {...controlled} ref={rootRef} inputRef={inputRef}>
        Notifications
      </Switch>
      <Switch aria-label="Notifications" isReadOnly />
      <Switch form="settings" name="notifications" value="enabled" defaultSelected />
      <Switch aria-labelledby="setting-label" aria-describedby="setting-description" />
      {/* @ts-expect-error styling internals is outside the Veli API */}
      <Switch style={{ color: 'red' }} />
      {/* @ts-expect-error children are label content, not a render function */}
      <Switch>{() => 'Label'}</Switch>
      {/* @ts-expect-error Figma has no extra-large size */}
      <Switch size="xl" />
      {/* @ts-expect-error Figma has no danger appearance */}
      <Switch appearance="danger" />
      {/* @ts-expect-error Switch is a setting toggle, not a required consent field */}
      <Switch isRequired />
      {/* @ts-expect-error validation belongs to the application */}
      <Switch isInvalid />
    </>
  );
}
