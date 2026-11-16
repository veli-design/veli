import { useState } from 'react';
import { DropzoneField, type DropzoneProps } from '@veli-design/react/dropzone';

const simulateDropzoneUpload: NonNullable<DropzoneProps['onUpload']> = async (
  files,
  { onProgress, onSuccess },
) => {
  await Promise.all(
    files.map(async (file) => {
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        onProgress(file, progress);
      }
      onSuccess(file);
    }),
  );
};

export function DropzoneUsageDemo() {
  return (
    <div className="w-full max-w-[496px]">
      <DropzoneField
        label="Attachment"
        isOptional
        description="PDF, PNG or JPG · up to 10 MB each"
        secondaryText="Up to 10 MB"
        acceptedFileTypes={['application/pdf', 'image/png', 'image/jpeg']}
        maxSize={10 * 1024 * 1024}
        onUpload={simulateDropzoneUpload}
      />
    </div>
  );
}

export function DropzoneMultipleDemo() {
  return (
    <div className="w-full max-w-[496px]">
      <DropzoneField
        multiple
        label="Attachments"
        description="Up to 5 files"
        secondaryText="Up to 10 MB each"
        maxFiles={5}
        maxSize={10 * 1024 * 1024}
        onUpload={simulateDropzoneUpload}
      />
    </div>
  );
}

export function DropzoneValidationDemo() {
  const [error, setError] = useState<string>();

  return (
    <div className="w-full max-w-[496px]">
      <DropzoneField
        multiple
        label="Documents"
        description="PDF only · up to 2 MB each"
        errorMessage={error}
        acceptedFileTypes={['application/pdf']}
        maxSize={2 * 1024 * 1024}
        onAccept={() => setError(undefined)}
        onFileReject={(file, message) => setError(`${file.name}: ${message}`)}
      />
    </div>
  );
}
