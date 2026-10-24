import { Input } from '@veli-design/react/input';
import { Link } from '@veli-design/react/link';

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
