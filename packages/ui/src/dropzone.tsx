'use client';

import * as React from 'react';
import {
  Button as AriaButton,
  DropZone as AriaDropZone,
  FileTrigger,
  isFileDropItem,
  Label,
  ProgressBar,
  Text,
  type DropZoneProps as AriaDropZoneProps,
  type DropZoneRenderProps,
} from 'react-aria-components';
import { cva } from 'class-variance-authority';
import {
  File,
  Archive,
  FileAudio,
  FileCode,
  FileImage,
  FileText,
  FileVideo,
  GearSix,
  UploadSimple,
  X,
} from 'phosphor-react';
import { twMerge } from 'tailwind-merge';
import { Button, type ButtonProps } from './button';
import { StaticFieldMessage } from './field-shared';
import { useVeliLanguage } from './provider';

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
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

function getFileIcon(file: File) {
  const type = file.type;
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const iconClass = 'h-5 w-5 text-text-default-muted';

  if (type.startsWith('image/')) {
    return <FileImage className={iconClass} aria-hidden />;
  }

  if (type.startsWith('video/')) {
    return <FileVideo className={iconClass} aria-hidden />;
  }

  if (type.startsWith('audio/')) {
    return <FileAudio className={iconClass} aria-hidden />;
  }

  if (type.startsWith('text/') || ['txt', 'md', 'rtf', 'pdf'].includes(extension)) {
    return <FileText className={iconClass} aria-hidden />;
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
    return <FileCode className={iconClass} aria-hidden />;
  }

  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension)) {
    return <Archive className={iconClass} aria-hidden />;
  }

  if (
    ['exe', 'msi', 'app', 'apk', 'deb', 'rpm'].includes(extension) ||
    type.startsWith('application/')
  ) {
    return <GearSix className={iconClass} aria-hidden />;
  }

  return <File className={iconClass} aria-hidden />;
}

type Direction = 'ltr' | 'rtl';

const dropzoneText = {
  en: {
    fileUpload: 'File upload',
    uploadFailed: 'Upload failed',
    maxFilesAllowed: (maxFiles: number) => `Maximum ${maxFiles} files allowed`,
    fileTypeNotAccepted: 'File type not accepted',
    fileTooLarge: 'File too large',
    releaseToUpload: 'Release to upload',
    dragDropFilesHere: 'Drag & drop files here',
    orClickToBrowse: 'Or click to browse',
    browseFiles: 'Browse files',
    statusError: (error: string) => `Error: ${error}`,
    statusUploading: (progress: number) => `Uploading: ${progress}% complete`,
    uploadComplete: 'Upload complete',
    readyToUpload: 'Ready to upload',
    uploadProgressFor: (fileName: string) => `Upload progress for ${fileName}`,
    removeFile: (fileName: string) => `Remove ${fileName}`,
    clearAll: 'Clear all',
  },
  dv: {
    fileUpload: 'ފައިލް އަޕްލޯޑް',
    uploadFailed: 'އަޕްލޯޑެއް ނުކުރެވުނު',
    maxFilesAllowed: (maxFiles: number) => `ފައިލް ${maxFiles} ގިނަވެގެން އަޕްލޯޑް ކުރެވޭނީ`,
    fileTypeNotAccepted: 'މި ފައިލް ފޯމެޓްގެ ސަޕޯޓެއް ނުކުރޭ',
    fileTooLarge: 'ފައިލްގެ ސައިޒު މާ ބޮޑު',
    releaseToUpload: 'އަޕްލޯޑްކުރަން ދޫކޮށްލާ',
    dragDropFilesHere: 'ފައިލްތައް މިތަނަށް ޑްރެގްކޮށް ދޫކޮށްލާ',
    orClickToBrowse: 'ނުވަތަ ފައިލް ހޯދަން ފިތާލާ',
    browseFiles: 'ފައިލްތައް ހޯދާ',
    statusError: (error: string) => `އެރަރ: ${error}`,
    statusUploading: (progress: number) => `އަޕްލޯޑްވަނީ: ${progress}%`,
    uploadComplete: 'އަޕްލޯޑްކޮށް ނިމިއްޖެ',
    readyToUpload: 'އަޕްލޯޑްކުރަން ތައްޔާރު',
    uploadProgressFor: (fileName: string) => `${fileName} އަޕްލޯޑްވަމުންދާ މިންވަރު`,
    removeFile: (fileName: string) => `${fileName} ރިމޫވް ކުރޭ`,
    clearAll: 'ހުރިހާ ފައިލެއް ރިމޫވް ކުރޭ',
  },
} as const;

