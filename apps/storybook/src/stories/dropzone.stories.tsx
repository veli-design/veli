import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Dropzone,
  DropzoneClear,
  DropzoneArea,
  DropzoneItem,
  DropzoneItemDelete,
  DropzoneItemMetadata,
  DropzoneItemPreview,
  DropzoneItemProgress,
  DropzoneList,
  DropzoneField,
  useDropzone,
  type DropzoneProps,
} from '@tradenetcorp/veli-ui/dropzone';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const meta = {
  title: 'Components/Dropzone',
  component: Dropzone,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Dropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

type Rejection = { id: string; fileName: string; message: string };

const dropzoneStoryText = {
  en: {
    uploadAttachments: 'Upload attachments',
    uploadDocuments: 'Upload documents',
    dragDropFilesHere: 'Drag & drop files here',
    pdfPngJpgOnly: 'PDF, PNG, or JPG only',
    uploadWithSizeLimit: 'Upload with size limit',
    eachFileMustBeSizeOrSmaller: (size: string) => `Each file must be ${size} or smaller`,
    limitedAttachments: 'Limited attachments',
    uploadUpTo2Files: 'Upload up to 2 files',
    attachments: 'Attachments',
    max2FilesUpToEach: (size: string) => `Max 2 files · PDF, PNG, or JPG · up to ${size} each`,
    invoiceUpload: 'Invoice upload',
    fileNameMustIncludeInvoice: 'File name must include "invoice"',
    uploadInvoicePdf: 'Upload an invoice PDF',
    pdfOnlyFilenameInvoice: 'PDF only · filename must contain "invoice"',
    uploadImages: 'Upload images',
    dragDropImagesHere: 'Drag & drop images here',
    anyImageTypeUpTo4Mb: 'Any image type · up to 4 MB each',
    demoFilesLoadAutomatically: 'Demo files load automatically for styling.',
    directUpload: 'Direct upload',
    supportedFormats10Mb: 'Supported formats: PDF, PNG, JPG up to 10 MB.',
    smallDropzone: 'Small dropzone',
    mediumDropzone: 'Medium dropzone',
    largeDropzone: 'Large dropzone',
    uploadsPaused: 'Uploads paused',
    uploadProgressLabel: (variant: 'linear' | 'circular' | 'fill') => `${variant} upload progress`,
    networkConnectionLost: 'Network connection lost',
  },
  dv: {
    uploadAttachments: 'އެޓޭޗްމަންޓްތައް އަޕްލޯޑްކުރޭ',
    uploadDocuments: 'ލިޔެކިޔުންތައް އަޕްލޯޑްކުރޭ',
    dragDropFilesHere: 'ފައިލްތައް މިތަނަށް ޑްރެގް އެންޑް ޑްރޮޕް ކުރައްވާ',
    pdfPngJpgOnly: 'ހަމައެކަނި PDF، PNG، ނުވަތަ JPG',
    uploadWithSizeLimit: 'ސައިޒު ލިމިޓާއެކު އަޕްލޯޑްކުރޭ',
    eachFileMustBeSizeOrSmaller: (size: string) =>
      `ކޮންމެ ފައިލެއް ${size} ނުވަތަ އެއަށްވުރެ ކުޑަވާންވާނެ`,
    limitedAttachments: 'ލިމިޓްކުރެވިފައިވާ އެޓޭޗްމަންޓްތައް',
    uploadUpTo2Files: 'ގިނަވެގެން 2 ފައިލް އަޕްލޯޑްކުރެވޭނެ',
    attachments: 'އެޓޭޗްމަންޓްތައް',
    max2FilesUpToEach: (size: string) =>
      `ގިނަވެގެން 2 ފައިލް · PDF, PNG, ނުވަތަ JPG · ކޮންމެ ފައިލެއް ${size} އާ ހަމައަށް`,
    invoiceUpload: 'އިންވޮއިސް އަޕްލޯޑް',
    fileNameMustIncludeInvoice: 'ފައިލްގެ ނަމުގައި "invoice" ހިމެނެންވާނެ',
    uploadInvoicePdf: 'އިންވޮއިސް PDF އެއް އަޕްލޯޑްކުރައްވާ',
    pdfOnlyFilenameInvoice: 'ހަމައެކަނި PDF · ފައިލްގެ ނަމުގައި "invoice" ހިމެނެންވާނެ',
    uploadImages: 'ފޮޓޯތައް އަޕްލޯޑްކުރޭ',
    dragDropImagesHere: 'ފޮޓޯތައް މިތަނަށް ޑްރެގް އެންޑް ޑްރޮޕް ކުރައްވާ',
    anyImageTypeUpTo4Mb: 'ކޮންމެ ވައްތަރެއްގެ ފޮޓޯއެއް · ކޮންމެ ފައިލެއް 4 MB އާ ހަމައަށް',
    demoFilesLoadAutomatically: 'ސްޓައިލްކުރުމަށް ޑެމޯ ފައިލްތައް އަމިއްލައަށް ލޯޑުވާނެ.',
    directUpload: 'ޑައިރެކްޓް އަޕްލޯޑް',
    supportedFormats10Mb: 'ސަޕޯޓްކުރާ ފޯމެޓްތައް: 10 MB އާ ހަމައަށް PDF, PNG, JPG.',
    smallDropzone: 'ކުޑަ ޑްރޮޕްޒޯން',
    mediumDropzone: 'މެދު ޑްރޮޕްޒޯން',
    largeDropzone: 'ބޮޑު ޑްރޮޕްޒޯން',
    uploadsPaused: 'އަޕްލޯޑްތައް ޕޯޒްކުރެވިފައި',
    uploadProgressLabel: (variant: 'linear' | 'circular' | 'fill') => {
      const labels = {
        linear: 'ލީނިއަރ',
        circular: 'ސަރކިއުލަރ',
        fill: 'ފިލް އޯވަރލޭ',
      };

      return `${labels[variant]} އަޕްލޯޑް ޕްރޮގްރެސް`;
    },
    networkConnectionLost: 'ނެޓްވޯކް ކަނެކްޝަން ކެނޑިއްޖެ',
  },
} as const;

type DropzoneStoryLanguage = keyof typeof dropzoneStoryText;
type DropzoneStoryText = (typeof dropzoneStoryText)[DropzoneStoryLanguage];

const useDropzoneStoryText = (): DropzoneStoryText => {
  const { direction } = useVeliLanguage();
  const language: DropzoneStoryLanguage = direction === 'rtl' ? 'dv' : 'en';

  return dropzoneStoryText[language];
};

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

function DropzoneListItems({ children }: { children?: React.ReactNode }) {
  const files = useDropzone((state) =>
    Array.from(state.files.values()).map((fileState) => fileState.file),
  );

  return (
    <>
      {files.map((file) => (
        <DropzoneItem key={`${file.name}-${file.lastModified}`} value={file}>
          {children}
        </DropzoneItem>
      ))}
    </>
  );
}

function DropzoneStory({
  children,
  onFileReject: onFileRejectProp,
  ...props
}: DropzoneProps & { children?: ReactNode }) {
  const [files, setFiles] = useState<File[]>([]);
  const [rejections, setRejections] = useState<Rejection[]>([]);

  return (
    <div className="w-[480px] space-y-3">
      <Dropzone
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
        {children ?? <DropzoneArea />}
        <DropzoneList>
          <DropzoneListItems>
            <DropzoneItemPreview />
            <DropzoneItemMetadata />
            <DropzoneItemProgress />
            <DropzoneItemDelete />
          </DropzoneListItems>
        </DropzoneList>
        <DropzoneClear />
      </Dropzone>

      {rejections.length > 0 ? (
        <div
          role="status"
          className="rounded-xl border border-danger bg-button-danger-subtle-default px-4 py-3"
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
  error?: 'networkConnectionLost';
};

const DEMO_UPLOAD_TARGETS: Record<string, DemoUploadTarget> = {
  'report-15.pdf': { progress: 15 },
  'design-45.pdf': { progress: 45 },
  'archive-72.zip': { progress: 72 },
  'photo-62.svg': { progress: 62 },
  'failed-upload.pdf': { progress: 68, error: 'networkConnectionLost' },
  'complete.pdf': { progress: 100, done: true },
};

function createDemoUploadHandler(text: DropzoneStoryText) {
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
        onError(file, new Error(text[target.error]));
        continue;
      }

      if (target.done) {
        onSuccess(file);
      }
    }
  };
}

function injectDemoFiles(container: HTMLElement) {
  const dropzone = container.querySelector('[data-slot="dropzone-area"]');
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
  const files = useDropzone((state) =>
    Array.from(state.files.values()).map((fileState) => fileState.file),
  );

  return (
    <>
      {files.map((file) => (
        <DropzoneItem key={`${file.name}-${file.lastModified}`} value={file}>
          <DropzoneItemPreview />
          <DropzoneItemMetadata />
          {variant === 'circular' ? (
            <DropzoneItemProgress variant="circular" size={progressSize} forceMount />
          ) : null}
          <DropzoneItemDelete />
          {variant === 'fill' || showFillOverlay ? (
            <DropzoneItemProgress variant="fill" forceMount />
          ) : null}
          {variant === 'linear' ? <DropzoneItemProgress variant="linear" forceMount /> : null}
        </DropzoneItem>
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
  const text = useDropzoneStoryText();
  const onUpload = useMemo(() => createDemoUploadHandler(text), [text]);

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
          className="rounded-full border border-base-subtle px-3 py-1.5 type-caption-medium text-text-default-default transition-colors hover:bg-button-secondary-subtle-hover"
          onClick={() => setSeed((current) => current + 1)}
        >
          Reload demo
        </button>
      </div>

      <Dropzone key={seed} label={text.uploadProgressLabel(variant)} multiple onUpload={onUpload}>
        <DropzoneArea showTrigger={false}>
          <span className="type-body-sm-regular text-text-default-subtle">
            {text.demoFilesLoadAutomatically}
          </span>
        </DropzoneArea>
        <DropzoneList>
          <UploadProgressFileList
            variant={variant}
            progressSize={progressSize}
            showFillOverlay={showFillOverlay}
          />
        </DropzoneList>
      </Dropzone>
    </div>
  );
}

export const Default: Story = {
  render: () => {
    const text = useDropzoneStoryText();

    return (
      <DropzoneStory label={text.uploadAttachments}>
        <DropzoneArea />
      </DropzoneStory>
    );
  },
};

export const AcceptedFileTypes: Story = {
  name: 'Accepted file types',
  render: () => {
    const text = useDropzoneStoryText();

    return (
      <DropzoneStory label={text.uploadDocuments} accept="application/pdf,image/png,image/jpeg">
        <DropzoneArea>
          <span className="type-body-md-medium text-text-default-default">
            {text.dragDropFilesHere}
          </span>
          <span className="type-body-sm-regular text-text-default-subtle">
            {text.pdfPngJpgOnly}
          </span>
        </DropzoneArea>
      </DropzoneStory>
    );
  },
};

export const MaxFileSize: Story = {
  name: 'Max file size',
  render: () => {
    const maxSize = 1 * 1024 * 1024;
    const text = useDropzoneStoryText();

    return (
      <DropzoneStory label={text.uploadWithSizeLimit} maxSize={maxSize}>
        <DropzoneArea>
          <span className="type-body-md-medium text-text-default-default">
            {text.dragDropFilesHere}
          </span>
          <span className="type-body-sm-regular text-text-default-subtle">
            {text.eachFileMustBeSizeOrSmaller(formatBytes(maxSize))}
          </span>
        </DropzoneArea>
      </DropzoneStory>
    );
  },
};

export const MaxFiles: Story = {
  name: 'Max files',
  render: () => {
    const text = useDropzoneStoryText();

    return (
      <DropzoneStory label={text.limitedAttachments} maxFiles={2}>
        <DropzoneArea>
          <span className="type-body-md-medium text-text-default-default">
            {text.dragDropFilesHere}
          </span>
          <span className="type-body-sm-regular text-text-default-subtle">
            {text.uploadUpTo2Files}
          </span>
        </DropzoneArea>
      </DropzoneStory>
    );
  },
};

export const CombinedLimits: Story = {
  name: 'Combined limits',
  render: () => {
    const maxSize = 5 * 1024 * 1024;
    const text = useDropzoneStoryText();

    return (
      <DropzoneStory
        label={text.attachments}
        accept="application/pdf,image/png,image/jpeg"
        maxFiles={2}
        maxSize={maxSize}
      >
        <DropzoneArea>
          <span className="type-body-md-medium text-text-default-default">
            {text.dragDropFilesHere}
          </span>
          <span className="type-body-sm-regular text-text-default-subtle">
            {text.max2FilesUpToEach(formatBytes(maxSize))}
          </span>
        </DropzoneArea>
      </DropzoneStory>
    );
  },
};

export const CustomValidation: Story = {
  name: 'Custom validation',
  render: () => {
    const text = useDropzoneStoryText();

    return (
      <DropzoneStory
        label={text.invoiceUpload}
        accept="application/pdf"
        onFileValidate={(file) => {
          if (!file.name.toLowerCase().includes('invoice')) {
            return text.fileNameMustIncludeInvoice;
          }
          return null;
        }}
      >
        <DropzoneArea>
          <span className="type-body-md-medium text-text-default-default">
            {text.uploadInvoicePdf}
          </span>
          <span className="type-body-sm-regular text-text-default-subtle">
            {text.pdfOnlyFilenameInvoice}
          </span>
        </DropzoneArea>
      </DropzoneStory>
    );
  },
};

export const ImageWildcard: Story = {
  name: 'Image wildcard (image/*)',
  render: () => {
    const text = useDropzoneStoryText();

    return (
      <DropzoneStory label={text.uploadImages} accept="image/*" maxSize={4 * 1024 * 1024}>
        <DropzoneArea>
          <span className="type-body-md-medium text-text-default-default">
            {text.dragDropImagesHere}
          </span>
          <span className="type-body-sm-regular text-text-default-subtle">
            {text.anyImageTypeUpTo4Mb}
          </span>
        </DropzoneArea>
      </DropzoneStory>
    );
  },
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
    const text = useDropzoneStoryText();

    return (
      <div className="w-[480px] space-y-3">
        <Dropzone
          label={text.directUpload}
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
          <DropzoneArea />
          <DropzoneList>
            <DropzoneListItems>
              <DropzoneItemPreview />
              <DropzoneItemMetadata />
              <DropzoneItemProgress variant="circular" size={36} />
              <DropzoneItemDelete />
            </DropzoneListItems>
          </DropzoneList>
        </Dropzone>
      </div>
    );
  },
};

export const ConvenienceWrapper: Story = {
  name: 'Dropzone wrapper',
  render: () => {
    const text = useDropzoneStoryText();

    return (
      <div className="w-[480px]">
        <DropzoneField
          label={text.attachments}
          aria-label={text.uploadAttachments}
          description={text.supportedFormats10Mb}
          hint={text.pdfPngJpgOnly}
          allowsBrowse
          acceptedFileTypes={['application/pdf', 'image/png', 'image/jpeg']}
        />
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const text = useDropzoneStoryText();

    return (
      <div className="flex w-[520px] flex-col gap-4">
        <DropzoneField size="sm" aria-label={text.smallDropzone} allowsBrowse />
        <DropzoneField size="md" aria-label={text.mediumDropzone} allowsBrowse />
        <DropzoneField size="lg" aria-label={text.largeDropzone} allowsBrowse />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const text = useDropzoneStoryText();

    return (
      <div className="w-[480px]">
        <DropzoneField label={text.uploadsPaused} aria-label={text.uploadsPaused} isDisabled />
      </div>
    );
  },
};
