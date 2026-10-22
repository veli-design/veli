import type { LinkProps } from '@tradenetcorp/veli-ui/link';

export type ErrorPageKind = '401' | '403' | '404' | '500' | '503' | 'offline';

/** Recovery policy and pending state belong to the application. */
export type ErrorPageAction = { label: string } & (
  | {
      type: 'link';
      href: string;
      target?: string;
      rel?: string;
      onPress?: never;
      isPending?: never;
      isDisabled?: never;
    }
  | {
      /** Callback action, rendered as an inline Veli Link without href. */
      type: 'button';
      onPress: () => void;
      isPending?: boolean;
      isDisabled?: boolean;
      href?: never;
      target?: never;
      rel?: never;
    }
);

export type ErrorPageArtworkLabels = {
  /** Describe the artwork and explain that activation changes its style. */
  changeStyle: string;
};

export type ErrorPageProps = {
  kind: ErrorPageKind;
  title: string;
  description: string;
  detail: string;
  artworkLabels: ErrorPageArtworkLabels;
  primaryAction?: ErrorPageAction;
  secondaryAction?: ErrorPageAction;
  /** Translated separator, rendered only when both actions exist. */
  actionSeparator?: string;
  report?: { prompt: string; action: ErrorPageAction };
  animation?: 'auto' | 'static';
  headingLevel?: 1 | 2 | 3;
  /** Forward all supplied props, including the ref, to a router link. */
  renderLink?: LinkProps['render'];
  className?: string;
};
