import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Modal } from '@tradenetcorp/veli-ui/modal';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const englishModalText = {
  openModal: 'Open Modal',
  editProfile: 'Edit profile',
  updateProfileDesc: 'Update your profile details and save when you are done.',
  openStateManagedByTrigger:
    'Open state is managed by Modal.Trigger. Focus returns to the trigger when the modal closes.',
  cancel: 'Cancel',
  saveChanges: 'Save changes',
  changesSavedSuccess:
    'Your changes have been saved successfully. You can continue editing or close this window to return to the dashboard.',
  openModalWithDesc: 'Open modal with description',
  deleteProject: 'Delete project',
  cannotBeUndoneProjectData:
    'This action cannot be undone. All project data will be permanently removed.',
  exportBeforeDeleting:
    'If you need a copy of this project, export it before deleting. Deleted projects cannot be recovered after 30 days.',
  delete: 'Delete',
  extraSmallModalDeleteConfirmation:
    'Extra small modals are used for action confirmations such as delete. This action cannot be undone.',
  openSize: 'Open {size}',
  sizeModal: '{size} modal',
  modalDetailedOverview:
    'This modal offers a detailed overview, featuring rich text and seamlessly integrated links for easy navigation.',
  extraSmallModalReplaceMessage:
    'Extra small modals are used for action confirmations such as delete. Replace the confirmation message here.',
  sizeVariantWidth: 'This is the {size} size variant ({width}).',
  close: 'Close',
  confirmDestructiveAction: 'Confirm destructive action',
  modalCannotBeDismissed:
    'This modal cannot be dismissed by clicking outside or pressing escape. The user must choose one of the explicit actions.',
} as const;

const dhivehiModalText = {
  openModal: 'މޯޑަލް ހުޅުވާ',
  editProfile: 'ޕްރޮފައިލް އެޑިޓްކުރޭ',
  updateProfileDesc: 'ޕްރޮފައިލްގެ މަޢުލޫމާތު އަޕްޑޭޓްކުރުމަށްފަހު ސޭވްކުރައްވާ.',
  openStateManagedByTrigger:
    'މޯޑަލް ހުޅުވިފައިވާކަން ކޮންޓްރޯލްކުރަނީ Modal.Trigger އިންނެވެ. މޯޑަލް ލެއްޕުމުން އަލުން ފޯކަސް ދާނީ ޓްރިގަރއަށެވެ.',
  cancel: 'ކެންސަލް',
  saveChanges: 'ބަދަލުތައް ސޭވްކުރޭ',
  changesSavedSuccess:
    'ގެންނެވި ބަދަލުތައް ކާމިޔާބުކަމާއެކު ސޭވްކުރެވިއްޖެއެވެ. އެޑިޓްކުރުން ކުރިއަށްގެންދެވޭނެއެވެ. ނުވަތަ ޑޭޝްބޯޑަށް އެނބުރި ދިޔުމަށް މި ވިންޑޯ ލައްޕަވާލައްވާ.',
  openModalWithDesc: 'ތަފްސީލާއެކު މޯޑަލް ހުޅުވާ',
  deleteProject: 'ޕްރޮޖެކްޓް ޑިލީޓްކުރޭ',
  cannotBeUndoneProjectData:
    'މިކަން އަނބުރާ އިއާދައެއް ނުކުރެވޭނެއެވެ. ޕްރޮޖެކްޓްގެ ހުރިހާ ޑޭޓާއެއް އެއްކޮށް ފުހެވޭނެއެވެ.',
  exportBeforeDeleting:
    'މި ޕްރޮޖެކްޓްގެ ކޮޕީއެއް ބޭނުންފުޅުވާނަމަ، ޑިލީޓްކުރުމުގެ ކުރިން އެކްސްޕޯޓްކުރައްވާ. ޑިލީޓްކޮށްފައިވާ ޕްރޮޖެކްޓްތައް 30 ދުވަސް ފަހުން އަނބުރާ ނުހޯދޭނެއެވެ.',
  delete: 'ޑިލީޓްކުރޭ',
  extraSmallModalDeleteConfirmation:
    'ޑިލީޓްކުރުން ފަދަ ކަންކަން ޔަގީންކުރުމަށް ބޭނުންކުރަނީ ވަރަށް ކުދި މޯޑަލްތަކެވެ. މިކަން އަނބުރާ އިއާދައެއް ނުކުރެވޭނެއެވެ.',
  openSize: '{size} ހުޅުވާ',
  sizeModal: '{size} މޯޑަލް',
  modalDetailedOverview:
    'މި މޯޑަލްގައި ތަފްސީލީ މަޢުލޫމާތާއި، ރިޗް ޓެކްސްޓް އަދި ފަސޭހައިން ބޭނުންކުރެވޭނެހެން ލިންކުތައް ހިމެނިފައިވާނެއެވެ.',
  extraSmallModalReplaceMessage:
    'ޑިލީޓްކުރުން ފަދަ ކަންކަން ޔަގީންކުރުމަށް ބޭނުންކުރަނީ ވަރަށް ކުދި މޯޑަލްތަކެވެ. ކަށަވަރުކުރުމުގެ މެސެޖު މިތަނަށް ލާށެވެ.',
  sizeVariantWidth: 'މިއީ {size} ސައިޒުގެ ވޭރިއަންޓެވެ ({width}).',
  close: 'ލައްޕާ',
  confirmDestructiveAction: 'ގެއްލުންދެނިވި އަމަލެއްކަން ކަށަވަރުކުރޭ',
  modalCannotBeDismissed:
    'ބޭރަށް ކްލިކްކޮށްގެން ނުވަތަ އެސްކޭޕް ފިތްކޮށްގެން މި މޯޑަލް ނުލެއްޕޭނެއެވެ. ޔޫޒަރު ޖެހޭނީ ކޮންމެވެސް އެއް ގޮތެއް ޚިޔާރުކުރާށެވެ.',
} as const;

