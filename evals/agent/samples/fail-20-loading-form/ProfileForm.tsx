import { Button } from '@tradenetcorp/veli-ui/button';
import { Input } from '@tradenetcorp/veli-ui/input';
import { Skeleton } from '@tradenetcorp/veli-ui/skeleton';

export function ProfileForm({ isLoading, isSaving }: { isLoading: boolean; isSaving: boolean }) {
  return (
    <form>
      <Input label="Full name" isSkeleton={isLoading} />
      <Input label="Email" isSkeleton={isLoading} />
      {isSaving ? <Skeleton className="h-10 w-28" /> : <Button type="submit">Save</Button>}
    </form>
  );
}
