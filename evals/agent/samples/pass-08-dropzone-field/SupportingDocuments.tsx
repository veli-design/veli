'use client';

import { useState } from 'react';
import { DropzoneField } from '@veli-design/react/dropzone';

export function SupportingDocuments() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <DropzoneField
      label="Supporting documents"
      acceptedFileTypes={['application/pdf', 'image/*']}
      maxFiles={2}
      multiple
      secondaryText="PDF or images, up to 2 files"
      value={files}
      onValueChange={setFiles}
    />
  );
}
