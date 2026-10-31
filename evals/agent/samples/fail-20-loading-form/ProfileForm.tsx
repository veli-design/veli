import { Button } from '@veli-design/react/button';
import { Input } from '@veli-design/react/input';
import { Skeleton } from '@veli-design/react/skeleton';

export function ProfileForm({ isLoading, isSaving }: { isLoading: boolean; isSaving: boolean }) {
  return (
    <form>
      <Input label="Full name" isSkeleton={isLoading} />
      <Input label="Email" isSkeleton={isLoading} />
      {isSaving ? <Skeleton className="h-10 w-28" /> : <Button type="submit">Save</Button>}
    </form>
  );
}
