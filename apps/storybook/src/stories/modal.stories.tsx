import { type ComponentProps, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@veli-design/react/button';
import { Modal } from '@veli-design/react/modal';
import { useVeliLanguage } from '@veli-design/react/provider';

const enModalText = {
  openModal: 'Open modal',
  editProfile: 'Edit profile',
  updateProfileDesc: 'Update your profile details and save when you are done.',
  body: 'Your changes have been saved successfully.',
  cancel: 'Cancel',
  saveChanges: 'Save changes',
  close: 'Close',
  default: 'Default',
  nonDismissable: 'Non-dismissable',
  confirmDestructiveAction: 'Confirm destructive action',
  modalCannotBeDismissed: 'This modal cannot be dismissed by clicking outside or pressing Escape.',
  deleteProject: 'Delete project',
  confirmationBody:
    'Extra small modals are used for action confirmations such as delete. This action cannot be undone.',
  delete: 'Delete',
  openSize: 'Open {size}',
  sizeModal: '{size} modal',
  sizeDescription:
    'This modal offers a detailed overview, featuring rich text and seamlessly integrated links for easy navigation.',
  sizeBody: 'This is the {size} size variant ({width}).',
  confirmationReplace:
    'Extra small modals are used for action confirmations such as delete. Replace the confirmation message here.',
} as const;

const dvModalText = {
  openModal: 'މޯޑަލް ހުޅުވާ',
  editProfile: 'ޕްރޮފައިލް އެޑިޓްކުރޭ',
  updateProfileDesc: 'ޕްރޮފައިލްގެ މަޢުލޫމާތު އަޕްޑޭޓްކުރުމަށްފަހު ސޭވްކުރައްވާ.',
  body: 'ގެންނެވި ބަދަލުތައް ކާމިޔާބުކަމާއެކު ސޭވްކުރެވިއްޖެއެވެ.',
  cancel: 'ކެންސަލް',
  saveChanges: 'ބަދަލުތައް ސޭވްކުރޭ',
  close: 'ލައްޕާ',
  default: 'އާދައިގެ',
  nonDismissable: 'ލެއްޕަން ނުލެވޭ',
  confirmDestructiveAction: 'ގެއްލުންދެނިވި އަމަލެއްކަން ކަށަވަރުކުރޭ',
  modalCannotBeDismissed:
    'ބޭރަށް ކްލިކްކޮށްގެން ނުވަތަ އެސްކޭޕް ފިތްކޮށްގެން މި މޯޑަލް ނުލެއްޕޭނެއެވެ.',
  deleteProject: 'ޕްރޮޖެކްޓް ޑިލީޓްކުރޭ',
  confirmationBody:
    'ޑިލީޓްކުރުން ފަދަ ކަންކަން ޔަގީންކުރުމަށް ބޭނުންކުރަނީ ވަރަށް ކުދި މޯޑަލްތަކެވެ. މިކަން އަނބުރާ އިއާދައެއް ނުކުރެވޭނެއެވެ.',
  delete: 'ޑިލީޓްކުރޭ',
  openSize: '{size} ހުޅުވާ',
  sizeModal: '{size} މޯޑަލް',
  sizeDescription:
    'މި މޯޑަލްގައި ތަފްސީލީ މަޢުލޫމާތާއި، ރިޗް ޓެކްސްޓް އަދި ފަސޭހައިން ބޭނުންކުރެވޭނެހެން ލިންކުތައް ހިމެނިފައިވާނެއެވެ.',
  sizeBody: 'މިއީ {size} ސައިޒުގެ ވޭރިއަންޓެވެ ({width}).',
  confirmationReplace:
    'ޑިލީޓްކުރުން ފަދަ ކަންކަން ޔަގީންކުރުމަށް ބޭނުންކުރަނީ ވަރަށް ކުދި މޯޑަލްތަކެވެ. ކަށަވަރުކުރުމުގެ މެސެޖު މިތަނަށް ލާށެވެ.',
} as const;

const localizedModalText = {
  en: enModalText,
  dv: dvModalText,
} as const;

type ModalLanguage = keyof typeof localizedModalText;
type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ModalStoryArgs = ComponentProps<typeof Modal>;

const modalSizes = ['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const;
const modalWidths: Record<ModalSize, string> = {
  xs: '440px',
  sm: '440px',
  md: '576px',
  lg: '776px',
  xl: '1024px',
  full: '1200px',
};

const useModalLanguage = (): ModalLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useModalText = () => {
  const language = useModalLanguage();

  return localizedModalText[language];
};

const formatModalText = (text: string, replacements: Record<string, string>) =>
  Object.entries(replacements).reduce(
    (resolvedText, [key, value]) => resolvedText.split(`{${key}}`).join(value),
    text,
  );

const RightActions = ({ children }: { children: ReactNode }) => (
  <div className="ms-auto flex gap-2">{children}</div>
);

const meta = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    size: {
      control: 'select',
      options: modalSizes,
    },
    isDismissable: {
      control: 'boolean',
    },
    isKeyboardDismissDisabled: {
      control: 'boolean',
    },
    children: { table: { disable: true } },
    className: { table: { disable: true } },
    overlayClassName: { table: { disable: true } },
    isOpen: { table: { disable: true } },
    defaultOpen: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
    'aria-label': { table: { disable: true } },
    'aria-labelledby': { table: { disable: true } },
  },
  args: {
    children: null,
    size: 'md',
    isDismissable: true,
    isKeyboardDismissDisabled: false,
  },
} satisfies Meta<ModalStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const language = useModalLanguage();
    const text = useModalText();
    const { size, isDismissable, isKeyboardDismissDisabled } = args;

    return (
      <div
        key={language}
        className="flex min-h-[420px] items-center justify-center bg-surface-base p-8"
      >
        <Modal.Trigger>
          <Button>{text.openModal}</Button>
          <Modal
            size={size}
            isDismissable={isDismissable}
            isKeyboardDismissDisabled={isKeyboardDismissDisabled}
          >
            <Modal.Header>
              <Modal.Title>{text.editProfile}</Modal.Title>
              <Modal.Description>{text.updateProfileDesc}</Modal.Description>
              <Modal.CloseButton />
            </Modal.Header>
            <Modal.Content>
              <p>{text.body}</p>
            </Modal.Content>
            <Modal.Footer>
              <RightActions>
                <Button slot="close" intent="secondary" appearance="transparent">
                  {text.cancel}
                </Button>
                <Button slot="close">{text.saveChanges}</Button>
              </RightActions>
            </Modal.Footer>
          </Modal>
        </Modal.Trigger>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const language = useModalLanguage();
    const text = useModalText();

    return (
      <div
        key={language}
        className="flex min-h-[420px] flex-wrap items-center justify-center gap-3 bg-surface-base p-8"
      >
        {modalSizes.map((size) => (
          <Modal.Trigger key={size}>
            <Button intent="secondary">
              {formatModalText(text.openSize, { size: size.toUpperCase() })}
            </Button>
            <Modal size={size}>
              <Modal.Header>
                <Modal.Title>
                  {formatModalText(text.sizeModal, { size: size.toUpperCase() })}
                </Modal.Title>
                {size !== 'xs' ? (
                  <Modal.Description>{text.sizeDescription}</Modal.Description>
                ) : null}
                <Modal.CloseButton />
              </Modal.Header>
              <Modal.Content>
                <p>
                  {size === 'xs'
                    ? text.confirmationReplace
                    : formatModalText(text.sizeBody, {
                        size: size.toUpperCase(),
                        width: modalWidths[size],
                      })}
                </p>
              </Modal.Content>
              <Modal.Footer>
                <RightActions>
                  <Button slot="close">{text.close}</Button>
                </RightActions>
              </Modal.Footer>
            </Modal>
          </Modal.Trigger>
        ))}
      </div>
    );
  },
};

