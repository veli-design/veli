'use client';

import { Dropzone } from '@tradenetcorp/veli-ui/dropzone';

export function Attachments() {
  return (
    <Dropzone
      label="Attachments"
      allowsBrowse
      acceptedFileTypes={['application/pdf', 'image/png', 'image/jpeg']}
    />
  );
}
