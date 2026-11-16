import { Tabs } from '@veli-design/react/tabs';

const TAB_ITEMS = [
  { id: 'overview', label: 'Overview', panel: 'Summary of the service and what it offers.' },
  { id: 'services', label: 'Services', panel: 'The list of services available under this agency.' },
  { id: 'pricing', label: 'Pricing', panel: 'Fees, schedules, and payment options.' },
] as const;

export function TabsUsageDemo() {
  return (
    <div className="w-full max-w-[520px]">
      <Tabs listAriaLabel="Service sections" items={TAB_ITEMS} />
    </div>
  );
}

export function TabsOverflowDemo() {
  return (
    <div className="min-h-56 w-full max-w-[520px]">
      <Tabs
        listAriaLabel="Workspace sections"
        items={TAB_ITEMS}
        overflowItems={[
          { id: 'billing', label: 'Billing', panel: 'Invoices and payment methods.' },
          { id: 'integrations', label: 'Integrations', panel: 'Connected apps and APIs.' },
          { id: 'audit-log', label: 'Audit log', panel: 'Recent account activity.' },
        ]}
      />
    </div>
  );
}