export const States: Story = {
  render: () => {
    const language = useModalLanguage();
    const text = useModalText();

    return (
      <div
        key={language}
        className="flex min-h-[420px] flex-wrap items-center justify-center gap-3 bg-surface-base p-8"
      >
        <Modal.Trigger>
          <Button intent="secondary">{text.default}</Button>
          <Modal>
            <Modal.Header>
              <Modal.Title>{text.editProfile}</Modal.Title>
              <Modal.CloseButton />
            </Modal.Header>
            <Modal.Content>
              <p>{text.body}</p>
            </Modal.Content>
            <Modal.Footer>
              <RightActions>
                <Button slot="close" intent="secondary" appearance="transparent">
                  {text.cancel}
                </Button>
                <Button slot="close">{text.saveChanges}</Button>
              </RightActions>
            </Modal.Footer>
          </Modal>
        </Modal.Trigger>

        <Modal.Trigger>
          <Button intent="danger">{text.nonDismissable}</Button>
          <Modal isDismissable={false} isKeyboardDismissDisabled>
            <Modal.Header>
              <Modal.Title>{text.confirmDestructiveAction}</Modal.Title>
            </Modal.Header>
            <Modal.Content>
              <p>{text.modalCannotBeDismissed}</p>
            </Modal.Content>
            <Modal.Footer>
              <RightActions>
                <Button slot="close" intent="secondary" appearance="transparent">
                  {text.cancel}
                </Button>
                <Button slot="close" intent="danger">
                  {text.delete}
                </Button>
              </RightActions>
            </Modal.Footer>
          </Modal>
        </Modal.Trigger>
      </div>
    );
  },
};

export const Confirmation: Story = {
  args: {
    size: 'xs',
  },
  render: (args) => {
    const language = useModalLanguage();
    const text = useModalText();
    const { size, isDismissable, isKeyboardDismissDisabled } = args;

    return (
      <div
        key={language}
        className="flex min-h-[420px] items-center justify-center bg-surface-base p-8"
      >
        <Modal.Trigger>
          <Button intent="danger">{text.deleteProject}</Button>
          <Modal
            size={size}
            isDismissable={isDismissable}
            isKeyboardDismissDisabled={isKeyboardDismissDisabled}
          >
            <Modal.Header>
              <Modal.Title>{text.deleteProject}</Modal.Title>
              <Modal.CloseButton />
            </Modal.Header>
            <Modal.Content>
              <p>{text.confirmationBody}</p>
            </Modal.Content>
            <Modal.Footer>
              <RightActions>
                <Button slot="close" intent="secondary" appearance="transparent">
                  {text.cancel}
                </Button>
                <Button slot="close" intent="danger">
                  {text.delete}
                </Button>
              </RightActions>
            </Modal.Footer>
          </Modal>
        </Modal.Trigger>
      </div>
    );
  },
};
