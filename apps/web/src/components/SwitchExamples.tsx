import { Switch } from '@tradenetcorp/veli-ui/switch';

export function SwitchUsageDemo() {
  return <Switch>Notifications</Switch>;
}

export function SwitchAppearancesDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Switch defaultSelected>Default</Switch>
      <Switch appearance="subtle" defaultSelected>
        Subtle
      </Switch>
    </div>
  );
}

export function SwitchStatesDemo() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {(['default', 'subtle'] as const).map((appearance) => (
        <div key={appearance} className="flex flex-col gap-4">
          <span className="type-body-sm-medium text-base-muted">
            {appearance === 'default' ? 'Default' : 'Subtle'}
          </span>
          <Switch appearance={appearance}>Off</Switch>
          <Switch appearance={appearance} defaultSelected>
            On
          </Switch>
          <Switch appearance={appearance} isDisabled>
            Disabled off
          </Switch>
          <Switch appearance={appearance} isDisabled defaultSelected>
            Disabled on
          </Switch>
          <Switch appearance={appearance} isReadOnly defaultSelected>
            Read only
          </Switch>
        </div>
      ))}
    </div>
  );
}