type DropzoneText = (typeof dropzoneText)[keyof typeof dropzoneText];

interface FileState {
  file: File;
  progress: number;
  error?: string;
  status: 'idle' | 'uploading' | 'error' | 'success';
}

interface StoreState {
  files: Map<File, FileState>;
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
  getState: () => StoreState;
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

function useStore<T>(selector: (state: StoreState) => T): T {
  const store = useStoreContext('useStore');
  const lastValueRef = React.useRef<{ value: T; state: StoreState } | null>(null);

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

const FILE_PICKER_SUPPRESS_MS = 500;

interface DropzoneContextValue {
  dropzoneId: string;
  listId: string;
  disabled: boolean;
  lang: string;
  dir: Direction;
  text: DropzoneText;
  urlCache: WeakMap<File, string>;
  acceptedFileTypes: readonly string[] | undefined;
  multiple: boolean;
  label?: string;
  name?: string;
  required?: boolean;
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  openFilePicker: () => void;
  suppressFilePicker: () => void;
  isFilePickerSuppressed: () => boolean;
  onFilesChange: (files: File[]) => void;
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

function getDropOperationForAccept(
  types: Parameters<NonNullable<AriaDropZoneProps['getDropOperation']>>[0],
  acceptTypes: readonly string[] | null | undefined,
) {
  // File upload dropzones should show drop-target feedback for OS file drags.
  // Browsers often expose only "Files" during dragover — not specific mime types.
  // File type/size rules are enforced after drop in onFilesChange.
  if (types.has('Files')) {
    return 'copy' as const;
  }

  if (!acceptTypes?.length) {
    return 'copy' as const;
  }

  const matchesAccept = acceptTypes.some((acceptType) => {
    if (acceptType.includes('/*')) {
      return true;
    }

    if (acceptType.startsWith('.')) {
      return types.has(acceptType);
    }

    return types.has(acceptType);
  });

  if (matchesAccept) {
    return 'copy' as const;
  }

  // Unknown file payloads (e.g. extension-only types) — still show feedback.
  return 'copy' as const;
}

const DropzoneContext = React.createContext<DropzoneContextValue | null>(null);

function useDropzoneContext(consumerName: string) {
  const context = React.useContext(DropzoneContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

const rootVariants = cva('flex w-full flex-col gap-2 font-sans antialiased');

function isDropzoneTriggerElement(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest('[data-slot="dropzone-trigger"]'));
}

const dropzoneVariants = cva(
  'flex min-h-[96px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center outline-none transition-colors data-[drop-target]:border-border-focus data-[drop-target]:bg-button-primary-subtle-default data-[drop-target]:text-text-primary-muted',
  {
    variants: {
      isDisabled: {
        true: 'cursor-not-allowed border-border-default-subtle bg-text-input-bg-default text-text-disabled-disabled',
        false: 'border-border-default-subtle bg-text-input-bg-default text-text-default-muted',
      },
      isDragging: {
        true: 'border-border-focus bg-button-primary-subtle-default text-text-primary-muted',
        false: '',
      },
      isInvalid: {
        true: 'border-border-danger-default',
        false: '',
      },
      isFocused: {
        true: 'ring-2 ring-border-focus ring-offset-2 ring-offset-bg-surface-base',
        false: '',
      },
    },
    defaultVariants: {
      isDisabled: false,
      isDragging: false,
      isInvalid: false,
      isFocused: false,
    },
  },
);

const dropzoneTitleVariants = cva('type-body-md-medium text-text-default-default');

const dropzoneHintVariants = cva('type-body-sm-regular text-text-default-subtle');

const listVariants = cva('flex gap-2', {
  variants: {
    orientation: {
      horizontal: 'flex-row flex-wrap',
      vertical: 'flex-col',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

const itemVariants = cva(
  'relative flex flex-wrap items-center gap-x-3 gap-y-2 overflow-hidden rounded-xl border border-border-default-subtle bg-text-input-bg-default p-3',
);

const previewVariants = cva(
  'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-button-secondary-subtle-default',
);

const previewImageVariants = cva('h-full w-full object-cover');

const metadataVariants = cva('flex min-w-0 flex-1 flex-col gap-0.5 text-start', {
  variants: {
    size: {
      default: '',
      sm: 'gap-0',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const metadataNameVariants = cva('truncate type-body-sm-medium text-text-default-default', {
  variants: {
    size: {
      default: 'type-body-sm-medium',
      sm: 'type-caption-medium',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const metadataSizeVariants = cva('type-caption-regular text-text-default-subtle');

const metadataErrorVariants = cva('type-caption-regular text-text-danger-muted');

const progressTrackVariants = cva(
  'relative h-1 w-full overflow-hidden rounded-full bg-border-default-subtle',
);

const progressBarVariants = cva(
  'absolute inset-y-0 [inset-inline-start:0] h-full rounded-full bg-button-primary-default transition-[inline-size]',
);

const deleteButtonVariants = cva(
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-default-muted outline-none transition-colors hover:bg-button-secondary-subtle-hover hover:text-text-default-default focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface-base',
);

const fillProgressVariants = cva(
  'pointer-events-none absolute inset-0 bg-button-primary-subtle-default transition-[clip-path]',
);

const srOnlyVariants = cva('sr-only');

export interface DropzoneProps extends Omit<
  React.ComponentProps<'div'>,
  'defaultValue' | 'onChange'
> {
  value?: File[];
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  onAccept?: (files: File[]) => void;
  onFileAccept?: (file: File) => void;
  onFileReject?: (file: File, message: string) => void;
  onFileValidate?: (file: File) => string | null | undefined;
  onUpload?: (
    files: File[],
    options: {
      onProgress: (file: File, progress: number) => void;
      onSuccess: (file: File) => void;
      onError: (file: File, error: Error) => void;
    },
  ) => Promise<void> | void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  dir?: Direction;
  label?: string;
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  multiple?: boolean;
  required?: boolean;
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
    disabled = false,
    invalid = false,
    multiple = false,
    required = false,
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

  const [listeners] = React.useState(() => new Set<() => void>());
  const [files] = React.useState(() => new Map<File, FileState>());
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
    const stateRef: { current: StoreState } = {
      current: {
        files,
        invalid,
      },
    };

    function reducer(currentState: StoreState, action: StoreAction): StoreState {
      switch (action.type) {
        case 'ADD_FILES': {
          for (const file of action.files) {
            files.set(file, {
              file,
              progress: 0,
              status: 'idle',
            });
          }

          if (propsRef.current.onValueChange) {
            const fileList = Array.from(files.values()).map((fileState) => fileState.file);
            propsRef.current.onValueChange(fileList);
          }
          return { ...currentState, files };
        }

        case 'SET_FILES': {
          const newFileSet = new Set(action.files);
          for (const existingFile of files.keys()) {
            if (!newFileSet.has(existingFile)) {
              files.delete(existingFile);
            }
          }

          for (const file of action.files) {
            const existingState = files.get(file);
            if (!existingState) {
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
          if (fileState) {
            files.set(action.file, {
              ...fileState,
              progress: action.progress,
              status: 'uploading',
            });
          }
          return { ...currentState, files };
        }

        case 'SET_SUCCESS': {
          const fileState = files.get(action.file);
          if (fileState) {
            files.set(action.file, {
              ...fileState,
              progress: 100,
              status: 'success',
            });
          }
          return { ...currentState, files };
        }

        case 'SET_ERROR': {
          const fileState = files.get(action.file);
          if (fileState) {
            files.set(action.file, {
              ...fileState,
              error: action.error,
              status: 'error',
            });
          }
          return { ...currentState, files };
        }

        case 'REMOVE_FILE': {
          const cachedUrl = urlCache.get(action.file);
          if (cachedUrl) {
            URL.revokeObjectURL(cachedUrl);
            urlCache.delete(action.file);
          }

          files.delete(action.file);

          if (propsRef.current.onValueChange) {
            const fileList = Array.from(files.values()).map((fileState) => fileState.file);
            propsRef.current.onValueChange(fileList);
          }
          return { ...currentState, files };
        }

        case 'SET_INVALID': {
          return { ...currentState, invalid: action.invalid };
        }

        case 'CLEAR': {
          for (const file of files.keys()) {
            const cachedUrl = urlCache.get(file);
            if (cachedUrl) {
              URL.revokeObjectURL(cachedUrl);
              urlCache.delete(file);
            }
          }

          files.clear();
          if (propsRef.current.onValueChange) {
            propsRef.current.onValueChange([]);
          }
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
  }, [listeners, files, invalid, propsRef, urlCache]);

  const acceptTypes = acceptedFileTypes ?? null;

  const progressFrameRef = React.useRef(0);
  const onProgress = React.useCallback(
    (file: File, progress: number) => {
      if (progressFrameRef.current) return;
      progressFrameRef.current = requestAnimationFrame(() => {
        progressFrameRef.current = 0;
        store.dispatch({
          type: 'SET_PROGRESS',
          file,
          progress: Math.min(Math.max(0, progress), 100),
        });
      });
    },
    [store],
  );

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

  const onFilesUpload = React.useCallback(
    async (uploadFiles: File[]) => {
      try {
        for (const file of uploadFiles) {
          store.dispatch({ type: 'SET_PROGRESS', file, progress: 0 });
        }

        if (propsRef.current.onUpload) {
          await propsRef.current.onUpload(uploadFiles, {
            onProgress,
            onSuccess: (file) => {
              store.dispatch({ type: 'SET_SUCCESS', file });
            },
            onError: (file, error) => {
              store.dispatch({
                type: 'SET_ERROR',
                file,
                error: error.message ?? text.uploadFailed,
              });
            },
          });
        } else {
          for (const file of uploadFiles) {
            store.dispatch({ type: 'SET_SUCCESS', file });
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : text.uploadFailed;
        for (const file of uploadFiles) {
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

      if (maxFiles) {
        const currentCount = store.getState().files.size;
        const remainingSlotCount = Math.max(0, maxFiles - currentCount);

        if (remainingSlotCount < filesToProcess.length) {
          const rejectedFiles = filesToProcess.slice(remainingSlotCount);
          nextInvalid = true;
          filesToProcess = filesToProcess.slice(0, remainingSlotCount);

          for (const file of rejectedFiles) {
            let rejectionMessage = text.maxFilesAllowed(maxFiles);

            if (propsRef.current.onFileValidate) {
              const validationMessage = propsRef.current.onFileValidate(file);
              if (validationMessage) {
                rejectionMessage = validationMessage;
              }
            }

            propsRef.current.onFileReject?.(file, rejectionMessage);
          }
        }
      }

      const acceptedFiles: File[] = [];

      for (const file of filesToProcess) {
        let rejected = false;
        let rejectionMessage = '';

        if (propsRef.current.onFileValidate) {
          const validationMessage = propsRef.current.onFileValidate(file);
          if (validationMessage) {
            rejectionMessage = validationMessage;
            propsRef.current.onFileReject?.(file, rejectionMessage);
            rejected = true;
            nextInvalid = true;
            continue;
          }
        }

        if (acceptTypes) {
          const fileType = file.type;
          const fileExtension = `.${file.name.split('.').pop()}`;

          if (
            !acceptTypes.some(
              (type) =>
                type === fileType ||
                type === fileExtension ||
                (type.includes('/*') && fileType.startsWith(type.replace('/*', '/'))),
            )
          ) {
            rejectionMessage = text.fileTypeNotAccepted;
            propsRef.current.onFileReject?.(file, rejectionMessage);
            rejected = true;
            nextInvalid = true;
          }
        }

        if (maxSize && file.size > maxSize) {
          rejectionMessage = text.fileTooLarge;
          propsRef.current.onFileReject?.(file, rejectionMessage);
          rejected = true;
          nextInvalid = true;
        }

        if (!rejected) {
          acceptedFiles.push(file);
        }
      }

      if (nextInvalid) {
        store.dispatch({ type: 'SET_INVALID', invalid: true });
        setTimeout(() => {
          store.dispatch({ type: 'SET_INVALID', invalid: false });
        }, 2000);
      }

      if (acceptedFiles.length > 0) {
        store.dispatch({ type: 'ADD_FILES', files: acceptedFiles });

        if (isControlled && propsRef.current.onValueChange) {
          const currentFiles = Array.from(store.getState().files.values()).map(
            (fileState) => fileState.file,
          );
          propsRef.current.onValueChange([...currentFiles]);
        }

        if (propsRef.current.onAccept) {
          propsRef.current.onAccept(acceptedFiles);
        }

        for (const file of acceptedFiles) {
          propsRef.current.onFileAccept?.(file);
        }

        if (propsRef.current.onUpload) {
          requestAnimationFrame(() => {
            void onFilesUpload(acceptedFiles);
          });
        }
      }
    },
    [store, isControlled, propsRef, onFilesUpload, maxFiles, acceptTypes, maxSize, disabled, text],
  );

  const onFilesChangeRef = useAsRef(onFilesChange);

  const handleFilesChange = React.useCallback(
    (originalFiles: File[]) => {
      onFilesChangeRef.current(originalFiles);
    },
    [onFilesChangeRef],
  );

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const pickerSuppressUntilRef = React.useRef(0);

  const suppressFilePicker = React.useCallback(() => {
    pickerSuppressUntilRef.current = Date.now() + FILE_PICKER_SUPPRESS_MS;
  }, []);

  const isFilePickerSuppressed = React.useCallback(
    () => Date.now() < pickerSuppressUntilRef.current,
    [],
  );

  const openFilePicker = React.useCallback(() => {
    if (isFilePickerSuppressed()) {
      return;
    }

    const input = fileInputRef.current;
    if (!input) {
      return;
    }

    input.value = '';
    input.click();
  }, [isFilePickerSuppressed]);

  const contextValue = React.useMemo<DropzoneContextValue>(
    () => ({
      dropzoneId,
      listId,
      lang,
      dir,
      text,
      disabled,
      urlCache,
      acceptedFileTypes,
      multiple,
      label: label ?? text.fileUpload,
      name,
      required,
      fileInputRef,
      openFilePicker,
      suppressFilePicker,
      isFilePickerSuppressed,
      onFilesChange: handleFilesChange,
    }),
    [
      dropzoneId,
      listId,
      lang,
      dir,
      text,
      disabled,
      urlCache,
      acceptedFileTypes,
      multiple,
      label,
      name,
      required,
      openFilePicker,
      suppressFilePicker,
      isFilePickerSuppressed,
      handleFilesChange,
    ],
  );

  return (
    <StoreContext.Provider value={store}>
      <DropzoneContext.Provider value={contextValue}>
        <div
          data-slot="dropzone"
          lang={lang}
          dir={dir}
          className={twMerge(rootVariants(), className)}
          {...rootProps}
        >
          {children}
        </div>
      </DropzoneContext.Provider>
    </StoreContext.Provider>
  );
}

export interface DropzoneAreaProps extends Omit<AriaDropZoneProps, 'className' | 'children'> {
  className?: string;
  children?: React.ReactNode | ((props: DropZoneRenderProps) => React.ReactNode);
  /** Show the browse button inside the dropzone. @default true */
  showTrigger?: boolean;
}

function DropzoneAreaContent({
  children,
  state,
  showTrigger,
}: {
  children?: DropzoneAreaProps['children'];
  state: DropZoneRenderProps;
  showTrigger: boolean;
}) {
  const context = useDropzoneContext(DROPZONE_NAME);
  const content = typeof children === 'function' ? children(state) : children;

  if (content) {
    return (
      <>
        {content}
        {showTrigger ? <DropzoneTrigger /> : null}
      </>
    );
  }

  return (
    <>
      <UploadSimple
        size={24}
        aria-hidden
        className={twMerge(
          'text-text-default-muted',
          state.isDropTarget && 'text-text-primary-muted',
        )}
      />
      <Text
        slot="label"
        className={twMerge(
          dropzoneTitleVariants(),
          state.isDropTarget && 'text-text-primary-muted',
        )}
      >
        {state.isDropTarget ? context.text.releaseToUpload : context.text.dragDropFilesHere}
      </Text>
      <span
        className={twMerge(dropzoneHintVariants(), state.isDropTarget && 'text-text-primary-muted')}
      >
        {context.text.orClickToBrowse}
      </span>
      {showTrigger ? <DropzoneTrigger /> : null}
    </>
  );
}

export function DropzoneArea({
  className,
  children,
  showTrigger = true,
  onDrop: onDropProp,
  getDropOperation: getDropOperationProp,
  ...dropzoneProps
}: DropzoneAreaProps) {
  const context = useDropzoneContext(DROPZONE_NAME);
  const {
    fileInputRef,
    disabled,
    label,
    acceptedFileTypes,
    multiple,
    openFilePicker,
    suppressFilePicker,
    onFilesChange,
  } = context;
  const invalid = useStore((state) => state.invalid);

  const setFileInputRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      fileInputRef.current = node;
    },
    [fileInputRef],
  );

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

  const getDropOperation = React.useCallback<NonNullable<AriaDropZoneProps['getDropOperation']>>(
    (types, ...rest) => {
      if (getDropOperationProp) {
        return getDropOperationProp(types, ...rest);
      }

      return getDropOperationForAccept(types, acceptedFileTypes);
    },
    [acceptedFileTypes, getDropOperationProp],
  );

  const onSelect = React.useCallback(
    (files: FileList | null) => {
      suppressFilePicker();
      onFilesChange(Array.from(files ?? []));
    },
    [suppressFilePicker, onFilesChange],
  );

  const onSurfaceClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || isDropzoneTriggerElement(event.target)) {
        return;
      }

      openFilePicker();
    },
    [disabled, openFilePicker],
  );

  const onSurfaceKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled || isDropzoneTriggerElement(event.target)) {
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openFilePicker();
      }
    },
    [disabled, openFilePicker],
  );

  return (
    <>
      <FileTrigger
        ref={setFileInputRef}
        acceptedFileTypes={acceptedFileTypes}
        allowsMultiple={multiple}
        onSelect={onSelect}
      >
        <AriaButton className={srOnlyVariants()} aria-hidden>
          {label}
        </AriaButton>
      </FileTrigger>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        className="w-full"
        onClick={onSurfaceClick}
        onKeyDown={onSurfaceKeyDown}
      >
        <AriaDropZone
          data-slot="dropzone-area"
          aria-label={label}
          isDisabled={disabled}
          data-invalid={invalid ? '' : undefined}
          getDropOperation={getDropOperation}
          onDrop={onDrop}
          className={(state) =>
            twMerge(
              dropzoneVariants({
                isDisabled: state.isDisabled,
                isDragging: state.isDropTarget,
                isInvalid: invalid,
                isFocused: state.isFocusVisible,
              }),
              className,
            )
          }
          {...dropzoneProps}
        >
          {(state) => (
            <DropzoneAreaContent state={state} showTrigger={showTrigger}>
              {children}
            </DropzoneAreaContent>
          )}
        </AriaDropZone>
      </div>
    </>
  );
}

export interface DropzoneTriggerProps extends Omit<ButtonProps, 'iconOnly'> {}

export function DropzoneTrigger({
  className,
  children,
  onPress: onPressProp,
  ...triggerProps
}: DropzoneTriggerProps) {
  const context = useDropzoneContext(TRIGGER_NAME);

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
      isDisabled={context.disabled}
      data-disabled={context.disabled ? '' : undefined}
      className={className}
      onPress={onPress}
      {...triggerProps}
    >
      {children ?? context.text.browseFiles}
    </Button>
  );
}

export interface DropzoneListProps extends React.ComponentProps<'div'> {
  orientation?: 'horizontal' | 'vertical';
  forceMount?: boolean;
}

export function DropzoneList({
  className,
  orientation = 'vertical',
  forceMount,
  children,
  ...listProps
}: DropzoneListProps) {
  const context = useDropzoneContext(LIST_NAME);
  const fileCount = useStore((state) => state.files.size);
  const shouldRender = forceMount || fileCount > 0;

  if (!shouldRender) return null;

  return (
    <div
      data-slot="dropzone-list"
      id={context.listId}
      role="list"
      data-orientation={orientation}
      data-state={fileCount > 0 ? 'active' : 'inactive'}
      className={twMerge(listVariants({ orientation }), className)}
      {...listProps}
    >
      {children}
    </div>
  );
}

interface DropzoneItemContextValue {
  id: string;
  fileState: FileState | undefined;
  nameId: string;
  sizeId: string;
  statusId: string;
  messageId: string;
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
  const messageId = `${id}-message`;

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
      messageId,
    }),
    [id, fileState, statusId, nameId, sizeId, messageId],
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
        role="listitem"
        aria-setsize={fileCount}
        aria-posinset={fileIndex}
        aria-describedby={`${nameId} ${sizeId} ${statusId}`}
        aria-labelledby={nameId}
        className={twMerge(itemVariants(), className)}
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
      if (itemContext.fileState?.file.type.startsWith('image/')) {
        let url = context.urlCache.get(file);
        if (!url) {
          url = URL.createObjectURL(file);
          context.urlCache.set(file, url);
        }

        return <img src={url} alt={file.name} className={previewImageVariants()} />;
      }

      return getFileIcon(file);
    },
    [itemContext.fileState?.file.type, context.urlCache],
  );

  const onPreviewRender = React.useCallback(
    (file: File) => {
      if (render) {
        return render(file, () => getDefaultRender(file));
      }

      return getDefaultRender(file);
    },
    [render, getDefaultRender],
  );

  if (!itemContext.fileState) return null;

  return (
    <div
      data-slot="dropzone-item-preview"
      className={twMerge(previewVariants(), className)}
      {...previewProps}
    >
      {onPreviewRender(itemContext.fileState.file)}
      {children}
    </div>
  );
}

export interface DropzoneItemMetadataProps extends React.ComponentProps<'div'> {
  size?: 'default' | 'sm';
}

export function DropzoneItemMetadata({
  size = 'default',
  children,
  className,
  ...metadataProps
}: DropzoneItemMetadataProps) {
  const itemContext = useDropzoneItemContext(ITEM_METADATA_NAME);

  if (!itemContext.fileState) return null;

  return (
    <div
      data-slot="dropzone-item-metadata"
      className={twMerge(metadataVariants({ size }), className)}
      {...metadataProps}
    >
      {children ?? (
        <>
          <span
            id={itemContext.nameId}
            lang="en"
            dir="auto"
            className={metadataNameVariants({ size })}
          >
            {itemContext.fileState.file.name}
          </span>
          <span id={itemContext.sizeId} lang="en" dir="ltr" className={metadataSizeVariants()}>
            {formatBytes(itemContext.fileState.file.size)}
          </span>
          {itemContext.fileState.error ? (
            <span id={itemContext.messageId} dir="auto" className={metadataErrorVariants()}>
              {itemContext.fileState.error}
            </span>
          ) : null}
        </>
      )}
    </div>
  );
}

export interface DropzoneItemProgressProps extends React.ComponentProps<'div'> {
  variant?: 'linear' | 'circular' | 'fill';
  size?: number;
  forceMount?: boolean;
}

export function DropzoneItemProgress({
  variant = 'linear',
  size = 40,
  forceMount,
  className,
  ...progressProps
}: DropzoneItemProgressProps) {
  const itemContext = useDropzoneItemContext(ITEM_PROGRESS_NAME);
  const context = useDropzoneContext(ITEM_PROGRESS_NAME);

  if (!itemContext.fileState) return null;

  const shouldRender =
    forceMount ||
    itemContext.fileState.status === 'uploading' ||
    (itemContext.fileState.status === 'error' && itemContext.fileState.progress < 100);

  if (!shouldRender) return null;

  switch (variant) {
    case 'circular': {
      const circumference = 2 * Math.PI * ((size - 4) / 2);
      const strokeDashoffset =
        circumference - (itemContext.fileState.progress / 100) * circumference;

      return (
        <div
          data-slot="dropzone-item-progress"
          className={twMerge('relative shrink-0', className)}
          style={{ width: size, height: size }}
          {...progressProps}
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={(size - 4) / 2}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="text-border-default-subtle"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={(size - 4) / 2}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-button-primary-default"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center type-caption-regular text-text-default-default"
            lang="en"
            dir="ltr"
          >
            {itemContext.fileState.progress}%
          </span>
        </div>
      );
    }

    case 'fill': {
      const progressPercentage = itemContext.fileState.progress;
      const topInset = 100 - progressPercentage;

      return (
        <div
          data-slot="dropzone-item-progress"
          className={twMerge(fillProgressVariants(), className)}
          style={{ clipPath: `inset(${topInset}% 0% 0% 0%)` }}
          {...progressProps}
        />
      );
    }

    default:
      return (
        <ProgressBar
          data-slot="dropzone-item-progress"
          aria-label={context.text.uploadProgressFor(itemContext.fileState.file.name)}
          value={itemContext.fileState.progress}
          minValue={0}
          maxValue={100}
          className={twMerge('h-1 min-w-0 basis-full', className)}
          {...progressProps}
        >
          {({ percentage }) => (
            <div className={progressTrackVariants()}>
              <div
                className={progressBarVariants()}
                style={{ inlineSize: `${percentage ?? 0}%` }}
              />
            </div>
          )}
        </ProgressBar>
      );
  }
}

export interface DropzoneItemDeleteProps extends Omit<
  React.ComponentProps<typeof AriaButton>,
  'children' | 'className'
> {
  className?: string;
}

export function DropzoneItemDelete({
  onPress: onPressProp,
  className,
  ...deleteProps
}: DropzoneItemDeleteProps) {
  const store = useStoreContext(ITEM_DELETE_NAME);
  const itemContext = useDropzoneItemContext(ITEM_DELETE_NAME);
  const context = useDropzoneContext(ITEM_DELETE_NAME);

  const onPress = React.useCallback(
    (event: Parameters<NonNullable<React.ComponentProps<typeof AriaButton>['onPress']>>[0]) => {
      onPressProp?.(event);

      if (!itemContext.fileState) return;

      store.dispatch({
        type: 'REMOVE_FILE',
        file: itemContext.fileState.file,
      });
    },
    [store, itemContext.fileState, onPressProp],
  );

  if (!itemContext.fileState) return null;

  return (
    <AriaButton
      type="button"
      data-slot="dropzone-item-delete"
      aria-label={context.text.removeFile(itemContext.fileState.file.name)}
      className={twMerge(deleteButtonVariants(), className)}
      onPress={onPress}
      {...deleteProps}
    >
      <X size={16} aria-hidden />
    </AriaButton>
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
  const store = useStoreContext(CLEAR_NAME);
  const fileCount = useStore((state) => state.files.size);

  const isDisabled = disabled || context.disabled;

  const onPress = React.useCallback(
    (event: Parameters<NonNullable<ButtonProps['onPress']>>[0]) => {
      onPressProp?.(event);
      store.dispatch({ type: 'CLEAR' });
    },
    [store, onPressProp],
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
      data-disabled={isDisabled ? '' : undefined}
      className={className}
      onPress={onPress}
      {...clearProps}
    >
      {children ?? context.text.clearAll}
    </Button>
  );
}

export function useDropzone<T>(selector: (state: StoreState) => T): T {
  return useStore(selector);
}

export type DropzoneSize = 'sm' | 'md' | 'lg';

export interface DropzoneFieldProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
  size?: DropzoneSize;
  isDisabled?: boolean;
  allowsBrowse?: boolean;
  acceptedFileTypes?: string[];
  onSelect?: (files: FileList | null) => void;
  'aria-label'?: string;
}

const dropzoneRootVariants = cva('flex w-full flex-col gap-[6px] font-sans antialiased');

const labelVariants = cva('type-body-sm-regular text-text-default-default');

/** Convenience field wrapper around the Dropzone compound components. */
export function DropzoneField({
  label,
  description,
  errorMessage,
  hint,
  className,
  size = 'md',
  isDisabled = false,
  allowsBrowse = true,
  acceptedFileTypes,
  onSelect,
  'aria-label': ariaLabel,
}: DropzoneFieldProps) {
  const languageConfig = useVeliLanguage();
  const text = dropzoneText[languageConfig.language];
  const [files, setFiles] = React.useState<File[]>([]);

  const dropzoneSizeClass =
    size === 'sm' ? 'min-h-[80px] py-4' : size === 'lg' ? 'min-h-[128px] py-8' : 'min-h-[96px]';

  return (
    <div className={dropzoneRootVariants()}>
      {label ? <Label className={labelVariants()}>{label}</Label> : null}
      <Dropzone
        label={ariaLabel ?? (typeof label === 'string' ? label : text.fileUpload)}
        accept={acceptedFileTypes?.join(',')}
        disabled={isDisabled}
        multiple
        value={files}
        onValueChange={(nextFiles) => {
          setFiles(nextFiles);
          if (onSelect) {
            const dataTransfer = new DataTransfer();
            for (const file of nextFiles) {
              dataTransfer.items.add(file);
            }
            onSelect(dataTransfer.files);
          }
        }}
        className={className}
      >
        <DropzoneArea className={dropzoneSizeClass} showTrigger={allowsBrowse}>
          <UploadSimple size={24} aria-hidden className="text-text-default-muted" />
          <Text slot="label" className={dropzoneTitleVariants()}>
            {text.dragDropFilesHere}
          </Text>
          <span className={dropzoneHintVariants()}>{hint ?? text.orClickToBrowse}</span>
        </DropzoneArea>
        <DropzoneList>
          {files.map((file) => (
            <DropzoneItem key={`${file.name}-${file.lastModified}`} value={file}>
              <DropzoneItemPreview />
              <DropzoneItemMetadata />
              <DropzoneItemDelete />
            </DropzoneItem>
          ))}
        </DropzoneList>
      </Dropzone>
      <StaticFieldMessage description={description} errorMessage={errorMessage} />
    </div>
  );
}
