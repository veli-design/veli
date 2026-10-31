import type { ReactNode } from 'react';
import type { LinkProps } from '@veli-design/react/link';

export type ServiceAction = {
  id: string;
  label: string;
  isDisabled?: boolean;
  disabledReason?: string;
  emphasis?: 'primary' | 'secondary';
  /** Veli Button appearance; e.g. transparent for a secondary download action. */
  appearance?: 'fill' | 'transparent' | 'ghost';
  /** Decorative, caller-supplied icon, such as an external-platform arrow. */
  trailingIcon?: ReactNode;
} & (
  | { href: string; target?: string; rel?: string; onPress?: never }
  | { onPress: () => void; href?: never; target?: never; rel?: never }
  | { isDisabled: true; href?: never; onPress?: never; target?: never; rel?: never }
);

/** IDs must be unique within this guideline; the block namespaces DOM IDs per instance. */
export type GuidelineContent =
  | {
      sections: readonly {
        id: string;
        title?: string;
        body: ReactNode;
        /** Use the 12px introductory gap instead of the default 16px heading gap. */
        headingSpacing?: 'compact';
      }[];
      body?: never;
    }
  | { body: ReactNode; sections?: never };

export type ServiceGuideline = {
  title: string;
  description?: string;
  updatedText?: string;
  content: GuidelineContent;
  onCopyLink?: () => Promise<void>;
  summary?: {
    content?: ReactNode;
    isPending?: boolean;
    error?: string;
    onRequest?: () => void;
  };
};

type ApplyBase = {
  platform?: { name: string; logo?: ReactNode };
  notice?: { title: string; description: string };
  information?: {
    title: string;
    steps: readonly { id: string; title: string; description: string }[];
  };
};
export type ServiceApply = ApplyBase &
  (
    | {
        mode: 'manual';
        forms: readonly {
          id: string;
          title: string;
          action?: ServiceAction;
          fileMeta?: string;
          guideline?: ServiceGuideline;
        }[];
        downloadAll?: ServiceAction;
        submissionDetails?: ReactNode;
        action?: never;
      }
    | { mode: 'online' | 'mixed' | 'external'; action?: ServiceAction; forms?: never }
  );

/** Supply every visible/assistive UI label from the host dictionary. */
export type ServiceDetailLabels = {
  providedBy: string;
  serviceSummary: string;
  applicationTime: string;
  processingTime: string;
  eligibility: string;
  fees: string;
  feesByType: string;
  showFees: string;
  hideFees: string;
  services: string;
  showLess: string;
  moreServices: (count: number) => string;
  apply: string;
  applyOn: string;
  beforeYouStart: string;
  prerequisiteIntroduction: string;
  readGuideline: string;
  guidelineIntroduction: string;
  guidelineUnavailable: string;
  closeGuideline: string;
  closeInformation: string;
  guidelineContents: string;
  guidelineCaption: string;
  showSummary: string;
  showFullGuideline: string;
  summaryPending: string;
  copyGuidelineLink: string;
  linkCopied: string;
  linkCopyFailed: string;
};
export type ServiceDetailProps = {
  title: string;
  description?: string;
  provider?: { name: string; href?: string };
  metadata?: {
    applicationTime?: string;
    processingTime?: string;
    eligibility?: string;
    feeSummary?: string;
    fees?: readonly { id: string; label: string; value: string }[];
  };
  services?: readonly { id: string; name: string }[];
  prerequisites?: readonly string[];
  apply: ServiceApply;
  guideline?: ServiceGuideline;
  labels: ServiceDetailLabels;
  renderLink?: LinkProps['render'];
  isGuidelineOpen?: boolean;
  defaultGuidelineOpen?: boolean;
  onGuidelineOpenChange?: (open: boolean) => void;
  className?: string;
  /** Applied to both dialog surfaces. Scope any descendant overrides under this class. */
  dialogClassName?: string;
  overlayClassName?: string;
};
