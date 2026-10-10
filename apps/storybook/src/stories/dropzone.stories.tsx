import { useEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocsContainer, type DocsContainerProps } from '@storybook/blocks';
import { useArgs } from 'storybook/internal/preview-api';
import {
  Dropzone,
  DropzoneArea,
  DropzoneClear,
  DropzoneField,
  DropzoneItem,
  DropzoneItemDelete,
  DropzoneItemMetadata,
  DropzoneItemPreview,
  DropzoneItemProgress,
  DropzoneList,
  DropzoneTrigger,
  useDropzone,
  type DropzoneProps,
} from '@tradenetcorp/veli-ui/dropzone';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { CloudArrowUpIcon } from '@phosphor-icons/react';

const collapsedControlGroups = ['Content', 'State'] as const;

const collapseControlGroup = (group: string) => {
  const row = document.querySelector(`tr[title^="Hide ${group} item"]`);
  const toggle = row?.querySelector<HTMLElement>('[tabindex="0"]');

  toggle?.click();
};

function DropzoneDocsContainer(props: DocsContainerProps) {
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const tryCollapse = () => {
      if (cancelled) {
        return;
      }

      const tableReady = collapsedControlGroups.every(
        (group) =>
          document.querySelector(
            `tr[title^="Hide ${group} item"], tr[title^="Show ${group} item"]`,
          ) != null,
      );

      if (!tableReady && attempts < 40) {
        attempts += 1;
        requestAnimationFrame(tryCollapse);
        return;
      }

      collapsedControlGroups.forEach(collapseControlGroup);
    };

    tryCollapse();

    return () => {
      cancelled = true;
    };
  }, []);

  return <DocsContainer {...props} />;
}

const storyText = {
  en: {
    label: 'Attachment',
    infoTooltip: 'Attach supporting documents for this request.',
    description: 'PDF, PNG or JPG · up to 10 MB each',
    errorMessage: 'File type not supported. Upload a PDF, PNG or JPG.',
    secondaryText: 'Up to 10 MB',
    rejected: (fileName: string, message: string) => `${fileName}: ${message}`,
    imagesLabel: 'Photos',
    imagesDescription: 'Any image type · up to 4 MB each',
    networkConnectionLost: 'Network connection lost',
    customTitle: 'Upload your ID card',
    customHint: 'Front and back, one file each',
    choose: 'Choose files',
    singleFile: 'Single file',
    multipleFiles: 'Multiple files',
    states: {
      default: 'Default',
      uploading: 'Uploading',
      uploaded: 'Uploaded',
      error: 'Error',
      disabled: 'Disabled',
    },
  },
  dv: {
    label: 'އެޓޭޗްމަންޓް',
    infoTooltip: 'މި ރިކުއެސްޓަށް ބޭނުންވާ ލިޔެކިޔުންތައް އެޓޭޗްކުރައްވާ.',
    description: 'PDF، PNG ނުވަތަ JPG · ކޮންމެ ފައިލެއް 10 MB އާ ހަމައަށް',
    errorMessage: 'މި ފައިލް ފޯމެޓް ސަޕޯޓެއް ނުކުރޭ. PDF، PNG ނުވަތަ JPG އެއް އަޕްލޯޑްކުރައްވާ.',
    secondaryText: '10 MB އާ ހަމައަށް',
    rejected: (fileName: string, message: string) => `${fileName}: ${message}`,
    imagesLabel: 'ފޮޓޯ',
    imagesDescription: 'ކޮންމެ ވައްތަރެއްގެ ފޮޓޯއެއް · ކޮންމެ ފައިލެއް 4 MB އާ ހަމައަށް',
    networkConnectionLost: 'ނެޓްވޯކް ކަނެކްޝަން ކެނޑިއްޖެ',
    customTitle: 'އައިޑީ ކާޑު އަޕްލޯޑްކުރައްވާ',
    customHint: 'ކުރިމަތި އަދި ފަހަތް، ކޮންމެ ފަރާތެއް ވަކި ފައިލެއްގައި',
    choose: 'ފައިލް ހޮވާ',
    singleFile: 'އެއް ފައިލް',
    multipleFiles: 'ގިނަ ފައިލް',
    states: {
      default: 'އާދައިގެ',
      uploading: 'އަޕްލޯޑްވަނީ',
      uploaded: 'އަޕްލޯޑްކުރެވިއްޖެ',
      error: 'އެރަރ',
      disabled: 'ބޭނުންނުކުރެވޭ',
    },
  },
} as const;

