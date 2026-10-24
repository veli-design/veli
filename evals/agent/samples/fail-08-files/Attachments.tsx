'use client';

import { Dropzone } from '@veli-design/react/dropzone';

export function Attachments() {
  return (
    <Dropzone
      label="Attachments"
      allowsBrowse
      acceptedFileTypes={['application/pdf', 'image/png', 'image/jpeg']}
    />
  );
}
