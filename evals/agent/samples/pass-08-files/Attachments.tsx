'use client';

import { useState } from 'react';
import {
  Dropzone,
  DropzoneArea,
  DropzoneItem,
  DropzoneItemDelete,
  DropzoneItemMetadata,
  DropzoneList,
  useDropzone,
} from '@tradenetcorp/veli-ui/dropzone';

function FileListItems() {
  const files = useDropzone((state) =>
    Array.from(state.files.values()).map((fileState) => fileState.file),
  );

  return files.map((file) => (
    <DropzoneItem key={`${file.name}-${file.lastModified}`} value={file}>
      <DropzoneItemMetadata />
      <DropzoneItemDelete />
    </DropzoneItem>
  ));
}

export function Attachments() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <Dropzone
      label="Attachments"
      accept="application/pdf,image/png,image/jpeg"
      maxFiles={2}
      multiple
      value={files}
      onValueChange={setFiles}
    >
      <DropzoneArea />
      <DropzoneList>
        <FileListItems />
      </DropzoneList>
    </Dropzone>
  );
}
