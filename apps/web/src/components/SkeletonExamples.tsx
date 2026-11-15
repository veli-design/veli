import { Skeleton } from '@veli-design/react/skeleton';

export function SkeletonUsageDemo() {
  return (
    <div aria-busy="true" aria-label="Loading content" className="w-[320px] space-y-3">
      <Skeleton className="h-5 w-2/5 rounded-sm" />
      <div className="space-y-2">
        <Skeleton className="h-2.5 w-full rounded-xs" />
        <Skeleton className="h-2.5 w-full rounded-xs" />
        <Skeleton className="h-2.5 w-4/5 rounded-xs" />
      </div>
    </div>
  );
}
