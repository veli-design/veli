'use client';

import * as React from 'react';
import {
  Button as AriaButton,
  DropZone as AriaDropZone,
  isFileDropItem,
  ProgressBar,
  Text,
  type DropZoneProps as AriaDropZoneProps,
  type DropZoneRenderProps,
} from 'react-aria-components';
import { cva } from 'class-variance-authority';
import {
  Archive,
  CheckCircle,
  File,
  FileAudio,
  FileCode,
  FileImage,
  FileVideo,
  GearSix,
  Info,
  Trash,
  UploadSimple,
  WarningCircle,
  X,
} from 'phosphor-react';
import { twMerge } from 'tailwind-merge';
import { Button, type ButtonProps } from './button';
import {
  fieldHeaderInfoTooltipTriggerVariants,
  fieldHeaderRequiredIndicatorVariants,
  getFieldOptionalLabel,
  getRenderableMessage,
  messageVariants,
  shouldShowFieldOptional,
} from './field-shared';
import { useVeliLanguage } from './provider';
import { Tooltip, TooltipTrigger } from './tooltip';

const ROOT_NAME = 'Dropzone';
const DROPZONE_NAME = 'DropzoneArea';
const TRIGGER_NAME = 'DropzoneTrigger';
const LIST_NAME = 'DropzoneList';
const ITEM_NAME = 'DropzoneItem';
const ITEM_PREVIEW_NAME = 'DropzoneItemPreview';
const ITEM_METADATA_NAME = 'DropzoneItemMetadata';
const ITEM_PROGRESS_NAME = 'DropzoneItemProgress';
const ITEM_DELETE_NAME = 'DropzoneItemDelete';
const CLEAR_NAME = 'DropzoneClear';

const FILE_PICKER_SUPPRESS_MS = 500;
const TRANSIENT_INVALID_MS = 2000;

function useAsRef<T>(value: T): React.MutableRefObject<T> {
  const ref = React.useRef(value);
  React.useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

function getFileExtension(file: File) {
  const parts = file.name.split('.');
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? '') : '';
}

function getFileIcon(file: File) {
  const type = file.type;
  const extension = getFileExtension(file);
  const iconClass = 'size-5 text-icon-base-muted';

  if (type.startsWith('image/')) {
    return <FileImage className={iconClass} weight="bold" aria-hidden />;
  }

  if (type.startsWith('video/')) {
    return <FileVideo className={iconClass} weight="bold" aria-hidden />;
  }

  if (type.startsWith('audio/')) {
    return <FileAudio className={iconClass} weight="bold" aria-hidden />;
  }

  if (type.startsWith('text/') || ['txt', 'md', 'rtf', 'pdf'].includes(extension)) {
    return <File className={iconClass} weight="bold" aria-hidden />;
  }

  if (
    [
      'html',
      'css',
      'js',
      'jsx',
      'ts',
      'tsx',
      'json',
      'xml',
      'php',
      'py',
      'rb',
      'java',
      'c',
      'cpp',
      'cs',
    ].includes(extension)
  ) {
    return <FileCode className={iconClass} weight="bold" aria-hidden />;
  }

  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension)) {
    return <Archive className={iconClass} weight="bold" aria-hidden />;
  }

  if (
    ['exe', 'msi', 'app', 'apk', 'deb', 'rpm'].includes(extension) ||
    type.startsWith('application/')
  ) {
    return <GearSix className={iconClass} weight="bold" aria-hidden />;
  }

  return <File className={iconClass} weight="bold" aria-hidden />;
}

function matchesAcceptedType(file: File, acceptTypes: readonly string[]) {
  const fileType = file.type.toLowerCase();
  const extension = getFileExtension(file);

  return acceptTypes.some((acceptType) => {
    const type = acceptType.toLowerCase();

    if (type.startsWith('.')) {
      return type === `.${extension}`;
    }

    if (type.endsWith('/*')) {
      return fileType.startsWith(type.slice(0, -1));
    }

    return type === fileType;
  });
}

type Direction = 'ltr' | 'rtl';

const dropzoneText = {
  en: {
    fileUpload: 'File upload',
    uploadFailed: 'Upload failed',
    maxFilesAllowed: (maxFiles: number) => `Maximum ${maxFiles} files allowed`,
    singleFileOnly: 'Only one file allowed',
    fileTypeNotAccepted: 'File type not accepted',
    fileTooLarge: 'File too large',
    dragDropFilesHere: 'Drag & drop files here',
    orClickToBrowse: 'Or click to browse',
    browseFiles: 'Browse files',
    uploaded: 'Uploaded',
    statusError: (error: string) => `Error: ${error}`,
    statusUploading: (progress: number) => `Uploading: ${progress}% complete`,
    uploadComplete: 'Upload complete',
    readyToUpload: 'Ready to upload',
    uploadProgressFor: (fileName: string) => `Upload progress for ${fileName}`,
    removeFile: (fileName: string) => `Remove ${fileName}`,
    clearAll: 'Clear all',
    moreInformation: 'More information',
  },
  dv: {
    fileUpload: 'ފައިލް އަޕްލޯޑް',
    uploadFailed: 'އަޕްލޯޑެއް ނުކުރެވުނު',
    maxFilesAllowed: (maxFiles: number) => `ފައިލް ${maxFiles} ގިނަވެގެން އަޕްލޯޑް ކުރެވޭނީ`,
    singleFileOnly: 'ހަމައެކަނި އެއް ފައިލް އަޕްލޯޑް ކުރެވޭނެ',
    fileTypeNotAccepted: 'މި ފައިލް ފޯމެޓްގެ ސަޕޯޓެއް ނުކުރޭ',
    fileTooLarge: 'ފައިލްގެ ސައިޒު މާ ބޮޑު',
    dragDropFilesHere: 'ފައިލްތައް މިތަނަށް ޑްރެގްކޮށް ދޫކޮށްލާ',
    orClickToBrowse: 'ނުވަތަ ފައިލް ހޯދަން ފިތާލާ',
    browseFiles: 'ފައިލްތައް ހޯދާ',
    uploaded: 'އަޕްލޯޑްކުރެވިއްޖެ',
    statusError: (error: string) => `އެރަރ: ${error}`,
    statusUploading: (progress: number) => `އަޕްލޯޑްވަނީ: ${progress}%`,
    uploadComplete: 'އަޕްލޯޑްކޮށް ނިމިއްޖެ',
    readyToUpload: 'އަޕްލޯޑްކުރަން ތައްޔާރު',
    uploadProgressFor: (fileName: string) => `${fileName} އަޕްލޯޑްވަމުންދާ މިންވަރު`,
    removeFile: (fileName: string) => `${fileName} ރިމޫވް ކުރޭ`,
    clearAll: 'ހުރިހާ ފައިލެއް ރިމޫވް ކުރޭ',
    moreInformation: 'އިތުރު މަޢުލޫމާތު',
  },
} as const;