type StoryLanguage = keyof typeof storyText;
type StoryText = (typeof storyText)[StoryLanguage];

function useStoryLanguage(): StoryLanguage {
  const { direction } = useVeliLanguage();
  return direction === 'rtl' ? 'dv' : 'en';
}

function useStoryText(): StoryText {
  return storyText[useStoryLanguage()];
}

const localizedArgKeys = ['label', 'infoTooltip', 'description', 'secondaryText'] as const;
type LocalizedArgKey = (typeof localizedArgKeys)[number];

const getLocalizedArgText = (key: LocalizedArgKey, value: unknown, language: StoryLanguage) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return storyText[language][key];
  }

  const localizedValues: readonly string[] = [storyText.en[key], storyText.dv[key]];

  return localizedValues.includes(value) ? storyText[language][key] : value;
};

const MB = 1024 * 1024;

function createDemoFile(name: string, type: string, size = 1.2 * MB) {
  return new File([new Uint8Array(Math.round(size))], name, { type, lastModified: 0 });
}

function createImageFile(name: string, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="${color}"/><circle cx="40" cy="40" r="18" fill="#fff" fill-opacity="0.6"/></svg>`;
  return new File([svg], name, { type: 'image/svg+xml', lastModified: 0 });
}

type UploadTarget = { progress: number; done?: boolean; error?: string };

function createFixedUploadHandler(targets: Record<string, UploadTarget>) {
  const onUpload: NonNullable<DropzoneProps['onUpload']> = async (
    files,
    { onProgress, onSuccess, onError },
  ) => {
    for (const file of files) {
      const target = targets[file.name];
      if (!target) continue;

      if (target.error) {
        onError(file, new Error(target.error));
      } else if (target.done) {
        onSuccess(file);
      } else {
        onProgress(file, target.progress);
      }
    }
  };

  return onUpload;
}

const simulatedUpload: NonNullable<DropzoneProps['onUpload']> = async (
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

/** Feeds files through the hidden file input so validation and `onUpload` run as for a real selection. */
function Preloaded({ files, children }: { files: File[]; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const input = ref.current?.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input || files.length === 0) return;

    const dataTransfer = new DataTransfer();
    for (const file of files) dataTransfer.items.add(file);
    input.files = dataTransfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, [files]);

  return <div ref={ref}>{children}</div>;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-bold uppercase tracking-wider text-base-muted">{children}</span>
  );
}

type DropzoneFieldStoryArgs = ComponentProps<typeof DropzoneField> & {
  showInfoTooltip: boolean;
};

const withArgCategory = <T extends Record<string, object>>(category: string, argTypes: T) =>
  Object.fromEntries(
    Object.entries(argTypes).map(([name, argType]) => [name, { ...argType, table: { category } }]),
  ) as { [K in keyof T]: T[K] & { table: { category: string } } };

const hiddenArgTypes = {
  'aria-label': { table: { disable: true } },
  infoTooltipAriaLabel: { table: { disable: true } },
  value: { table: { disable: true } },
  defaultValue: { table: { disable: true } },
  isInvalid: { table: { disable: true } },
  isDisabled: { table: { disable: true } },
  name: { table: { disable: true } },
  acceptedFileTypes: { table: { disable: true } },
  maxSize: { table: { disable: true } },
  maxFiles: { table: { disable: true } },
  onValueChange: { table: { disable: true } },
  onAccept: { table: { disable: true } },
  onFileAccept: { table: { disable: true } },
  onFileReject: { table: { disable: true } },
  onFileValidate: { table: { disable: true } },
  onUpload: { table: { disable: true } },
  className: { table: { disable: true } },
  id: { table: { disable: true } },
} as const;

const meta = {
  title: 'Components/Dropzone',
  component: DropzoneField,
  decorators: [
    (Story, context) => {
      const language: StoryLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const { label, infoTooltip, description, secondaryText } = args;

      useEffect(() => {
        const currentArgs = { label, infoTooltip, description, secondaryText };
        const nextArgs: Partial<Record<LocalizedArgKey, string>> = {};

        localizedArgKeys.forEach((key) => {
          const localizedValue = getLocalizedArgText(key, currentArgs[key], language);

          if (currentArgs[key] !== localizedValue) {
            nextArgs[key] = localizedValue;
          }
        });

        if (Object.keys(nextArgs).length > 0) {
          updateArgs?.(nextArgs);
        }
      }, [label, infoTooltip, description, secondaryText, language, updateArgs]);

      return <Story />;
    },
  ],
  parameters: {
    layout: 'centered',
    controls: { sort: 'none' },
    docs: { container: DropzoneDocsContainer },
  },
  tags: ['autodocs'],
  argTypes: {
    ...withArgCategory('Appearance', {
      multiple: { control: 'boolean' },
    }),
    ...withArgCategory('Label', {
      label: { control: 'text' },
      labelSize: { control: 'select', options: ['sm', 'md'] },
      isOptional: { control: 'boolean' },
      infoTooltip: { control: 'text' },
      showInfoTooltip: { control: 'boolean' },
    }),
    ...withArgCategory('Content', {
      title: { control: 'text' },
      hint: { control: 'text' },
      secondaryText: { control: 'text' },
      showTrigger: { control: 'boolean' },
      description: { control: 'text' },
    }),
    ...withArgCategory('State', {
      isRequired: { control: 'boolean' },
      showRequiredIndicator: { control: 'boolean' },
      errorMessage: { control: 'text' },
    }),
    ...hiddenArgTypes,
  },
  args: {
    multiple: false,
    label: storyText.en.label,
    labelSize: 'md',
    isOptional: true,
    infoTooltip: storyText.en.infoTooltip,
    showInfoTooltip: true,
    title: '',
    hint: '',
    secondaryText: storyText.en.secondaryText,
    showTrigger: true,
    description: storyText.en.description,
    isRequired: false,
    showRequiredIndicator: true,
    errorMessage: '',
  },
} satisfies Meta<DropzoneFieldStoryArgs>;

export default meta;
type Story = StoryObj<DropzoneFieldStoryArgs>;

export const Default: Story = {
  render: function Render(args) {
    const language = useStoryLanguage();
    const { showInfoTooltip, title, hint, ...fieldArgs } = args;

    return (
      <div key={`${language}:${String(args.multiple)}`} className="w-[496px] max-w-full">
        <DropzoneField
          {...fieldArgs}
          label={getLocalizedArgText('label', args.label, language)}
          infoTooltip={
            showInfoTooltip
              ? getLocalizedArgText('infoTooltip', args.infoTooltip, language)
              : undefined
          }
          title={title || undefined}
          hint={hint || undefined}
          description={getLocalizedArgText('description', args.description, language)}
          secondaryText={getLocalizedArgText('secondaryText', args.secondaryText, language)}
          acceptedFileTypes={['application/pdf', 'image/png', 'image/jpeg']}
          maxSize={10 * MB}
          onUpload={simulatedUpload}
        />
      </div>
    );
  },
};

export const Multiple: Story = {
  args: { multiple: true },
  render: Default.render,
};

type FieldState = keyof StoryText['states'];

function FieldInState({
  state,
  multiple,
  text,
}: {
  state: FieldState;
  multiple: boolean;
  text: StoryText;
}) {
  const { files, onUpload } = useMemo(() => {
    const uploading = createDemoFile('design-system.pdf', 'application/pdf');
    const uploadedA = createDemoFile('brand-guidelines.pdf', 'application/pdf');
    const uploadedB = createDemoFile('annual-report.pdf', 'application/pdf');
    const failed = createDemoFile('contract.pdf', 'application/pdf');

    switch (state) {
      case 'uploading':
        return {
          files: multiple ? [uploading, uploadedA, uploadedB] : [uploading],
          onUpload: createFixedUploadHandler({
            'design-system.pdf': { progress: 19 },
            'brand-guidelines.pdf': { progress: 100, done: true },
            'annual-report.pdf': { progress: 100, done: true },
          }),
        };
      case 'uploaded':
        return {
          files: multiple ? [uploadedA, uploadedB] : [uploadedA],
          onUpload: createFixedUploadHandler({
            'brand-guidelines.pdf': { progress: 100, done: true },
            'annual-report.pdf': { progress: 100, done: true },
          }),
        };
      case 'error':
        return {
          files: multiple ? [failed, uploadedA, uploadedB] : [],
          onUpload: createFixedUploadHandler({
            'contract.pdf': { progress: 64, error: text.networkConnectionLost },
            'brand-guidelines.pdf': { progress: 100, done: true },
            'annual-report.pdf': { progress: 100, done: true },
          }),
        };
      default:
        return { files: [], onUpload: undefined };
    }
  }, [multiple, state, text]);

  return (
    <Preloaded files={files}>
      <DropzoneField
        multiple={multiple}
        label={text.states[state]}
        isOptional
        description={text.description}
        errorMessage={state === 'error' ? text.errorMessage : undefined}
        secondaryText={text.secondaryText}
        isDisabled={state === 'disabled'}
        onUpload={onUpload}
      />
    </Preloaded>
  );
}

export const States: Story = {
  parameters: { layout: 'padded' },
  render: function Render() {
    const language = useStoryLanguage();
    const text = useStoryText();
    const states = Object.keys(text.states) as FieldState[];

    return (
      <div key={language} className="grid w-full max-w-[1016px] gap-6 md:grid-cols-2">
        {[false, true].map((multiple) => (
          <div key={String(multiple)} className="flex flex-col gap-6">
            <SectionLabel>{multiple ? text.multipleFiles : text.singleFile}</SectionLabel>
            {states.map((state) => (
              <FieldInState key={state} state={state} multiple={multiple} text={text} />
            ))}
          </div>
        ))}
      </div>
    );
  },
};

export const Validation: Story = {
  render: function Render() {
    const language = useStoryLanguage();
    const text = useStoryText();
    const [error, setError] = useState<string>();

    return (
      <div key={language} className="w-[496px] max-w-full">
        <DropzoneField
          multiple
          label={text.label}
          description={text.description}
          secondaryText={text.secondaryText}
          errorMessage={error}
          acceptedFileTypes={['application/pdf', 'image/png', 'image/jpeg']}
          maxFiles={3}
          maxSize={10 * MB}
          onAccept={() => setError(undefined)}
          onFileReject={(file, message) => setError(text.rejected(file.name, message))}
        />
      </div>
    );
  },
};

export const ImagePreviews: Story = {
  render: function Render() {
    const language = useStoryLanguage();
    const text = useStoryText();
    const files = useMemo(
      () => [createImageFile('sunset.svg', '#f97316'), createImageFile('lagoon.svg', '#0ea5e9')],
      [],
    );

    return (
      <div key={language} className="w-[496px] max-w-full">
        <Preloaded files={files}>
          <DropzoneField
            multiple
            label={text.imagesLabel}
            description={text.imagesDescription}
            acceptedFileTypes={['image/*']}
            maxSize={4 * MB}
          />
        </Preloaded>
      </div>
    );
  },
};

function ComposedFileList() {
  const files = useDropzone((state) => Array.from(state.files.keys()));

  return (
    <>
      {files.map((file) => (
        <DropzoneItem key={`${file.name}-${file.lastModified}`} value={file}>
          <DropzoneItemPreview />
          <DropzoneItemMetadata />
          <DropzoneItemDelete />
          <DropzoneItemProgress />
        </DropzoneItem>
      ))}
    </>
  );
}

export const Composition: Story = {
  render: function Render() {
    const language = useStoryLanguage();
    const text = useStoryText();

    return (
      <div key={language} className="w-[496px] max-w-full">
        <Dropzone multiple label={text.customTitle} onUpload={simulatedUpload}>
          <DropzoneArea showTrigger={false}>
            <CloudArrowUpIcon size={32} aria-hidden className="text-icon-primary" />
            <span className="type-body-sm-medium text-base-default">{text.customTitle}</span>
            <span className="type-caption-regular text-base-subtle">{text.customHint}</span>
            <DropzoneTrigger intent="primary" appearance="fill">
              {text.choose}
            </DropzoneTrigger>
          </DropzoneArea>
          <DropzoneList>
            <ComposedFileList />
          </DropzoneList>
          <DropzoneClear />
        </Dropzone>
      </div>
    );
  },
};
