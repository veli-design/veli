import { DateInput, DateSegment, type DateSegmentRenderProps } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';
import { dateInputVariants, getDateSegmentClassName } from './date-shared-variants.js';

export function DateSegments({
  className,
  size = 'md',
  lang,
  dir,
  segmentClassName,
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  lang?: string;
  dir?: 'ltr' | 'rtl';
  segmentClassName?: (state: DateSegmentRenderProps) => string;
}) {
  return (
    <DateInput lang={lang} dir={dir} className={twMerge(dateInputVariants({ size }), className)}>
      {(segment) => (
        <DateSegment
          segment={segment}
          className={(state) =>
            twMerge(getDateSegmentClassName(state, size), segmentClassName?.(state))
          }
        />
      )}
    </DateInput>
  );
}
