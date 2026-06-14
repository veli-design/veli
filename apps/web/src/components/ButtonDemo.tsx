import { Button } from '@tradenetcorp/veli-ui/button';

export function ButtonDemo() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Variants</h3>
        <div className="flex gap-3 flex-wrap">
          <Button intent="primary">Primary</Button>
          <Button intent="secondary">Secondary</Button>
          <Button intent="secondary" appearance="transparent">
            Outline
          </Button>
          <Button intent="primary" appearance="ghost">
            Ghost
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Sizes</h3>
        <div className="flex gap-3 items-center flex-wrap">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">States</h3>
        <div className="flex gap-3 flex-wrap">
          <Button>Default</Button>
          <Button isDisabled>Disabled</Button>
        </div>
      </div>
    </div>
  );
}
