import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
  useFileUpload,
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

function FileUploadListItems({ children }: { children?: React.ReactNode }) {
  const files = useFileUpload((state) =>
    Array.from(state.files.values()).map((fileState) => fileState.file),
  );

  return (
    <>
      {files.map((file) => (
        <FileUploadItem key={`${file.name}-${file.lastModified}`} value={file}>
          {children}
        </FileUploadItem>
      ))}
    </>
  );
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
          <FileUploadListItems>
            <FileUploadItemPreview />
            <FileUploadItemMetadata />
            <FileUploadItemProgress />
            <FileUploadItemDelete />
          </FileUploadListItems>
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

function createDemoFile(name: string, type: string, content?: BlobPart) {
  const payload = content ?? new Uint8Array(420 * 1024);
  return new File([payload], name, { type, lastModified: Date.now() });
}

const DEMO_UPLOAD_FILES = [
  createDemoFile('report-15.pdf', 'application/pdf'),
  createDemoFile('design-45.pdf', 'application/pdf'),
  createDemoFile('archive-72.zip', 'application/zip'),
  createDemoFile(
    'photo-62.svg',
    'image/svg+xml',
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#6366f1"/><circle cx="40" cy="40" r="18" fill="#c7d2fe"/></svg>',
  ),
  createDemoFile('failed-upload.pdf', 'application/pdf'),
  createDemoFile('complete.pdf', 'application/pdf'),
];

type DemoUploadTarget = {
  progress: number;
  done?: boolean;
  error?: string;
};

const DEMO_UPLOAD_TARGETS: Record<string, DemoUploadTarget> = {
  'report-15.pdf': { progress: 15 },
  'design-45.pdf': { progress: 45 },
  'archive-72.zip': { progress: 72 },
  'photo-62.svg': { progress: 62 },
  'failed-upload.pdf': { progress: 68, error: 'Network connection lost' },
  'complete.pdf': { progress: 100, done: true },
};

function createDemoUploadHandler() {
  return async (
    files: File[],
    {
      onProgress,
      onSuccess,
      onError,
    }: {
      onProgress: (file: File, progress: number) => void;
      onSuccess: (file: File) => void;
      onError: (file: File, error: Error) => void;
    },
  ) => {
    for (const file of files) {
      const target = DEMO_UPLOAD_TARGETS[file.name];

      if (!target) {
        onProgress(file, 30);
        continue;
      }

      onProgress(file, target.progress);

      if (target.error) {
        onError(file, new Error(target.error));
        continue;
      }

      if (target.done) {
        onSuccess(file);
      }
    }
  };
}

function injectDemoFiles(container: HTMLElement) {
  const dropzone = container.querySelector('[data-slot="file-upload-dropzone"]');
  if (!dropzone) {
    return false;
  }

  const dataTransfer = new DataTransfer();
  for (const file of DEMO_UPLOAD_FILES) {
    dataTransfer.items.add(file);
  }

  dropzone.dispatchEvent(
    new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      dataTransfer,
    }),
  );

  return true;
}

function UploadProgressDemoPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="type-body-md-medium text-text-default-default">{title}</h3>
        <p className="type-body-sm-regular text-text-default-subtle">{description}</p>
      </div>
      {children}
    </section>
  );
}

function UploadProgressFileList({
  variant,
  progressSize = 40,
  showFillOverlay = false,
}: {
  variant: 'linear' | 'circular' | 'fill';
  progressSize?: number;
  showFillOverlay?: boolean;
}) {
  const files = useFileUpload((state) =>
    Array.from(state.files.values()).map((fileState) => fileState.file),
  );

  return (
    <>
      {files.map((file) => (
        <FileUploadItem key={`${file.name}-${file.lastModified}`} value={file}>
          <FileUploadItemPreview />
          <FileUploadItemMetadata />
          {variant === 'circular' ? (
            <FileUploadItemProgress variant="circular" size={progressSize} forceMount />
          ) : null}
          <FileUploadItemDelete />
          {variant === 'fill' || showFillOverlay ? (
            <FileUploadItemProgress variant="fill" forceMount />
          ) : null}
          {variant === 'linear' ? <FileUploadItemProgress variant="linear" forceMount /> : null}
        </FileUploadItem>
      ))}
    </>
  );
}

function UploadProgressShowcase({
  variant = 'linear',
  progressSize = 40,
  showFillOverlay = false,
}: {
  variant?: 'linear' | 'circular' | 'fill';
  progressSize?: number;
  showFillOverlay?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [seed, setSeed] = useState(0);
  const onUpload = useMemo(() => createDemoUploadHandler(), []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (rootRef.current) {
        injectDemoFiles(rootRef.current);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [seed]);

  return (
    <div ref={rootRef} className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="type-caption-regular text-text-default-subtle">
          Fixed demo states: 15%, 45%, 72%, 62%, failed, and complete.
        </p>
        <button
          type="button"
          className="rounded-full border border-border-default-subtle px-3 py-1.5 type-caption-medium text-text-default-default transition-colors hover:bg-button-secondary-subtle-hover"
          onClick={() => setSeed((current) => current + 1)}
        >
          Reload demo
        </button>
      </div>

      <FileUpload key={seed} label={`${variant} upload progress`} multiple onUpload={onUpload}>
        <FileUploadDropzone showTrigger={false}>
          <span className="type-body-sm-regular text-text-default-subtle">
            Demo files load automatically for styling.
          </span>
        </FileUploadDropzone>
        <FileUploadList>
          <UploadProgressFileList
            variant={variant}
            progressSize={progressSize}
            showFillOverlay={showFillOverlay}
          />
        </FileUploadList>
      </FileUpload>
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

export const UploadProgress: Story = {
  name: 'Upload progress indicators',
  parameters: {
    layout: 'padded',
  },
  render: () => (
    <div className="flex w-full max-w-[560px] flex-col gap-10">
      <UploadProgressDemoPanel
        title="Linear"
        description="Default track and bar. Includes in-progress, failed, and complete (100%) states."
      >
        <UploadProgressShowcase variant="linear" />
      </UploadProgressDemoPanel>

      <UploadProgressDemoPanel
        title="Circular"
        description="Compact ring indicator for dense file rows."
      >
        <UploadProgressShowcase variant="circular" progressSize={44} />
      </UploadProgressDemoPanel>

      <UploadProgressDemoPanel
        title="Fill overlay"
        description="Full-row overlay clipped from the top. Useful while an item is uploading."
      >
        <UploadProgressShowcase variant="fill" />
      </UploadProgressDemoPanel>
    </div>
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
            <FileUploadListItems>
              <FileUploadItemPreview />
              <FileUploadItemMetadata />
              <FileUploadItemProgress variant="circular" size={36} />
              <FileUploadItemDelete />
            </FileUploadListItems>
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
