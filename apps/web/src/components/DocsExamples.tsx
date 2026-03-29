import { Button } from '@tradenetcorp/coral-ui/button';
import { Checkbox } from '@tradenetcorp/coral-ui/checkbox';
import { Input } from '@tradenetcorp/coral-ui/input';
import { Link } from '@tradenetcorp/coral-ui/link';
import { Radio, RadioGroup } from '@tradenetcorp/coral-ui/radio';
import {
  ArrowRight,
  CalendarBlank,
  CaretDown,
  DownloadSimple,
  Info,
  MagnifyingGlass,
  Plus,
  Trash,
  WarningCircle,
} from 'phosphor-react';

export function ButtonUsageDemo() {
  return <Button>Click me</Button>;
}

export function ButtonVariantsDemo() {
  return (
    <div className="grid grid-cols-4 gap-x-8 gap-y-6 items-center min-w-[500px]">
      <div />
      <div className="text-xs font-bold uppercase text-gray-400">Fill</div>
      <div className="text-xs font-bold uppercase text-gray-400">Transparent</div>
      <div className="text-xs font-bold uppercase text-gray-400">Ghost</div>

      <div className="text-sm font-medium">Primary</div>
      <Button variant="primary" style="fill">Button</Button>
      <Button variant="primary" style="transparent">Button</Button>
      <Button variant="primary" style="ghost">Button</Button>

      <div className="text-sm font-medium">Secondary</div>
      <Button variant="secondary" style="fill">Button</Button>
      <Button variant="secondary" style="transparent">Button</Button>
      <Button variant="secondary" style="ghost">Button</Button>

      <div className="text-sm font-medium">Danger</div>
      <Button variant="danger" style="fill">Button</Button>
      <Button variant="danger" style="transparent">Button</Button>
      <Button variant="danger" style="ghost">Button</Button>
    </div>
  );
}

export function ButtonIconsDemo() {
  return (
    <div className="flex gap-4 flex-wrap items-center">
      <Button size="xl">
        <Plus size={24} weight="bold" />
        XL Button
      </Button>
      <Button size="lg" variant="secondary" style="transparent">
        <DownloadSimple size={20} weight="bold" />
        LG Button
      </Button>
      <Button size="md" variant="danger" style="ghost">
        <Trash size={16} weight="bold" />
        MD Button
      </Button>
      <Button size="xs">
        <ArrowRight size={12} weight="bold" />
        XS Button
      </Button>
    </div>
  );
}

export function ButtonSizesDemo() {
  return (
    <div className="flex gap-4 items-center flex-wrap">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  );
}

export function ButtonLoadingDemo() {
  return <Button isLoading>Processing...</Button>;
}

export function ButtonSeaglassDemo() {
  return (
    <div className="flex gap-4 items-center flex-wrap">
      <Button variant="primary" style="fill" size="xl" treatment="seaglass">
        <Plus size={24} weight="bold" />
        Label
        <ArrowRight size={24} weight="bold" />
      </Button>
      <Button variant="secondary" style="transparent" size="xl" treatment="seaglass">
        <Plus size={24} weight="bold" />
        Label
        <ArrowRight size={24} weight="bold" />
      </Button>
    </div>
  );
}

export function CheckboxUsageDemo() {
  return (
    <div className="flex flex-col gap-[12px]">
      <Checkbox>Default</Checkbox>
      <Checkbox defaultSelected>Checked</Checkbox>
      <Checkbox isIndeterminate>Indeterminate</Checkbox>
    </div>
  );
}

export function CheckboxStylesDemo() {
  return (
    <div className="flex flex-col gap-[12px]">
      <Checkbox shape="square">Square</Checkbox>
      <Checkbox shape="round">Round</Checkbox>
    </div>
  );
}

export function CheckboxDisabledDemo() {
  return (
    <div className="flex flex-col gap-[12px]">
      <Checkbox isDisabled>Off</Checkbox>
      <Checkbox defaultSelected isDisabled>On</Checkbox>
      <Checkbox isIndeterminate isDisabled>Indeterminate</Checkbox>
    </div>
  );
}

export function InputUsageDemo() {
  return (
    <div className="w-[320px]">
      <Input label="Email" placeholder="name@example.com" description="Helper text" />
    </div>
  );
}

