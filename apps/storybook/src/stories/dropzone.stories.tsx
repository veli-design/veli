import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  FileUpload,
  FileUploadClear,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  Dropzone,
  type FileUploadProps,
} from '@tradenetcorp/veli-ui/dropzone';

const meta = {
  title: 'Components/Dropzone',
  component: FileUpload,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

type Rejection = { id: string; fileName: string; message: string };

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

function FileUploadStory({
  children,
  onFileReject: onFileRejectProp,
  ...props
}: FileUploadProps & { children?: ReactNode }) {
  const [files, setFiles] = useState<File[]>([]);
  const [rejections, setRejections] = useState<Rejection[]>([]);

  return (
    <div className="w-[480px] space-y-3">
      <FileUpload
        multiple
        value={files}
        onValueChange={setFiles}
        onFileReject={(file, message) => {
          setRejections((current) => [
            ...current,
            { id: `${file.name}-${Date.now()}`, fileName: file.name, message },
          ]);
          onFileRejectProp?.(file, message);
        }}
        {...props}
      >
        {children ?? <FileUploadDropzone />}
        <FileUploadList>
          {files.map((file) => (
            <FileUploadItem key={`${file.name}-${file.lastModified}`} value={file}>
              <FileUploadItemPreview />
              <FileUploadItemMetadata />
              <FileUploadItemProgress />
              <FileUploadItemDelete />
            </FileUploadItem>
          ))}
        </FileUploadList>
        <FileUploadClear />
      </FileUpload>

      {rejections.length > 0 ? (
        <div
          role="status"
          className="rounded-xl border border-border-danger-default bg-button-danger-subtle-default px-4 py-3"
        >
          <p className="type-body-sm-medium text-text-danger-muted">Rejected files</p>
          <ul className="mt-2 space-y-1">
            {rejections.map((rejection) => (
              <li key={rejection.id} className="type-caption-regular text-text-danger-muted">
                <span className="font-medium">{rejection.fileName}</span> — {rejection.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <FileUploadStory label="Upload attachments">
      <FileUploadDropzone />
    </FileUploadStory>
  ),
};

export const AcceptedFileTypes: Story = {
  name: 'Accepted file types',
  render: () => (
    <FileUploadStory label="Upload documents" accept="application/pdf,image/png,image/jpeg">
      <FileUploadDropzone>
        <span className="type-body-md-medium text-text-default-default">
          Drag & drop files here
        </span>
        <span className="type-body-sm-regular text-text-default-subtle">PDF, PNG, or JPG only</span>
      </FileUploadDropzone>
    </FileUploadStory>
  ),
};

export const MaxFileSize: Story = {
  name: 'Max file size',
  render: () => {
    const maxSize = 1 * 1024 * 1024;

    return (
      <FileUploadStory label="Upload with size limit" maxSize={maxSize}>
        <FileUploadDropzone>
          <span className="type-body-md-medium text-text-default-default">
            Drag & drop files here
          </span>
          <span className="type-body-sm-regular text-text-default-subtle">
            Each file must be {formatBytes(maxSize)} or smaller
          </span>
        </FileUploadDropzone>
      </FileUploadStory>
    );
  },
};

export const MaxFiles: Story = {
  name: 'Max files',
  render: () => (
    <FileUploadStory label="Limited attachments" maxFiles={2}>
      <FileUploadDropzone>
        <span className="type-body-md-medium text-text-default-default">
          Drag & drop files here
        </span>
        <span className="type-body-sm-regular text-text-default-subtle">Upload up to 2 files</span>
      </FileUploadDropzone>
    </FileUploadStory>
  ),
};

export const CombinedLimits: Story = {
  name: 'Combined limits',
  render: () => {
    const maxSize = 5 * 1024 * 1024;

    return (
      <FileUploadStory
        label="Attachments"
        accept="application/pdf,image/png,image/jpeg"
        maxFiles={2}
        maxSize={maxSize}
      >
        <FileUploadDropzone>
          <span className="type-body-md-medium text-text-default-default">
            Drag & drop files here
          </span>
          <span className="type-body-sm-regular text-text-default-subtle">
            Max 2 files · PDF, PNG, or JPG · up to {formatBytes(maxSize)} each
          </span>
        </FileUploadDropzone>
      </FileUploadStory>
    );
  },
};

export const CustomValidation: Story = {
  name: 'Custom validation',
  render: () => (
    <FileUploadStory
      label="Invoice upload"
      accept="application/pdf"
      onFileValidate={(file) => {
        if (!file.name.toLowerCase().includes('invoice')) {
          return 'File name must include "invoice"';
        }
        return null;
      }}
    >
      <FileUploadDropzone>
        <span className="type-body-md-medium text-text-default-default">Upload an invoice PDF</span>
        <span className="type-body-sm-regular text-text-default-subtle">
          PDF only · filename must contain &quot;invoice&quot;
        </span>
      </FileUploadDropzone>
    </FileUploadStory>
  ),
};

export const ImageWildcard: Story = {
  name: 'Image wildcard (image/*)',
  render: () => (
    <FileUploadStory label="Upload images" accept="image/*" maxSize={4 * 1024 * 1024}>
      <FileUploadDropzone>
        <span className="type-body-md-medium text-text-default-default">
          Drag & drop images here
        </span>
        <span className="type-body-sm-regular text-text-default-subtle">
          Any image type · up to 4 MB each
        </span>
      </FileUploadDropzone>
    </FileUploadStory>
  ),
};

export const DirectUpload: Story = {
  render: () => {
    const [files, setFiles] = useState<File[]>([]);

    return (
      <div className="w-[480px] space-y-3">
        <FileUpload
          label="Direct upload"
          maxFiles={10}
          maxSize={5 * 1024 * 1024}
          multiple
          value={files}
          onValueChange={setFiles}
          onUpload={async (uploadFiles, { onProgress, onSuccess }) => {
            for (const file of uploadFiles) {
              for (let progress = 0; progress <= 100; progress += 20) {
                await new Promise((resolve) => setTimeout(resolve, 120));
                onProgress(file, progress);
              }
              onSuccess(file);
            }
          }}
        >
          <FileUploadDropzone />
          <FileUploadList>
            {files.map((file) => (
              <FileUploadItem key={`${file.name}-${file.lastModified}`} value={file}>
                <FileUploadItemPreview />
                <FileUploadItemMetadata />
                <FileUploadItemProgress variant="circular" size={36} />
                <FileUploadItemDelete />
              </FileUploadItem>
            ))}
          </FileUploadList>
        </FileUpload>
      </div>
    );
  },
};

export const ConvenienceWrapper: Story = {
  name: 'Dropzone wrapper',
  render: () => (
    <div className="w-[480px]">
      <Dropzone
        label="Attachments"
        aria-label="Upload attachments"
        description="Supported formats: PDF, PNG, JPG up to 10 MB."
        hint="PDF, PNG, or JPG only"
        allowsBrowse
        acceptedFileTypes={['application/pdf', 'image/png', 'image/jpeg']}
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex w-[520px] flex-col gap-4">
      <Dropzone size="sm" aria-label="Small dropzone" allowsBrowse />
      <Dropzone size="md" aria-label="Medium dropzone" allowsBrowse />
      <Dropzone size="lg" aria-label="Large dropzone" allowsBrowse />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-[480px]">
      <Dropzone label="Uploads paused" aria-label="Uploads paused" isDisabled />
    </div>
  ),
};