const localizedModalText = {
  en: englishModalText,
  dv: dhivehiModalText,
} as const;

type ModalLanguage = keyof typeof localizedModalText;
type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

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

const meta = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Accessible modal built with `react-aria-components`, styled with Veli design tokens. Compose with `Modal.Trigger`, `Modal.Header`, `Modal.Title`, `Modal.Description`, `Modal.CloseButton`, `Modal.Content`, and `Modal.Footer`.',
      },
    },
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
  },
  args: {
    children: null,
    size: 'md',
    isDismissable: true,
    isKeyboardDismissDisabled: false,
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTrigger: Story = {
  render: (args) => {
    const text = useModalText();

    return (
      <div className="flex min-h-[420px] items-center justify-center bg-bg-surface-base p-8">
        <Modal.Trigger>
          <Button>{text.openModal}</Button>
          <Modal {...args}>
            <Modal.Header>
              <Modal.Title>{text.editProfile}</Modal.Title>
              <Modal.Description>{text.updateProfileDesc}</Modal.Description>
              <Modal.CloseButton />
            </Modal.Header>
            <Modal.Content>
              <p>{text.openStateManagedByTrigger}</p>
            </Modal.Content>
            <Modal.Footer>
              <div className="flex flex-1 justify-end gap-2">
                <Button slot="close" intent="secondary" appearance="transparent">
                  {text.cancel}
                </Button>
                <Button slot="close">{text.saveChanges}</Button>
              </div>
            </Modal.Footer>
          </Modal>
        </Modal.Trigger>
      </div>
    );
  },
};

export const Playground: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    const text = useModalText();

    return (
      <div className="flex min-h-[420px] items-center justify-center bg-bg-surface-base p-8">
        <Button onPress={() => setIsOpen(true)}>{text.openModal}</Button>

        <Modal {...args} isOpen={isOpen} onOpenChange={setIsOpen}>
          <Modal.Header>
            <Modal.Title>{text.editProfile}</Modal.Title>
            <Modal.Description>{text.updateProfileDesc}</Modal.Description>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Content>
            <p>{text.changesSavedSuccess}</p>
          </Modal.Content>
          <Modal.Footer>
            <div className="flex flex-1 justify-end gap-2">
              <Button intent="secondary" appearance="transparent" onPress={() => setIsOpen(false)}>
                {text.cancel}
              </Button>
              <Button onPress={() => setIsOpen(false)}>{text.saveChanges}</Button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    );
  },
};

