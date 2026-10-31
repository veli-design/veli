import { Button } from '@veli-design/react/button';
import { Input } from '@veli-design/react/input';
import { Link } from '@veli-design/react/link';
import { Popover, PopoverDialog, PopoverTrigger } from '@veli-design/react/popover';

export function ReferenceNumberField() {
  return (
    <div>
      <Input
        label="Reference number"
        labelSupplementary={
          <PopoverTrigger>
            <Button size="sm" appearance="ghost" intent="secondary">
              Where is this?
            </Button>
            <Popover placement="bottom start">
              <PopoverDialog aria-label="Reference number help">
                <p>The reference number is printed at the top of your confirmation email.</p>
                <Link href="/help/reference-numbers">Learn about reference numbers</Link>
              </PopoverDialog>
            </Popover>
          </PopoverTrigger>
        }
      />
    </div>
  );
}
