'use client';

import {
  PreviewBanner,
  type PreviewBannerNotice,
} from '../components/blocks/preview-banner/preview-banner';

/**
 * Host adapter for draft-preview banners. Resolve draftMode(),
 * translations, and exit URLs in the application before mounting.
 */
export function ApplicationPreviewBanner({
  notices,
  hidden = false,
}: {
  notices: PreviewBannerNotice[];
  hidden?: boolean;
}) {
  return <PreviewBanner notices={notices} hidden={hidden} />;
}

export type { PreviewBannerNotice };
