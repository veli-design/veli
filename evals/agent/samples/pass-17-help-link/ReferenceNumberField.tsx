import { Button } from '@tradenetcorp/veli-ui/button';
import { Input } from '@tradenetcorp/veli-ui/input';
import { Link } from '@tradenetcorp/veli-ui/link';
import { Popover, PopoverDialog, PopoverTrigger } from '@tradenetcorp/veli-ui/popover';

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
