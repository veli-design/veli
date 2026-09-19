export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="type-body-lg-semibold text-base-strong">Settings</h2>
      <p className="type-body-md-regular text-base-default">
        Route content for <code>/team/settings</code>. This tab uses a per-item <code>render</code>{' '}
        prop wrapping <code>next/link</code>.
      </p>
    </div>
  );
}
