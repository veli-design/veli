import { useState } from 'react';
import { Divider } from '@veli-design/react/divider';

export function DividerUsageDemo() {
  return (
    <div className="w-full max-w-[480px] space-y-[12px]">
      <div>
        <h3 className="type-body-sm-medium text-base-emphasis">Applicant details</h3>
        <p className="type-caption-12-regular text-base-muted">
          Review the information before continuing.
        </p>
      </div>
      <Divider />
      <div className="space-y-[8px] type-body-sm-regular text-base">
        <p>Name: Aishath Mariyam</p>
        <p>Island: Male&apos;</p>
      </div>
    </div>
  );
}

export function DividerExpandableDemo() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full max-w-[480px] space-y-[12px]">
      <p className="type-body-sm-regular text-base">
        Keep a long section concise, then let readers choose when to reveal the remaining details.
      </p>
      <div id="divider-expanded-guidance" hidden={!expanded}>
        <p className="type-body-sm-regular text-base">
          The caller owns the expanded content and state. Add motion to the content only when it
          suits the experience, and respect reduced-motion preferences.
        </p>
      </div>
      <Divider
        text={expanded ? 'Show less' : 'Show more'}
        showIcon
        appearance="muted"
        aria-label={expanded ? 'Show less' : 'Show more'}
        aria-expanded={expanded}
        aria-controls="divider-expanded-guidance"
        onClick={() => setExpanded((current) => !current)}
      />
    </div>
  );
}

export function DividerAppearancesDemo() {
  return (
    <div className="w-full max-w-[480px] space-y-3 type-body-sm-regular text-base">
      <p>Passport number</p>
      <Divider />
      <p>National ID number</p>
      <Divider appearance="muted" />
      <p>Driving license number</p>
      <Divider appearance="strong" />
      <p>Permit reference</p>
      <Divider appearance="emphasis" />
      <p>Supporting documents</p>
    </div>
  );
}

export function DividerVerticalOrientationDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3 type-body-sm-regular text-base">
      <span>Overview</span>
      <Divider orientation="vertical" />
      <span>Documents</span>
      <Divider orientation="vertical" />
      <span>History</span>
    </div>
  );
}