export function InputExplorationDemo() {
  return (
    <div className="w-[320px]">
      <Input
        label="Label"
        labelSupplementary="(Optional)"
        isRequired
        labelIcon={<Info size={12} />}
        action="Action"
        placeholder="Placeholder"
        description="Helper text"
        startAddon={<MagnifyingGlass size={16} />}
        startContent={<CalendarBlank size={16} />}
        endContent={
          <span className="flex items-center gap-[4px]">
            <WarningCircle size={16} />
            <CaretDown size={16} />
          </span>
        }
        endAddon={<ArrowRight size={16} />}
      />
    </div>
  );
}

export function InputValidationDemo() {
  return (
    <div className="grid gap-[16px] md:grid-cols-2">
      <Input
        label="Required"
        placeholder="Enter value"
        isRequired
        description="Helper text"
      />
      <Input
        label="Invalid"
        placeholder="Enter value"
        isInvalid
        errorMessage="This field needs attention."
        endContent={<WarningCircle size={16} />}
      />
    </div>
  );
}

export function LinkUsageDemo() {
  return <Link href="#">Link Label</Link>;
}

export function LinkVariantsDemo() {
  return (
    <div className="grid grid-cols-4 gap-x-8 gap-y-6 items-center min-w-[500px]">
      <div />
      <div className="text-xs font-bold uppercase text-gray-400 text-center">Plain</div>
      <div className="text-xs font-bold uppercase text-gray-400 text-center">Hover Underline</div>
      <div className="text-xs font-bold uppercase text-gray-400 text-center">Always Underline</div>

      <div className="text-sm font-medium">Primary</div>
      <div className="flex justify-center"><Link variant="primary" underline="none">Link</Link></div>
      <div className="flex justify-center"><Link variant="primary" underline="hover">Link</Link></div>
      <div className="flex justify-center"><Link variant="primary" underline="always">Link</Link></div>

      <div className="text-sm font-medium">Secondary</div>
      <div className="flex justify-center"><Link variant="secondary" underline="none">Link</Link></div>
      <div className="flex justify-center"><Link variant="secondary" underline="hover">Link</Link></div>
      <div className="flex justify-center"><Link variant="secondary" underline="always">Link</Link></div>

      <div className="text-sm font-medium p-2 rounded">Inverted</div>
      <div className="flex justify-center bg-slate-900 p-2 rounded">
        <Link variant="inverted" underline="none">Link</Link>
      </div>
      <div className="flex justify-center bg-slate-900 p-2 rounded">
        <Link variant="inverted" underline="hover">Link</Link>
      </div>
      <div className="flex justify-center bg-slate-900 p-2 rounded">
        <Link variant="inverted" underline="always">Link</Link>
      </div>
    </div>
  );
}

export function LinkIconsDemo() {
  return (
    <div className="flex gap-8 flex-wrap items-center">
      <Link size="xl">
        <Plus size={24} weight="bold" />
        XL Link
      </Link>
      <Link size="lg" variant="secondary">
        <DownloadSimple size={20} weight="bold" />
        LG Link
      </Link>
      <Link size="md">
        MD Link
        <ArrowRight size={16} weight="bold" />
      </Link>
      <Link size="xs">
        <ArrowRight size={12} weight="bold" />
        XS Link
      </Link>
    </div>
  );
}

export function LinkSizesDemo() {
  return (
    <div className="flex gap-6 items-center flex-wrap">
      <Link size="xs">Extra Small</Link>
      <Link size="sm">Small</Link>
      <Link size="md">Medium</Link>
      <Link size="lg">Large</Link>
      <Link size="xl">Extra Large</Link>
    </div>
  );
}

export function RadioUsageDemo() {
  return (
    <RadioGroup aria-label="Example radio group" defaultValue="a">
      <Radio value="a">Option A</Radio>
      <Radio value="b">Option B</Radio>
      <Radio value="c">Option C</Radio>
    </RadioGroup>
  );
}

export function RadioSizesDemo() {
  return (
    <div className="flex flex-col gap-[16px]">
      <RadioGroup aria-label="Small radios" defaultValue="sm-on">
        <Radio value="sm-off" size="sm">Small Off</Radio>
        <Radio value="sm-on" size="sm">Small On</Radio>
      </RadioGroup>

      <RadioGroup aria-label="Medium radios" defaultValue="md-on">
        <Radio value="md-off" size="md">Medium Off</Radio>
        <Radio value="md-on" size="md">Medium On</Radio>
      </RadioGroup>
    </div>
  );
}

export function RadioDisabledDemo() {
  return (
    <RadioGroup aria-label="Disabled radios" defaultValue="on-disabled">
      <Radio value="off-disabled" isDisabled>Disabled Off</Radio>
      <Radio value="on-disabled" isDisabled>Disabled On</Radio>
    </RadioGroup>
  );
}