type DropzoneText = (typeof dropzoneText)[keyof typeof dropzoneText];

export type DropzoneFileStatus = 'idle' | 'uploading' | 'error' | 'success';

export interface DropzoneFileState {
  file: File;
  progress: number;
  error?: string;
  status: DropzoneFileStatus;
}

export interface DropzoneState {
  files: Map<File, DropzoneFileState>;
  invalid: boolean;
}

type StoreAction =
  | { type: 'ADD_FILES'; files: File[] }
  | { type: 'SET_FILES'; files: File[] }
  | { type: 'SET_PROGRESS'; file: File; progress: number }
  | { type: 'SET_SUCCESS'; file: File }
  | { type: 'SET_ERROR'; file: File; error: string }
  | { type: 'REMOVE_FILE'; file: File }
  | { type: 'SET_INVALID'; invalid: boolean }
  | { type: 'CLEAR' };

type DropEvent =
  NonNullable<AriaDropZoneProps['onDrop']> extends (event: infer E) => unknown ? E : never;

type Store = {
  getState: () => DropzoneState;
  dispatch: (action: StoreAction) => void;
  subscribe: (listener: () => void) => () => void;
};

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useStore<T>(selector: (state: DropzoneState) => T): T {
  const store = useStoreContext('useStore');
  const lastValueRef = React.useRef<{ value: T; state: DropzoneState } | null>(null);

  const getSnapshot = React.useCallback(() => {
    const state = store.getState();
    const prevValue = lastValueRef.current;

    if (prevValue && prevValue.state === state) {
      return prevValue.value;
    }

    const nextValue = selector(state);
    lastValueRef.current = { value: nextValue, state };
    return nextValue;
  }, [store, selector, lastValueRef]);

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

type PendingFocus = 'item' | 'area' | null;

interface DropzoneContextValue {
  dropzoneId: string;
  listId: string;
  disabled: boolean;
  invalid: boolean;
  lang: string;
  dir: Direction;
  text: DropzoneText;
  urlCache: WeakMap<File, string>;
  multiple: boolean;
  label?: string;
  rootRef: React.RefObject<HTMLDivElement | null>;
  pendingFocusRef: React.MutableRefObject<PendingFocus>;
  openFilePicker: () => void;
  onFilesChange: (files: File[]) => void;
  removeFile: (file: File) => void;
  clearFiles: () => void;
}

async function filesFromDropEvent(event: DropEvent) {
  const filePromises: Promise<File>[] = [];
  for (const item of event.items) {
    if (isFileDropItem(item)) {
      filePromises.push(item.getFile());
    }
  }
  return Promise.all(filePromises);
}

/**
 * Browsers expose only "Files" during an OS file drag, not per-file MIME types,
 * so every drag gets drop feedback. Type and size rules run after the drop.
 */
function getFileDropOperation() {
  return 'copy' as const;
}

function canMoveFocusWithin(root: HTMLElement | null) {
  if (typeof document === 'undefined' || !root) return false;
  const active = document.activeElement;
  return !active || active === document.body || root.contains(active);
}

const DropzoneContext = React.createContext<DropzoneContextValue | null>(null);

function useDropzoneContext(consumerName: string) {
  const context = React.useContext(DropzoneContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

const rootVariants = cva('flex w-full flex-col gap-1 font-sans antialiased');

/**
 * Borders grow from 1px to 2px on hover, drop target, and invalid, so padding
 * shrinks by 1px to keep the outer box fixed.
 */
const areaVariants = cva(
  'relative flex w-full rounded-2xl border border-dashed bg-text-input-bg-default px-[15px] py-[19px] outline-none transition-[background-color,border-color,box-shadow] duration-normal ease-out motion-reduce:transition-none',
  {
    variants: {
      layout: {
        horizontal: 'flex-row flex-wrap items-center gap-3 text-start',
        vertical: 'flex-col items-center justify-center gap-3 text-center',
      },
      state: {
        default: 'border-base-subtle',
        hover: 'border-2 border-base-strong px-[14px] py-[18px]',
        dropTarget: 'border-2 border-focus bg-button-primary-subtle-default px-[14px] py-[18px]',
        invalid: 'border-2 border-danger px-[14px] py-[18px]',
        disabled: 'cursor-not-allowed border-base-subtle',
      },
      isFocusVisible: {
        true: 'ring-2 ring-border-focus ring-offset-2 ring-offset-bg-surface-raised',
        false: '',
      },
    },
    defaultVariants: {
      layout: 'horizontal',
      state: 'default',
      isFocusVisible: false,
    },
  },
);

type AreaState = 'default' | 'hover' | 'dropTarget' | 'invalid' | 'disabled';

const areaIconVariants = cva('flex size-10 shrink-0 items-center justify-center', {
  variants: {
    isDisabled: {
      true: 'text-icon-base-inactive',
      false: 'text-icon-base-muted',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

const areaTextVariants = cva('flex flex-col gap-1.5', {
  variants: {
    layout: {
      horizontal: 'min-w-40 flex-1 items-start',
      vertical: 'items-center',
    },
  },
  defaultVariants: {
    layout: 'horizontal',
  },
});

const areaTitleVariants = cva('break-words type-body-sm-medium', {
  variants: {
    state: {
      default: 'text-base-default',
      hover: 'text-base-default',
      dropTarget: 'text-base-strong',
      invalid: 'text-base-default',
      disabled: 'text-base-inactive',
    },
  },
  defaultVariants: {
    state: 'default',
  },
});

const areaMetaVariants = cva('flex flex-wrap items-center gap-x-2.5 gap-y-1', {
  variants: {
    layout: {
      horizontal: 'justify-start',
      vertical: 'justify-center',
    },
  },
  defaultVariants: {
    layout: 'horizontal',
  },
});

const areaHintVariants = cva('type-caption-regular', {
  variants: {
    isDisabled: {
      true: 'text-base-inactive',
      false: 'text-base-subtle',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

const areaSecondaryVariants = cva('type-caption-regular', {
  variants: {
    isDisabled: {
      true: 'text-base-inactive',
      false: 'text-base-muted',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

const metaDividerVariants = cva('h-1.5 w-px shrink-0 bg-border-base-strong');

const listVariants = cva('flex flex-col gap-1');

/**
 * Items keep one outer height across statuses: bordered statuses trade 1px of
 * padding for the stroke, and statuses with a progress bar reserve 4px below.
 */
const itemVariants = cva(
  'relative flex items-center gap-3 overflow-hidden rounded-2xl bg-text-input-bg-default transition-[border-color] duration-normal ease-out motion-reduce:transition-none',
  {
    variants: {
      status: {
        idle: 'px-4 py-[18px]',
        uploading: 'border border-dashed border-base-subtle px-[15px] pt-[17px] pb-[19px]',
        success: 'px-4 pt-[18px] pb-5',
        error: 'border border-danger px-[15px] py-[17px]',
      },
    },
    defaultVariants: {
      status: 'idle',
    },
  },
);

const previewVariants = cva(
  'relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-button-secondary-subtle-default',
);

const previewImageVariants = cva('absolute inset-0 size-full object-cover');

const metadataVariants = cva('flex min-w-0 flex-1 flex-col gap-1.5 text-start');

const metadataNameVariants = cva('truncate type-body-sm-medium text-base-default');

const metadataRowVariants = cva('flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1');

const metadataSizeVariants = cva('type-caption-regular text-base-subtle');

const metadataStatusVariants = cva('inline-flex min-w-0 items-center gap-1 type-caption-regular', {
  variants: {
    status: {
      idle: 'text-base-muted',
      uploading: 'text-base-muted tabular-nums',
      success: 'text-success-subtle',
      error: 'text-danger-muted',
    },
  },
  defaultVariants: {
    status: 'idle',
  },
});

const progressTrackVariants = cva(
  'pointer-events-none absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-border-base-subtle',
);

const progressBarVariants = cva(
  'absolute inset-y-0 start-0 bg-icon-success-subtle transition-[inline-size] duration-slow ease-out motion-reduce:transition-none',
);

const srOnlyVariants = cva('sr-only');

export interface DropzoneProps extends Omit<
  React.ComponentProps<'div'>,
  'defaultValue' | 'onChange'
> {
  /** Controlled list of files. */
  value?: File[];
  /** Uncontrolled initial list of files. */
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  /** Called with every batch of files that passes validation. */
  onAccept?: (files: File[]) => void;
  onFileAccept?: (file: File) => void;
  onFileReject?: (file: File, message: string) => void;
  /** Return a message to reject the file, or `null` to accept it. */
  onFileValidate?: (file: File) => string | null | undefined;
  onUpload?: (
    files: File[],
    options: {
      onProgress: (file: File, progress: number) => void;
      onSuccess: (file: File) => void;
      onError: (file: File, error: Error) => void;
    },
  ) => Promise<void> | void;
  /** Comma-separated MIME types, wildcards, or extensions, as in `<input accept>`. */
  accept?: string;
  /** Maximum number of files. Ignored when `multiple` is false (one file). */
  maxFiles?: number;
  /** Maximum file size in bytes. */
  maxSize?: number;
  dir?: Direction;
  /** Accessible name for the drop area when no visible label references it. */
  label?: string;
  /** Submits the current files with a native form under this name. */
  name?: string;
  /** Requires a file on native form submission. */
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  /**
   * Allow multiple files. When `false`, the area lays out as a row and swaps for the
   * file item once a file is chosen. When `true`, the area stacks above the file list.
   * @default false
   */
  multiple?: boolean;
}

export function Dropzone(props: DropzoneProps) {
  const {
    value,
    defaultValue,
    onValueChange,
    onAccept,
    onFileAccept,
    onFileReject,
    onFileValidate,
    onUpload,
    accept,
    maxFiles,
    maxSize,
    dir: dirProp,
    lang: langProp,
    label,
    name,
    required = false,
    disabled = false,
    invalid = false,
    multiple = false,
    children,
    className,
    ...rootProps
  } = props;

  const languageConfig = useVeliLanguage();
  const text = dropzoneText[languageConfig.language];
  const dir = dirProp ?? languageConfig.direction;
  const lang = langProp ?? languageConfig.lang;

  const dropzoneId = React.useId();
  const listId = React.useId();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const pendingFocusRef = React.useRef<PendingFocus>(null);

  const [listeners] = React.useState(() => new Set<() => void>());
  const [files] = React.useState(() => new Map<File, DropzoneFileState>());
  const [urlCache] = React.useState(() => new WeakMap<File, string>());

  const isControlled = value !== undefined;

  const acceptedFileTypes = React.useMemo(
    () =>
      accept
        ?.split(',')
        .map((type) => type.trim())
        .filter(Boolean),
    [accept],
  );

  const propsRef = useAsRef({
    onValueChange,
    onAccept,
    onFileAccept,
    onFileReject,
    onFileValidate,
    onUpload,
  });

  const store = React.useMemo<Store>(() => {
    const stateRef: { current: DropzoneState } = {
      current: {
        files,
        invalid: false,
      },
    };

    function emitValueChange() {
      propsRef.current.onValueChange?.(
        Array.from(files.values()).map((fileState) => fileState.file),
      );
    }

    function revokePreview(file: File) {
      const cachedUrl = urlCache.get(file);
      if (cachedUrl) {
        URL.revokeObjectURL(cachedUrl);
        urlCache.delete(file);
      }
    }

    function reducer(currentState: DropzoneState, action: StoreAction): DropzoneState {
      switch (action.type) {
        case 'ADD_FILES': {
          for (const file of action.files) {
            files.set(file, {
              file,
              progress: 0,
              status: 'idle',
            });
          }

          emitValueChange();
          return { ...currentState, files };
        }

        case 'SET_FILES': {
          const newFileSet = new Set(action.files);
          for (const existingFile of files.keys()) {
            if (!newFileSet.has(existingFile)) {
              revokePreview(existingFile);
              files.delete(existingFile);
            }
          }

          for (const file of action.files) {
            if (!files.has(file)) {
              files.set(file, {
                file,
                progress: 0,
                status: 'idle',
              });
            }
          }
          return { ...currentState, files };
        }

        case 'SET_PROGRESS': {
          const fileState = files.get(action.file);
          if (!fileState || fileState.status === 'success') {
            return currentState;
          }

          files.set(action.file, {
            ...fileState,
            progress: action.progress,
            error: undefined,
            status: 'uploading',
          });
          return { ...currentState, files };
        }

        case 'SET_SUCCESS': {
          const fileState = files.get(action.file);
          if (!fileState) return currentState;

          files.set(action.file, {
            ...fileState,
            progress: 100,
            error: undefined,
            status: 'success',
          });
          return { ...currentState, files };
        }

        case 'SET_ERROR': {
          const fileState = files.get(action.file);
          if (!fileState) return currentState;

          files.set(action.file, {
            ...fileState,
            error: action.error,
            status: 'error',
          });
          return { ...currentState, files };
        }

        case 'REMOVE_FILE': {
          if (!files.has(action.file)) return currentState;

          revokePreview(action.file);
          files.delete(action.file);
          emitValueChange();
          return { ...currentState, files };
        }

        case 'SET_INVALID': {
          return { ...currentState, invalid: action.invalid };
        }

        case 'CLEAR': {
          for (const file of files.keys()) {
            revokePreview(file);
          }

          files.clear();
          emitValueChange();
          return { ...currentState, files, invalid: false };
        }

        default:
          return currentState;
      }
    }

    return {
      getState: () => stateRef.current,
      dispatch: (action) => {
        stateRef.current = reducer(stateRef.current, action);
        for (const listener of listeners) {
          listener();
        }
      },
      subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    };
  }, [listeners, files, propsRef, urlCache]);

  const pendingProgressRef = React.useRef(new Map<File, number>());
  const progressFrameRef = React.useRef(0);

  const onProgress = React.useCallback(
    (file: File, progress: number) => {
      pendingProgressRef.current.set(file, Math.round(Math.min(Math.max(0, progress), 100)));
      if (progressFrameRef.current) return;

      progressFrameRef.current = requestAnimationFrame(() => {
        progressFrameRef.current = 0;
        const pending = Array.from(pendingProgressRef.current);
        pendingProgressRef.current.clear();

        for (const [pendingFile, pendingProgress] of pending) {
          store.dispatch({ type: 'SET_PROGRESS', file: pendingFile, progress: pendingProgress });
        }
      });
    },
    [store],
  );

  const invalidTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => {
    const pendingProgress = pendingProgressRef.current;

    return () => {
      if (progressFrameRef.current) cancelAnimationFrame(progressFrameRef.current);
      pendingProgress.clear();
      clearTimeout(invalidTimerRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (isControlled) {
      store.dispatch({ type: 'SET_FILES', files: value });
    } else if (defaultValue && defaultValue.length > 0 && !store.getState().files.size) {
      store.dispatch({ type: 'SET_FILES', files: defaultValue });
    }
  }, [value, defaultValue, isControlled, store]);

  React.useEffect(() => {
    return () => {
      for (const file of files.keys()) {
        const cachedUrl = urlCache.get(file);
        if (cachedUrl) {
          URL.revokeObjectURL(cachedUrl);
        }
      }
    };
  }, [files, urlCache]);

  const syncFileInput = React.useCallback(() => {
    const input = fileInputRef.current;
    if (!input || !name || typeof DataTransfer === 'undefined') return;

    try {
      const dataTransfer = new DataTransfer();
      for (const file of store.getState().files.keys()) {
        dataTransfer.items.add(file);
      }
      input.files = dataTransfer.files;
    } catch {
      // Some environments (older WebKit, jsdom) cannot assign FileList.
    }
  }, [name, store]);

  React.useEffect(() => {
    syncFileInput();
    return store.subscribe(syncFileInput);
  }, [store, syncFileInput]);

  React.useEffect(() => {
    const input = fileInputRef.current;
    if (!input) return;

    input.addEventListener('cancel', syncFileInput);
    return () => input.removeEventListener('cancel', syncFileInput);
  }, [syncFileInput]);

  const onFilesUpload = React.useCallback(
    async (uploadFiles: File[]) => {
      const upload = propsRef.current.onUpload;
      if (!upload) return;

      const settle = (file: File) => pendingProgressRef.current.delete(file);

      try {
        for (const file of uploadFiles) {
          store.dispatch({ type: 'SET_PROGRESS', file, progress: 0 });
        }

        await upload(uploadFiles, {
          onProgress,
          onSuccess: (file) => {
            settle(file);
            store.dispatch({ type: 'SET_SUCCESS', file });
          },
          onError: (file, error) => {
            settle(file);
            store.dispatch({
              type: 'SET_ERROR',
              file,
              error: error.message || text.uploadFailed,
            });
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error && error.message ? error.message : text.uploadFailed;
        for (const file of uploadFiles) {
          settle(file);
          store.dispatch({
            type: 'SET_ERROR',
            file,
            error: errorMessage,
          });
        }
      }
    },
    [store, propsRef, onProgress, text],
  );

  const onFilesChange = React.useCallback(
    (originalFiles: File[]) => {
      if (disabled) return;

      let filesToProcess = [...originalFiles];
      let nextInvalid = false;
      const fileLimit = multiple ? maxFiles : 1;

      if (fileLimit) {
        const currentCount = store.getState().files.size;
        const remainingSlotCount = Math.max(0, fileLimit - currentCount);

        if (remainingSlotCount < filesToProcess.length) {
          const rejectedFiles = filesToProcess.slice(remainingSlotCount);
          nextInvalid = true;
          filesToProcess = filesToProcess.slice(0, remainingSlotCount);

          for (const file of rejectedFiles) {
            const rejectionMessage =
              propsRef.current.onFileValidate?.(file) ||
              (multiple ? text.maxFilesAllowed(fileLimit) : text.singleFileOnly);

            propsRef.current.onFileReject?.(file, rejectionMessage);
          }
        }
      }

      const acceptedFiles: File[] = [];

      for (const file of filesToProcess) {
        let rejectionMessage = propsRef.current.onFileValidate?.(file) || '';

        if (
          !rejectionMessage &&
          acceptedFileTypes &&
          !matchesAcceptedType(file, acceptedFileTypes)
        ) {
          rejectionMessage = text.fileTypeNotAccepted;
        }

        if (!rejectionMessage && maxSize && file.size > maxSize) {
          rejectionMessage = text.fileTooLarge;
        }

        if (rejectionMessage) {
          propsRef.current.onFileReject?.(file, rejectionMessage);
          nextInvalid = true;
          continue;
        }

        acceptedFiles.push(file);
      }

      if (nextInvalid) {
        clearTimeout(invalidTimerRef.current);
        store.dispatch({ type: 'SET_INVALID', invalid: true });
        invalidTimerRef.current = setTimeout(() => {
          store.dispatch({ type: 'SET_INVALID', invalid: false });
        }, TRANSIENT_INVALID_MS);
      }

      if (acceptedFiles.length === 0) return;

      if (!multiple && canMoveFocusWithin(rootRef.current)) {
        pendingFocusRef.current = 'item';
      }

      store.dispatch({ type: 'ADD_FILES', files: acceptedFiles });
      propsRef.current.onAccept?.(acceptedFiles);

      for (const file of acceptedFiles) {
        propsRef.current.onFileAccept?.(file);
      }

      if (propsRef.current.onUpload) {
        requestAnimationFrame(() => {
          void onFilesUpload(acceptedFiles);
        });
      }
    },
    [
      store,
      propsRef,
      onFilesUpload,
      maxFiles,
      acceptedFileTypes,
      maxSize,
      disabled,
      multiple,
      text,
    ],
  );

  const onFilesChangeRef = useAsRef(onFilesChange);

  const handleFilesChange = React.useCallback(
    (originalFiles: File[]) => {
      onFilesChangeRef.current(originalFiles);
    },
    [onFilesChangeRef],
  );

  const pickerSuppressUntilRef = React.useRef(0);

  const openFilePicker = React.useCallback(() => {
    if (disabled || Date.now() < pickerSuppressUntilRef.current) {
      return;
    }

    const input = fileInputRef.current;
    if (!input) {
      return;
    }

    input.value = '';
    input.click();
  }, [disabled]);

  const onInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      pickerSuppressUntilRef.current = Date.now() + FILE_PICKER_SUPPRESS_MS;
      handleFilesChange(Array.from(event.currentTarget.files ?? []));
      syncFileInput();
    },
    [handleFilesChange, syncFileInput],
  );

  const moveFocusAfterRemoval = React.useCallback(() => {
    if (!multiple && canMoveFocusWithin(rootRef.current)) {
      pendingFocusRef.current = 'area';
    }
  }, [multiple]);

  const removeFile = React.useCallback(
    (file: File) => {
      moveFocusAfterRemoval();
      pendingProgressRef.current.delete(file);
      store.dispatch({ type: 'REMOVE_FILE', file });
    },
    [moveFocusAfterRemoval, store],
  );

  const clearFiles = React.useCallback(() => {
    moveFocusAfterRemoval();
    pendingProgressRef.current.clear();
    store.dispatch({ type: 'CLEAR' });
  }, [moveFocusAfterRemoval, store]);

  const contextValue = React.useMemo<DropzoneContextValue>(
    () => ({
      dropzoneId,
      listId,
      lang,
      dir,
      text,
      disabled,
      invalid,
      urlCache,
      multiple,
      label: label ?? text.fileUpload,
      rootRef,
      pendingFocusRef,
      openFilePicker,
      onFilesChange: handleFilesChange,
      removeFile,
      clearFiles,
    }),
    [
      dropzoneId,
      listId,
      lang,
      dir,
      text,
      disabled,
      invalid,
      urlCache,
      multiple,
      label,
      openFilePicker,
      handleFilesChange,
      removeFile,
      clearFiles,
    ],
  );

  return (
    <StoreContext.Provider value={store}>
      <DropzoneContext.Provider value={contextValue}>
        <div
          ref={rootRef}
          data-slot="dropzone"
          data-disabled={disabled ? '' : undefined}
          lang={lang}
          dir={dir}
          className={twMerge(rootVariants(), className)}
          {...rootProps}
        >
          <input
            ref={fileInputRef}
            type="file"
            hidden
            tabIndex={-1}
            name={name}
            required={required}
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={onInputChange}
          />
          {children}
        </div>
      </DropzoneContext.Provider>
    </StoreContext.Provider>
  );
}

function getAreaState({
  isDisabled,
  isDropTarget,
  isHovered,
  isInvalid,
}: {
  isDisabled: boolean;
  isDropTarget: boolean;
  isHovered: boolean;
  isInvalid: boolean;
}): AreaState {
  if (isDisabled) return 'disabled';
  if (isDropTarget) return 'dropTarget';
  if (isInvalid) return 'invalid';
  if (isHovered) return 'hover';
  return 'default';
}

export interface DropzoneAreaProps extends Omit<
  AriaDropZoneProps,
  'className' | 'children' | 'isDisabled'
> {
  className?: string;
  /** Replaces the default icon, title, and hint. The trigger still renders when `showTrigger`. */
  children?: React.ReactNode | ((props: DropZoneRenderProps) => React.ReactNode);
  /** @default localized "Drag & drop files here" */
  title?: React.ReactNode;
  /** Hint under the title. @default localized "Or click to browse" */
  hint?: React.ReactNode;
  /** Trailing text after the divider, such as upload limits. Hidden when empty. */
  secondaryText?: React.ReactNode;
  /** Show the Browse files button. @default true */
  showTrigger?: boolean;
  /** Mark the area invalid, in addition to the transient state after a rejection. */
  isInvalid?: boolean;
}

function DropzoneAreaContent({
  children,
  state,
  areaState,
  layout,
  title,
  hint,
  secondaryText,
  showTrigger,
}: {
  children?: DropzoneAreaProps['children'];
  state: DropZoneRenderProps;
  areaState: AreaState;
  layout: 'horizontal' | 'vertical';
  title?: React.ReactNode;
  hint?: React.ReactNode;
  secondaryText?: React.ReactNode;
  showTrigger: boolean;
}) {
  const context = useDropzoneContext(DROPZONE_NAME);
  const content = typeof children === 'function' ? children(state) : children;
  const isDisabled = areaState === 'disabled';
  const renderedSecondary = getRenderableMessage(secondaryText);

  return (
    <>
      {content ?? (
        <>
          <span className={areaIconVariants({ isDisabled })}>
            <UploadSimple size={24} aria-hidden />
          </span>
          <span className={areaTextVariants({ layout })}>
            <Text slot="label" className={areaTitleVariants({ state: areaState })}>
              {title ?? context.text.dragDropFilesHere}
            </Text>
            <span className={areaMetaVariants({ layout })}>
              <span className={areaHintVariants({ isDisabled })}>
                {hint ?? context.text.orClickToBrowse}
              </span>
              {renderedSecondary !== undefined ? (
                <>
                  <span aria-hidden className={metaDividerVariants()} />
                  <span className={areaSecondaryVariants({ isDisabled })}>{renderedSecondary}</span>
                </>
              ) : null}
            </span>
          </span>
        </>
      )}
      {showTrigger ? <DropzoneTrigger /> : null}
    </>
  );
}

function DropzoneAreaSurface({
  className,
  children,
  title,
  hint,
  secondaryText,
  showTrigger = true,
  isInvalid: isInvalidProp,
  onDrop: onDropProp,
  onClick: onClickProp,
  getDropOperation,
  ...dropzoneProps
}: DropzoneAreaProps) {
  const context = useDropzoneContext(DROPZONE_NAME);
  const { disabled, label, multiple, openFilePicker, onFilesChange, pendingFocusRef } = context;
  const transientInvalid = useStore((state) => state.invalid);
  const isInvalid = Boolean(isInvalidProp) || context.invalid || transientInvalid;
  const layout = multiple ? 'vertical' : 'horizontal';
  const surfaceRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (pendingFocusRef.current !== 'area') return;
    pendingFocusRef.current = null;

    const surface = surfaceRef.current;
    const focusTarget =
      surface?.querySelector<HTMLElement>('[data-slot="dropzone-trigger"]:not([disabled])') ??
      surface?.querySelector<HTMLElement>('button, [tabindex]');
    focusTarget?.focus();
  }, [pendingFocusRef]);

  const onDrop = React.useCallback(
    async (event: DropEvent) => {
      await onDropProp?.(event);
      if (event.dropOperation === 'cancel') return;

      const droppedFiles = await filesFromDropEvent(event);
      if (droppedFiles.length > 0) {
        onFilesChange(droppedFiles);
      }
    },
    [onFilesChange, onDropProp],
  );

  const onSurfaceKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled || (event.key !== 'Enter' && event.key !== ' ')) return;

      const target = event.target;
      if (
        target instanceof Element &&
        target.closest('[data-slot="dropzone-trigger"], a[href], input, select, textarea')
      ) {
        return;
      }

      event.preventDefault();
      openFilePicker();
    },
    [disabled, openFilePicker],
  );

  return (
    // Captures Enter/Space bubbling from React Aria's visually hidden drop button,
    // which DropZone does not expose keyboard props for.
    <div ref={surfaceRef} role="presentation" className="w-full" onKeyDown={onSurfaceKeyDown}>
      <AriaDropZone
        data-slot="dropzone-area"
        data-layout={layout}
        data-invalid={isInvalid ? '' : undefined}
        aria-label={label}
        isDisabled={disabled}
        getDropOperation={getDropOperation ?? getFileDropOperation}
        onDrop={onDrop}
        onClick={onClickProp}
        className={(state) =>
          twMerge(
            areaVariants({
              layout,
              state: getAreaState({
                isDisabled: state.isDisabled,
                isDropTarget: state.isDropTarget,
                isHovered: state.isHovered,
                isInvalid,
              }),
              isFocusVisible: state.isFocusVisible,
            }),
            className,
          )
        }
        {...dropzoneProps}
      >
        {(state) => (
          <DropzoneAreaContent
            state={state}
            areaState={getAreaState({
              isDisabled: state.isDisabled,
              isDropTarget: state.isDropTarget,
              isHovered: state.isHovered,
              isInvalid,
            })}
            layout={layout}
            title={title}
            hint={hint}
            secondaryText={secondaryText}
            showTrigger={showTrigger}
          >
            {children}
          </DropzoneAreaContent>
        )}
      </AriaDropZone>
    </div>
  );
}

/**
 * In single-file mode the area is replaced by the file item once a file is chosen.
 */
export function DropzoneArea(props: DropzoneAreaProps) {
  const context = useDropzoneContext(DROPZONE_NAME);
  const fileCount = useStore((state) => state.files.size);

  if (!context.multiple && fileCount > 0) return null;

  return <DropzoneAreaSurface {...props} />;
}

export interface DropzoneTriggerProps extends Omit<ButtonProps, 'iconOnly'> {}

export function DropzoneTrigger({
  className,
  children,
  onPress: onPressProp,
  isDisabled,
  ...triggerProps
}: DropzoneTriggerProps) {
  const context = useDropzoneContext(TRIGGER_NAME);
  const resolvedDisabled = Boolean(isDisabled) || context.disabled;

  const onPress = React.useCallback(
    (event: Parameters<NonNullable<ButtonProps['onPress']>>[0]) => {
      onPressProp?.(event);
      context.openFilePicker();
    },
    [context, onPressProp],
  );

  return (
    <Button
      data-slot="dropzone-trigger"
      type="button"
      intent="secondary"
      appearance="transparent"
      size="sm"
      isDisabled={resolvedDisabled}
      className={twMerge('shrink-0', className)}
      onPress={onPress}
      {...triggerProps}
    >
      {children ?? context.text.browseFiles}
    </Button>
  );
}

export interface DropzoneListProps extends React.ComponentProps<'div'> {
  forceMount?: boolean;
}

export function DropzoneList({ className, forceMount, children, ...listProps }: DropzoneListProps) {
  const context = useDropzoneContext(LIST_NAME);
  const fileCount = useStore((state) => state.files.size);
  const shouldRender = forceMount || fileCount > 0;

  if (!shouldRender) return null;

  return (
    <div
      data-slot="dropzone-list"
      id={context.listId}
      role="list"
      data-state={fileCount > 0 ? 'active' : 'inactive'}
      className={twMerge(listVariants(), className)}
      {...listProps}
    >
      {children}
    </div>
  );
}

interface DropzoneItemContextValue {
  id: string;
  fileState: DropzoneFileState | undefined;
  nameId: string;
  sizeId: string;
  statusId: string;
}

const DropzoneItemContext = React.createContext<DropzoneItemContextValue | null>(null);

function useDropzoneItemContext(consumerName: string) {
  const context = React.useContext(DropzoneItemContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ITEM_NAME}\``);
  }
  return context;
}

export interface DropzoneItemProps extends React.ComponentProps<'div'> {
  value: File;
}

export function DropzoneItem({ value, className, children, ...itemProps }: DropzoneItemProps) {
  const context = useDropzoneContext(ITEM_NAME);
  const id = React.useId();
  const statusId = `${id}-status`;
  const nameId = `${id}-name`;
  const sizeId = `${id}-size`;

  const fileState = useStore((state) => state.files.get(value));
  const fileCount = useStore((state) => state.files.size);
  const fileIndex = useStore((state) => {
    const fileKeys = Array.from(state.files.keys());
    return fileKeys.indexOf(value) + 1;
  });

  const itemContext = React.useMemo<DropzoneItemContextValue>(
    () => ({
      id,
      fileState,
      nameId,
      sizeId,
      statusId,
    }),
    [id, fileState, statusId, nameId, sizeId],
  );

  if (!fileState) return null;

  const statusText = fileState.error
    ? context.text.statusError(fileState.error)
    : fileState.status === 'uploading'
      ? context.text.statusUploading(fileState.progress)
      : fileState.status === 'success'
        ? context.text.uploadComplete
        : context.text.readyToUpload;

  return (
    <DropzoneItemContext.Provider value={itemContext}>
      <div
        data-slot="dropzone-item"
        data-status={fileState.status}
        role="listitem"
        aria-setsize={fileCount}
        aria-posinset={fileIndex}
        aria-labelledby={nameId}
        aria-describedby={`${sizeId} ${statusId}`}
        className={twMerge(itemVariants({ status: fileState.status }), className)}
        {...itemProps}
      >
        {children}
        <span id={statusId} className={srOnlyVariants()}>
          {statusText}
        </span>
      </div>
    </DropzoneItemContext.Provider>
  );
}

export interface DropzoneItemPreviewProps extends React.ComponentProps<'div'> {
  render?: (file: File, fallback: () => React.ReactNode) => React.ReactNode;
}

export function DropzoneItemPreview({
  render,
  children,
  className,
  ...previewProps
}: DropzoneItemPreviewProps) {
  const itemContext = useDropzoneItemContext(ITEM_PREVIEW_NAME);
  const context = useDropzoneContext(ITEM_PREVIEW_NAME);

  const getDefaultRender = React.useCallback(
    (file: File) => {
      if (file.type.startsWith('image/')) {
        let url = context.urlCache.get(file);
        if (!url) {
          url = URL.createObjectURL(file);
          context.urlCache.set(file, url);
        }

        return <img src={url} alt="" className={previewImageVariants()} />;
      }

      return getFileIcon(file);
    },
    [context.urlCache],
  );

  if (!itemContext.fileState) return null;

  const file = itemContext.fileState.file;

  return (
    <div
      data-slot="dropzone-item-preview"
      aria-hidden
      className={twMerge(previewVariants(), className)}
      {...previewProps}
    >
      {render ? render(file, () => getDefaultRender(file)) : getDefaultRender(file)}
      {children}
    </div>
  );
}

export interface DropzoneItemMetadataProps extends React.ComponentProps<'div'> {}

function DropzoneItemStatus({
  fileState,
  text,
}: {
  fileState: DropzoneFileState;
  text: DropzoneText;
}) {
  switch (fileState.status) {
    case 'uploading':
      return (
        <span dir="ltr" className={metadataStatusVariants({ status: 'uploading' })}>
          {fileState.progress}%
        </span>
      );
    case 'success':
      return (
        <span className={metadataStatusVariants({ status: 'success' })}>
          <CheckCircle size={12} weight="fill" aria-hidden className="shrink-0" />
          {text.uploaded}
        </span>
      );
    case 'error':
      return (
        <span className={metadataStatusVariants({ status: 'error' })}>
          <WarningCircle size={12} weight="fill" aria-hidden className="shrink-0" />
          <bdi className="min-w-0">{fileState.error}</bdi>
        </span>
      );
    default:
      return null;
  }
}

export function DropzoneItemMetadata({
  children,
  className,
  ...metadataProps
}: DropzoneItemMetadataProps) {
  const itemContext = useDropzoneItemContext(ITEM_METADATA_NAME);
  const context = useDropzoneContext(ITEM_METADATA_NAME);
  const fileState = itemContext.fileState;

  if (!fileState) return null;

  const hasStatus = fileState.status !== 'idle';

  return (
    <div
      data-slot="dropzone-item-metadata"
      className={twMerge(metadataVariants(), className)}
      {...metadataProps}
    >
      {children ?? (
        <>
          <span id={itemContext.nameId} className={metadataNameVariants()}>
            <bdi>{fileState.file.name}</bdi>
          </span>
          <span className={metadataRowVariants()}>
            <span id={itemContext.sizeId} lang="en" dir="ltr" className={metadataSizeVariants()}>
              {formatBytes(fileState.file.size)}
            </span>
            {hasStatus ? (
              // The item's screen reader status already announces this text.
              <span aria-hidden className="contents">
                <span className={metaDividerVariants()} />
                <DropzoneItemStatus fileState={fileState} text={context.text} />
              </span>
            ) : null}
          </span>
        </>
      )}
    </div>
  );
}

export interface DropzoneItemProgressProps extends React.ComponentProps<'div'> {
  /** Render the bar even when the file is idle or failed. */
  forceMount?: boolean;
}

export function DropzoneItemProgress({
  forceMount,
  className,
  ...progressProps
}: DropzoneItemProgressProps) {
  const itemContext = useDropzoneItemContext(ITEM_PROGRESS_NAME);
  const context = useDropzoneContext(ITEM_PROGRESS_NAME);
  const fileState = itemContext.fileState;

  if (!fileState) return null;

  const isUploading = fileState.status === 'uploading';
  const shouldRender = forceMount || isUploading || fileState.status === 'success';

  if (!shouldRender) return null;

  if (!isUploading) {
    return (
      <div
        data-slot="dropzone-item-progress"
        aria-hidden
        className={twMerge(progressTrackVariants(), className)}
        {...progressProps}
      >
        <div className={progressBarVariants()} style={{ inlineSize: `${fileState.progress}%` }} />
      </div>
    );
  }

  return (
    <ProgressBar
      data-slot="dropzone-item-progress"
      aria-label={context.text.uploadProgressFor(fileState.file.name)}
      value={fileState.progress}
      minValue={0}
      maxValue={100}
      className={twMerge(progressTrackVariants(), className)}
      {...progressProps}
    >
      {({ percentage }) => (
        <div className={progressBarVariants()} style={{ inlineSize: `${percentage ?? 0}%` }} />
      )}
    </ProgressBar>
  );
}

export interface DropzoneItemDeleteProps extends Omit<
  React.ComponentProps<typeof AriaButton>,
  'children' | 'className' | 'style' | 'ref'
> {
  className?: string;
}

export function DropzoneItemDelete({
  onPress: onPressProp,
  className,
  isDisabled,
  ...deleteProps
}: DropzoneItemDeleteProps) {
  const itemContext = useDropzoneItemContext(ITEM_DELETE_NAME);
  const context = useDropzoneContext(ITEM_DELETE_NAME);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const { pendingFocusRef } = context;
  const fileState = itemContext.fileState;

  React.useEffect(() => {
    if (pendingFocusRef.current !== 'item') return;
    pendingFocusRef.current = null;
    buttonRef.current?.focus();
  }, [pendingFocusRef]);

  const onPress = React.useCallback(
    (event: Parameters<NonNullable<ButtonProps['onPress']>>[0]) => {
      onPressProp?.(event);
      if (fileState) context.removeFile(fileState.file);
    },
    [context, fileState, onPressProp],
  );

  if (!fileState) return null;

  const isUploaded = fileState.status === 'success';

  return (
    <Button
      {...deleteProps}
      ref={buttonRef}
      type="button"
      data-slot="dropzone-item-delete"
      iconOnly
      size="sm"
      intent={isUploaded ? 'danger' : 'secondary'}
      appearance="transparent"
      aria-label={context.text.removeFile(fileState.file.name)}
      isDisabled={Boolean(isDisabled) || context.disabled}
      className={twMerge('shrink-0', className)}
      onPress={onPress}
    >
      {isUploaded ? (
        <Trash size={16} weight="bold" aria-hidden />
      ) : (
        <X size={16} weight="bold" aria-hidden />
      )}
    </Button>
  );
}

export interface DropzoneClearProps extends Omit<ButtonProps, 'onPress' | 'iconOnly'> {
  forceMount?: boolean;
  onPress?: ButtonProps['onPress'];
}

export function DropzoneClear({
  forceMount,
  isDisabled: disabled,
  onPress: onPressProp,
  className,
  children,
  ...clearProps
}: DropzoneClearProps) {
  const context = useDropzoneContext(CLEAR_NAME);
  const fileCount = useStore((state) => state.files.size);

  const isDisabled = Boolean(disabled) || context.disabled;

  const onPress = React.useCallback(
    (event: Parameters<NonNullable<ButtonProps['onPress']>>[0]) => {
      onPressProp?.(event);
      context.clearFiles();
    },
    [context, onPressProp],
  );

  const shouldRender = forceMount || fileCount > 0;

  if (!shouldRender) return null;

  return (
    <Button
      type="button"
      data-slot="dropzone-clear"
      intent="secondary"
      appearance="ghost"
      size="sm"
      isDisabled={isDisabled}
      className={twMerge('self-start', className)}
      onPress={onPress}
      {...clearProps}
    >
      {children ?? context.text.clearAll}
    </Button>
  );
}

export function useDropzone<T>(selector: (state: DropzoneState) => T): T {
  return useStore(selector);
}

export type DropzoneLabelSize = 'sm' | 'md';

export interface DropzoneFieldProps extends Pick<
  DropzoneProps,
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'onAccept'
  | 'onFileAccept'
  | 'onFileReject'
  | 'onFileValidate'
  | 'onUpload'
  | 'maxFiles'
  | 'maxSize'
  | 'multiple'
  | 'name'
  | 'required'
  | 'id'
> {
  /** Visible label. */
  label?: React.ReactNode;
  /** Content for the header info tooltip. */
  infoTooltip?: React.ReactNode;
  infoTooltipAriaLabel?: string;
  /** Shows localized Optional. Hidden when `isRequired`. */
  isOptional?: boolean;
  /** Marks the field required and shows the asterisk. */
  isRequired?: boolean;
  /** @default true */
  showRequiredIndicator?: boolean;
  /** Helper text beneath the field. */
  description?: React.ReactNode;
  /** Replaces the description when the field is invalid. */
  errorMessage?: React.ReactNode;
  /** Label type scale: `md` uses Body/md, `sm` uses Body/sm. @default 'md' */
  labelSize?: DropzoneLabelSize;
  isDisabled?: boolean;
  /** @default true when `errorMessage` has content */
  isInvalid?: boolean;
  /** Drop area title. */
  title?: React.ReactNode;
  /** Drop area hint under the title. */
  hint?: React.ReactNode;
  /** Trailing drop area text after the divider, such as upload limits. */
  secondaryText?: React.ReactNode;
  /** Show the Browse files button. @default true */
  showTrigger?: boolean;
  /** Accepted MIME types, wildcards, or extensions. */
  acceptedFileTypes?: string[];
  /** Layout class on the root (width, margin, flex/grid). */
  className?: string;
  /** Accessible name when there is no visible `label`. */
  'aria-label'?: string;
}

const fieldLabelVariants = cva('text-base-default', {
  variants: {
    size: {
      sm: 'type-body-sm-regular',
      md: 'type-body-md-regular',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const fieldOptionalVariants = cva('type-body-sm-regular text-base-subtle');

function DropzoneFieldItems() {
  const files = useStore((state) => Array.from(state.files.keys()));

  return (
    <>
      {files.map((file) => (
        <DropzoneItem key={`${file.name}-${file.size}-${file.lastModified}`} value={file}>
          <DropzoneItemPreview />
          <DropzoneItemMetadata />
          <DropzoneItemDelete />
          <DropzoneItemProgress />
        </DropzoneItem>
      ))}
    </>
  );
}

/** Form field composing the Dropzone parts with a label, helper, and error message. */
export function DropzoneField({
  label,
  infoTooltip,
  infoTooltipAriaLabel,
  isOptional = false,
  isRequired = false,
  showRequiredIndicator = true,
  description,
  errorMessage,
  labelSize = 'md',
  isDisabled = false,
  isInvalid: isInvalidProp,
  title,
  hint,
  secondaryText,
  showTrigger = true,
  acceptedFileTypes,
  className,
  'aria-label': ariaLabel,
  ...dropzoneProps
}: DropzoneFieldProps) {
  const languageConfig = useVeliLanguage();
  const text = dropzoneText[languageConfig.language];
  const labelId = React.useId();
  const messageId = React.useId();

  const renderedError = getRenderableMessage(errorMessage);
  const renderedDescription = getRenderableMessage(description);
  const isInvalid = isInvalidProp ?? renderedError !== undefined;
  const message = isInvalid && renderedError !== undefined ? renderedError : renderedDescription;
  const showOptionalLabel = shouldShowFieldOptional(isOptional, isRequired);
  const showRequired = showRequiredIndicator && isRequired;
  const hasHeader = Boolean(label || infoTooltip || showOptionalLabel || showRequired);

  return (
    <Dropzone
      {...dropzoneProps}
      label={ariaLabel ?? (typeof label === 'string' ? label : text.fileUpload)}
      accept={acceptedFileTypes?.join(',')}
      disabled={isDisabled}
      required={isRequired || dropzoneProps.required}
      invalid={isInvalid}
      className={twMerge('gap-0', className)}
    >
      {hasHeader ? (
        <div className="flex w-full items-center gap-2 pb-2">
          {label ? (
            <span id={labelId} className={fieldLabelVariants({ size: labelSize })}>
              {label}
            </span>
          ) : null}
          {infoTooltip ? (
            <TooltipTrigger>
              <AriaButton
                type="button"
                aria-label={infoTooltipAriaLabel ?? text.moreInformation}
                className={fieldHeaderInfoTooltipTriggerVariants({ isDisabled })}
                isDisabled={isDisabled}
              >
                <Info size={16} aria-hidden />
              </AriaButton>
              <Tooltip placement="top" lang={languageConfig.lang} dir={languageConfig.direction}>
                {infoTooltip}
              </Tooltip>
            </TooltipTrigger>
          ) : null}
          {showOptionalLabel ? (
            <span className={fieldOptionalVariants()}>
              {getFieldOptionalLabel(languageConfig.language)}
            </span>
          ) : null}
          {showRequired ? <span className={fieldHeaderRequiredIndicatorVariants()}>*</span> : null}
        </div>
      ) : null}
      <div className="flex w-full flex-col gap-1">
        <DropzoneArea
          aria-labelledby={label && !ariaLabel ? labelId : undefined}
          aria-describedby={message !== undefined ? messageId : undefined}
          title={title}
          hint={hint}
          secondaryText={secondaryText}
          showTrigger={showTrigger}
        />
        <DropzoneList aria-labelledby={label && !ariaLabel ? labelId : undefined}>
          <DropzoneFieldItems />
        </DropzoneList>
      </div>
      {message !== undefined ? (
        <div className="pt-1.5">
          <span
            id={messageId}
            className={messageVariants({
              size: 'md',
              tone: isInvalid && renderedError !== undefined ? 'danger' : 'subtle',
            })}
          >
            {message}
          </span>
        </div>
      ) : null}
    </Dropzone>
  );
}
