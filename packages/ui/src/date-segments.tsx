import { DateInput, DateSegment } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';
import { dateInputVariants, getDateSegmentClassName } from './date-shared-variants';

export function DateSegments({
  className,
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <DateInput className={twMerge(dateInputVariants({ size }), className)}>
      {(segment) => (
        <DateSegment
          segment={segment}
          className={(state) => getDateSegmentClassName(state, size)}
        />
      )}
    </DateInput>
  );
}
