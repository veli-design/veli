import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { Button } from '@veli-design/react/button';
import { Form } from '@veli-design/react/form';
import { OTPInput, OTPInputSeparator, OTPInputSlot } from '@veli-design/react/otp-input';
import { useVeliLanguage } from '@veli-design/react/provider';

const localizedText = {
  en: {
    label: 'Verification code',
    description: 'We sent a 6-digit code by SMS.',
    resend: 'Resend',
    verify: 'Verify',
    expired: 'That code has expired. Request a new one.',
  },
  dv: {
    label: 'ވެރިފިކޭޝަން ކޯޑު',
    description: 'އެސްއެމްއެސް އިން 6 އަކުރުގެ ކޯޑެއް ފޮނުވިއްޖެ.',
    resend: 'އަލުން ފޮނުވާ',
    verify: 'ޔަގީންކުރޭ',
    expired: 'މި ކޯޑުގެ މުއްދަތު ހަމަވެއްޖެ.',
  },
} as const;

const useText = () => localizedText[useVeliLanguage().language];

const meta = {
  title: 'Components/OTP Input',
  component: OTPInput,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    name: 'code',
    label: 'Verification code',
    size: 'md',
    appearance: 'default',
    alphabet: 'digits',
    onChange: fn(),
    onComplete: fn(),
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    appearance: { control: 'select', options: ['default', 'outline'] },
    alphabet: { control: 'select', options: ['digits', 'alphanumeric', 'alphanumeric-upper'] },
    length: { control: 'number' },
  },
  render: (args) => (
    <div className="w-[320px]">
      <OTPInput {...args} />
    </div>
  ),
} satisfies Meta<typeof OTPInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Grouped: Story = {
  render: function Render(args) {
    const text = useText();
    return (
      <div className="w-[320px]">
        <OTPInput
          {...args}
          label={text.label}
          description={text.description}
          length={undefined}
          groups={[3, 3]}
          action={
            <Button type="button" appearance="ghost" size="sm">
              {text.resend}
            </Button>
          }
        />
      </div>
    );
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-[320px] flex-col gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <OTPInput key={size} {...args} size={size} label={size} defaultValue="1234" />
      ))}
    </div>
  ),
};

export const Appearances: Story = {
  render: (args) => (
    <div className="flex w-[320px] flex-col gap-4">
      <OTPInput {...args} label="Default" />
      <OTPInput {...args} appearance="outline" label="Outline" />
      <OTPInput {...args} label="Disabled" defaultValue="123" isDisabled />
      <OTPInput {...args} label="Invalid" isInvalid errorMessage="This code is not valid." />
    </div>
  ),
};

export const BackupCode: Story = {
  name: 'Backup code',
  render: (args) => (
    <div className="w-[320px]">
      <OTPInput
        {...args}
        name="backup"
        label="Backup code"
        alphabet="alphanumeric-upper"
        length={undefined}
        groups={[4, 4]}
        separator={<OTPInputSeparator>·</OTPInputSeparator>}
        renderSlot={(slot) => <OTPInputSlot slot={slot} className="font-mono" />}
      />
    </div>
  ),
};

export const FormServerError: Story = {
  name: 'Form server error',
  render: function Render(args) {
    const text = useText();
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
    return (
      <div className="w-[320px]">
        <Form
          validationErrors={serverErrors}
          onSubmit={(event) => {
            event.preventDefault();
            setServerErrors({ code: text.expired });
          }}
        >
          <OTPInput {...args} label={text.label} isRequired />
          <Button type="submit">{text.verify}</Button>
        </Form>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), '123456');
    await userEvent.click(canvas.getByRole('button'));
    await expect(canvas.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  },
};

export const Editing: Story = {
  args: { label: 'Code' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole<HTMLInputElement>('textbox', { name: 'Code' });
    const caretSlot = () => canvasElement.querySelector('[data-caret]');

    await userEvent.click(input);
    await userEvent.keyboard('123');
    await expect(input).toHaveValue('123');
    await expect(caretSlot()).toHaveAttribute('data-otp-index', '3');
    await expect(caretSlot()).toHaveAttribute('data-caret', 'append');

    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await expect(caretSlot()).toHaveAttribute('data-otp-index', '1');
    await expect(caretSlot()).toHaveAttribute('data-caret', 'overtype');
    await expect([input.selectionStart, input.selectionEnd]).toEqual([1, 2]);

    await userEvent.keyboard('9');
    await expect(input).toHaveValue('193');
    await expect(caretSlot()).toHaveAttribute('data-otp-index', '2');

    await userEvent.keyboard('{ArrowLeft}9');
    await expect(input).toHaveValue('193');
    await expect(caretSlot()).toHaveAttribute('data-otp-index', '2');

    await userEvent.keyboard('a');
    await expect(input).toHaveValue('193');

    await userEvent.keyboard('{Home}{Backspace}');
    await expect(input).toHaveValue('93');
    await expect(caretSlot()).toHaveAttribute('data-otp-index', '0');

    await userEvent.keyboard('{End}{Backspace}');
    await expect(input).toHaveValue('9');

    await expect(args.onComplete).not.toHaveBeenCalled();
    await userEvent.paste('123-456');
    await expect(input).toHaveValue('123456');
    await waitFor(() => expect(args.onComplete).toHaveBeenCalledWith('123456'));
    await expect(args.onComplete).toHaveBeenCalledTimes(1);
    await expect(caretSlot()).toHaveAttribute('data-caret', 'trailing');

    await userEvent.keyboard('7');
    await expect(input).toHaveValue('123456');
  },
};

export const Controlled: Story = {
  render: function Render(args) {
    const [code, setCode] = useState('');
    const [controlled, setControlled] = useState(true);
    return (
      <div className="flex w-[320px] flex-col gap-4">
        <OTPInput
          {...args}
          label="Authenticator code"
          value={controlled ? code : undefined}
          onChange={(next) => {
            setCode(next);
            args.onChange?.(next);
          }}
        />
        <Button type="button" appearance="transparent" onPress={() => setCode('')}>
          Reset
        </Button>
        <Button type="button" appearance="transparent" onPress={() => setCode('654321')}>
          Fill from parent
        </Button>
        <Button type="button" appearance="transparent" onPress={() => setControlled(false)}>
          Release control
        </Button>
      </div>
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = () => canvas.getByRole('textbox');
    await userEvent.click(canvas.getByRole('button', { name: 'Fill from parent' }));
    await expect(input()).toHaveValue('654321');
    await expect(args.onComplete).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await expect(input()).toHaveValue('');
    await userEvent.click(canvas.getByRole('button', { name: 'Fill from parent' }));
    await expect(input()).toHaveValue('654321');
    await userEvent.click(canvas.getByRole('button', { name: 'Release control' }));
    await expect(input()).toHaveValue('654321');
  },
};
