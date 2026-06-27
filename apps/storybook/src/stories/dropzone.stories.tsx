import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Dropzone } from '@tradenetcorp/veli-ui/dropzone';

const meta = {
  title: 'Components/Dropzone',
  component: Dropzone,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Dropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[480px]">
      <Dropzone
        label="Attachments"
        aria-label="Upload attachments"
        description="Supported formats: PDF, PNG, JPG up to 10 MB."
        hint="Drag files here or use browse to select."
        allowsBrowse
        acceptedFileTypes={['application/pdf', 'image/png', 'image/jpeg']}
      />
    </div>
  ),
};

export const WithContent: Story = {
  render: () => {
    const [fileName, setFileName] = useState<string | null>(null);

    return (
      <div className="w-[480px]">
        <Dropzone
          label="Identity document"
          aria-label="Upload identity document"
          allowsBrowse
          acceptedFileTypes={['application/pdf', 'image/png', 'image/jpeg']}
          onDrop={async (event) => {
            const fileItem = event.items.find((item) => item.kind === 'file');
            if (fileItem?.kind === 'file') {
              setFileName(fileItem.name);
            }
          }}
          onSelect={(files) => {
            setFileName(files?.[0]?.name ?? null);
          }}
        >
          {fileName ? (
            <span className="type-body-sm-medium text-text-default-default">{fileName}</span>
          ) : undefined}
        </Dropzone>
      </div>
    );
  },
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
