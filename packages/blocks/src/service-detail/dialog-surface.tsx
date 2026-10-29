'use client';

import type { ReactNode } from 'react';
import { Dialog, Modal, ModalOverlay } from 'react-aria-components';
import { useVeliColorScheme, useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

/** React Aria owns focus trapping, restoration, dismissal and scroll locking. */
export function DialogSurface({
  children,
  sheet = false,
  dialogClassName,
  overlayClassName,
}: {
  children: ReactNode;
  sheet?: boolean;
  dialogClassName?: string;
  overlayClassName?: string;
}) {
  const language = useVeliLanguage();
  const { resolvedColorScheme } = useVeliColorScheme();
  return (
    <ModalOverlay
      isDismissable
      lang={language.lang}
      dir={language.direction}
      data-theme={resolvedColorScheme}
      className={`veli-service-detail-overlay ${resolvedColorScheme === 'dark' ? 'dark' : ''} ${sheet ? 'veli-service-detail-guideline-overlay' : ''} ${overlayClassName ?? ''}`}
    >
      <Modal
        className={`${sheet ? 'veli-service-detail-guideline-sheet' : 'veli-service-detail-dialog'} ${dialogClassName ?? ''}`}
        lang={language.lang}
        dir={language.direction}
      >
        <Dialog className="veli-service-detail-dialog-body">{children}</Dialog>
      </Modal>
    </ModalOverlay>
  );
}