export const WithDescription: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const text = useModalText();

    return (
      <div className="flex min-h-[420px] items-center justify-center bg-bg-surface-base p-8">
        <Button onPress={() => setIsOpen(true)}>{text.openModalWithDesc}</Button>

        <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
          <Modal.Header>
            <Modal.Title>{text.deleteProject}</Modal.Title>
            <Modal.Description>{text.cannotBeUndoneProjectData}</Modal.Description>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Content>
            <p>{text.exportBeforeDeleting}</p>
          </Modal.Content>
          <Modal.Footer>
            <div className="flex flex-1 justify-end gap-2">
              <Button intent="secondary" appearance="transparent" onPress={() => setIsOpen(false)}>
                {text.cancel}
              </Button>
              <Button intent="danger" onPress={() => setIsOpen(false)}>
                {text.delete}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    );
  },
};

export const Confirmation: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const text = useModalText();

    return (
      <div className="flex min-h-[420px] items-center justify-center bg-bg-surface-base p-8">
        <Button intent="danger" onPress={() => setIsOpen(true)}>
          {text.deleteProject}
        </Button>

        <Modal isOpen={isOpen} onOpenChange={setIsOpen} size="xs">
          <Modal.Header>
            <Modal.Title>{text.deleteProject}</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Content>
            <p>{text.extraSmallModalDeleteConfirmation}</p>
          </Modal.Content>
          <Modal.Footer>
            <div className="flex flex-1 justify-end gap-2">
              <Button intent="secondary" appearance="transparent" onPress={() => setIsOpen(false)}>
                {text.cancel}
              </Button>
              <Button intent="danger" onPress={() => setIsOpen(false)}>
                {text.delete}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [openSize, setOpenSize] = useState<null | ModalSize>(null);
    const text = useModalText();

    return (
      <div className="flex min-h-[420px] flex-wrap items-center justify-center gap-3 bg-bg-surface-base p-8">
        {modalSizes.map((size) => (
          <Button key={size} intent="secondary" onPress={() => setOpenSize(size)}>
            {formatModalText(text.openSize, { size: size.toUpperCase() })}
          </Button>
        ))}

        {modalSizes.map((size) => (
          <Modal
            key={size}
            isOpen={openSize === size}
            onOpenChange={(isOpen) => setOpenSize(isOpen ? size : null)}
            size={size}
          >
            <Modal.Header>
              <Modal.Title>
                {formatModalText(text.sizeModal, { size: size.toUpperCase() })}
              </Modal.Title>
              {size !== 'xs' ? (
                <Modal.Description>{text.modalDetailedOverview}</Modal.Description>
              ) : null}
              <Modal.CloseButton />
            </Modal.Header>
            <Modal.Content>
              <p>
                {size === 'xs'
                  ? text.extraSmallModalReplaceMessage
                  : formatModalText(text.sizeVariantWidth, {
                      size: size.toUpperCase(),
                      width: modalWidths[size],
                    })}
              </p>
            </Modal.Content>
            <Modal.Footer>
              <div className="flex flex-1 justify-end gap-2">
                <Button onPress={() => setOpenSize(null)}>{text.close}</Button>
              </div>
            </Modal.Footer>
          </Modal>
        ))}
      </div>
    );
  },
};

export const NonDismissable: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const text = useModalText();

    return (
      <div className="flex min-h-[420px] items-center justify-center bg-bg-surface-base p-8">
        <Button intent="danger" onPress={() => setIsOpen(true)}>
          {text.deleteProject}
        </Button>

        <Modal
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          isDismissable={false}
          isKeyboardDismissDisabled
        >
          <Modal.Header>
            <Modal.Title>{text.confirmDestructiveAction}</Modal.Title>
          </Modal.Header>
          <Modal.Content>
            <p>{text.modalCannotBeDismissed}</p>
          </Modal.Content>
          <Modal.Footer>
            <div className="flex flex-1 justify-end gap-2">
              <Button intent="secondary" appearance="transparent" onPress={() => setIsOpen(false)}>
                {text.cancel}
              </Button>
              <Button intent="danger" onPress={() => setIsOpen(false)}>
                {text.delete}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    );
  },
};
