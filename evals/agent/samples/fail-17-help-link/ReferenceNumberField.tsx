import { Input } from '@tradenetcorp/veli-ui/input';
import { Link } from '@tradenetcorp/veli-ui/link';

export function ReferenceNumberField() {
  return (
    <Input
      label="Reference number"
      infoTooltip={
        <>
          Find it at the top of your confirmation email.{' '}
          <Link href="/help/reference-numbers">Learn more</Link>
        </>
      }
    />
  );
}
