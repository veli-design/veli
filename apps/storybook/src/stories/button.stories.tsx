import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { useArgs } from 'storybook/internal/preview-api';
import { Button, type ButtonProps } from '@tradenetcorp/veli-ui/button';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { Plus, Trash, DownloadSimple } from 'phosphor-react';
import { DirectionalArrow } from '../utils/directional-arrow';

const iconSizeMap = {
  xl: 20,
  lg: 20,
  md: 16,
  sm: 16,
  xs: 12,
} as const;

const buttonText = {
  en: {
    argsChildren: 'Button',
    primaryButton: 'Primary Button',
    label: 'Label',
    start: 'Start',
    leadingIcon: 'Leading Icon',
    trailingIcon: 'Trailing Icon',
    bothIcons: 'Both Icons',
    extraLargeButton: 'XL Button',
    largeButton: 'LG Button',
    mediumButton: 'MD Button',
    smallButton: 'SM Button',
    extraSmallButton: 'XS Button',
    savingChanges: 'Saving changes...',
    disabledAction: 'Disabled Action',
  },
  dv: {
    argsChildren: 'ބަޓަން',
    primaryButton: 'މައިގަނޑު ބަޓަން',
    label: 'ލޭބަލް',
    start: 'ފަށާ',
    leadingIcon: 'ކުރީގައި އައިކަން',
    trailingIcon: 'ފަހަތުގައި އައިކަން',
    bothIcons: 'ދެކޮޅުގައި އައިކަން',
    extraLargeButton: 'ވަރަށް ބޮޑު ބަޓަން',
    largeButton: 'ބޮޑު ބަޓަން',
    mediumButton: 'މެދު ބަޓަން',
    smallButton: 'ކުޑަ ބަޓަން',
    extraSmallButton: 'ވަރަށް ކުޑަ ބަޓަން',
    savingChanges: '...ބަދަލުތައް ސޭވްކުރަނީ',
    disabledAction: 'ބޭނުންނުކުރެވޭ އެކްޝަން',
  },
} as const;

const localizedButtonTextValues = Object.values(buttonText).flatMap((text) =>
  Object.values(text),
) as readonly string[];

const buttonTextKeys = Object.keys(buttonText.en) as Array<keyof typeof buttonText.en>;

const useButtonText = () => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? buttonText.dv : buttonText.en;
};

function getLocalizedButtonText(value: string, language: keyof typeof buttonText) {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return buttonText[language].argsChildren;
  }

  const localizedKey = buttonTextKeys.find(
    (key) => buttonText.en[key] === value || buttonText.dv[key] === value,
  );

  if (!localizedKey) {
    return value;
  }

  return buttonText[language][localizedKey];
}

function resolveButtonText(children: React.ReactNode, fallback: string) {
  if (typeof children !== 'string') {
    return children ?? fallback;
  }

  const childText = children.trim();

  if (childText.length === 0) {
    return fallback;
  }

  if (localizedButtonTextValues.includes(childText) && childText !== fallback) {
    return fallback;
  }

  return children;
}

function ButtonLabel({ size = 'md' }: { size?: keyof typeof iconSizeMap }) {
  const iconSize = iconSizeMap[size];
  const text = useButtonText();

  return (
    <>
      <Plus size={iconSize} weight="bold" />
      <span>{text.label}</span>
      <DirectionalArrow size={iconSize} weight="bold" />
    </>
  );
}

const seaglassColorExamples = [
  {
    name: 'Primary blue',
    buttonClassName: 'bg-[#0066FF] hover:bg-[#0066FF] active:bg-[#0052CC]',
    swatchClassName: 'bg-[#0066FF]',
  },
  {
    name: 'Blue 800',
    buttonClassName: 'bg-[#1B54DF] hover:bg-[#1B54DF] active:bg-[#123EAE]',
    swatchClassName: 'bg-[#1B54DF]',
  },
  {
    name: 'Green 800',
    buttonClassName: 'bg-[#156F3F] hover:bg-[#156F3F] active:bg-[#0F5130]',
    swatchClassName: 'bg-[#156F3F]',
  },
  {
    name: 'Orange 800',
    buttonClassName: 'bg-[#915000] hover:bg-[#915000] active:bg-[#6A3A00]',
    swatchClassName: 'bg-[#915000]',
  },
  {
    name: 'Red 800',
    buttonClassName: 'bg-[#C01800] hover:bg-[#C01800] active:bg-[#921200]',
    swatchClassName: 'bg-[#C01800]',
  },
  {
    name: 'Gray 1100',
    buttonClassName: 'bg-[#20252B] hover:bg-[#20252B] active:bg-[#14181D]',
    swatchClassName: 'bg-[#20252B]',
  },
] as const;

const seaglassWorkbenchDefaults = {
  radiusX: 320,
  radiusY: 362,
  fillAlpha1: 0,
  fillStop1: 8,
  fillAlpha2: 0.0625,
  fillStop2: 13.75,
  fillAlpha3: 0.125,
  fillStop3: 19.5,
  fillAlpha4: 0.25,
  fillStop4: 31,
  fillAlpha5: 0.5,
  fillStop5: 54,
  fillAlpha6: 0,
  fillStop6: 100,
  activeRadiusX: 320,
  activeRadiusY: 362,
  activeAlpha1: 0,
  activeStop1: 6,
  activeAlpha2: 0.08,
  activeStop2: 14,
  activeAlpha3: 0.18,
  activeStop3: 28,
  activeAlpha4: 0.32,
  activeStop4: 46,
  activeAlpha5: 0.48,
  activeStop5: 68,
  activeAlpha6: 0.64,
  activeStop6: 100,
  activeOverlayOpacity: 1,
  afterDuration: 200,
  activeDuration: 80,
};

type SeaglassWorkbenchValues = typeof seaglassWorkbenchDefaults;
type SeaglassWorkbenchKey = keyof SeaglassWorkbenchValues;
type SeaglassWorkbenchStyle = React.CSSProperties & Record<`--button-${string}`, string | number>;

type SeaglassPreviewValues = {
  label: string;
  baseColor: string;
  hoverColor: string;
  activeColor: string;
  textColor: string;
  canvasColor: string;
  buttonWidth: number;
  showSamples: boolean;
};

type SeaglassWorkbenchExport = {
  preview: SeaglassPreviewValues;
  baseOverlay: {
    stopCount: number;
    radiusX: string;
    radiusY: string;
    stops: Array<{ alpha: number; stop: string }>;
  };
  activeOverlay: {
    stopCount: number;
    radiusX: string;
    radiusY: string;
    opacity: number;
    idleFade: string;
    pressFade: string;
    stops: Array<{ alpha: number; stop: string }>;
  };
  cssVariables: SeaglassWorkbenchStyle;
};

type SeaglassStopConfig = {
  alphaKey: SeaglassWorkbenchKey;
  stopKey: SeaglassWorkbenchKey;
};

type SeaglassWorkbenchLayer = 'hover' | 'press';

const seaglassPreviewDefaults: SeaglassPreviewValues = {
  label: 'Start',
  baseColor: '#0066FF',
  hoverColor: '#0066FF',
  activeColor: '#0052CC',
  textColor: '#FFFFFF',
  canvasColor: '#F8FAFC',
  buttonWidth: 180,
  showSamples: true,
};

const seaglassPreviewPresets = [
  {
    name: 'Primary blue',
    baseColor: '#0066FF',
    hoverColor: '#0066FF',
    activeColor: '#0052CC',
    textColor: '#FFFFFF',
  },
  {
    name: 'Blue 800',
    baseColor: '#1B54DF',
    hoverColor: '#1B54DF',
    activeColor: '#123EAE',
    textColor: '#FFFFFF',
  },
  {
    name: 'Green 800',
    baseColor: '#156F3F',
    hoverColor: '#156F3F',
    activeColor: '#0F5130',
    textColor: '#FFFFFF',
  },
  {
    name: 'Orange 800',
    baseColor: '#915000',
    hoverColor: '#915000',
    activeColor: '#6A3A00',
    textColor: '#FFFFFF',
  },
  {
    name: 'Red 800',
    baseColor: '#C01800',
    hoverColor: '#C01800',
    activeColor: '#921200',
    textColor: '#FFFFFF',
  },
  {
    name: 'Gray 1100',
    baseColor: '#20252B',
    hoverColor: '#20252B',
    activeColor: '#14181D',
    textColor: '#FFFFFF',
  },
] as const;

const baseOverlayStops = [
  { alphaKey: 'fillAlpha1', stopKey: 'fillStop1' },
  { alphaKey: 'fillAlpha2', stopKey: 'fillStop2' },
  { alphaKey: 'fillAlpha3', stopKey: 'fillStop3' },
  { alphaKey: 'fillAlpha4', stopKey: 'fillStop4' },
  { alphaKey: 'fillAlpha5', stopKey: 'fillStop5' },
  { alphaKey: 'fillAlpha6', stopKey: 'fillStop6' },
] as const satisfies ReadonlyArray<{
  alphaKey: SeaglassWorkbenchKey;
  stopKey: SeaglassWorkbenchKey;
}>;

const activeOverlayStops = [
  { alphaKey: 'activeAlpha1', stopKey: 'activeStop1' },
  { alphaKey: 'activeAlpha2', stopKey: 'activeStop2' },
  { alphaKey: 'activeAlpha3', stopKey: 'activeStop3' },
  { alphaKey: 'activeAlpha4', stopKey: 'activeStop4' },
  { alphaKey: 'activeAlpha5', stopKey: 'activeStop5' },
  { alphaKey: 'activeAlpha6', stopKey: 'activeStop6' },
] as const satisfies ReadonlyArray<{
  alphaKey: SeaglassWorkbenchKey;
  stopKey: SeaglassWorkbenchKey;
}>;

const minimumGradientStops = 2;

const timingControls = [
  {
    label: 'Active opacity',
    valueKey: 'activeOverlayOpacity',
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    label: 'Idle fade',
    valueKey: 'afterDuration',
    min: 0,
    max: 800,
    step: 10,
    suffix: 'ms',
  },
  {
    label: 'Press fade',
    valueKey: 'activeDuration',
    min: 0,
    max: 400,
    step: 10,
    suffix: 'ms',
  },
] as const satisfies ReadonlyArray<{
  label: string;
  valueKey: SeaglassWorkbenchKey;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}>;

function formatWorkbenchValue(value: number, step: number) {
  const stepText = String(step);
  const decimalPrecision = stepText.includes('.') ? (stepText.split('.')[1]?.length ?? 0) : 0;
  const precision = Math.min(Math.max(decimalPrecision, 0), 4);

  return Number(value.toFixed(precision));
}

function safeColorValue(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000';
}

function clampWorkbenchValue(value: number, min: number, max: number, step: number) {
  return formatWorkbenchValue(Math.min(Math.max(value, min), max), step);
}

function seaglassStopsToGradient(
  stops: ReadonlyArray<SeaglassStopConfig>,
  values: SeaglassWorkbenchValues,
) {
  const sortedStops = [...stops].sort((a, b) => values[a.stopKey] - values[b.stopKey]);

  return `linear-gradient(90deg, ${sortedStops
    .map((stop) => `rgba(255,255,255,${values[stop.alphaKey]}) ${values[stop.stopKey]}%`)
    .join(', ')})`;
}

function seaglassStopsToRadialGradient(
  stops: ReadonlyArray<SeaglassStopConfig>,
  values: SeaglassWorkbenchValues,
  radiusXKey: SeaglassWorkbenchKey,
  radiusYKey: SeaglassWorkbenchKey,
) {
  const sortedStops = [...stops].sort((a, b) => values[a.stopKey] - values[b.stopKey]);

  return `radial-gradient(ellipse ${values[radiusXKey]}px ${values[radiusYKey]}px at 50% 50%, ${sortedStops
    .map((stop) => `rgba(255,255,255,${values[stop.alphaKey]}) ${values[stop.stopKey]}%`)
    .join(', ')})`;
}

function alphaToPercentValue(alpha: number) {
  return formatWorkbenchValue(alpha * 100, 0.01);
}

function percentToAlphaValue(percent: number) {
  return clampWorkbenchValue(percent / 100, 0, 1, 0.0001);
}

function draftValueFromNumber(value: number, step: number) {
  return String(formatWorkbenchValue(value, step));
}

function visibleStops(stops: ReadonlyArray<SeaglassStopConfig>, stopCount: number) {
  return stops.slice(0, Math.min(Math.max(minimumGradientStops, stopCount), stops.length));
}

function stopValue(
  stops: ReadonlyArray<SeaglassStopConfig>,
  values: SeaglassWorkbenchValues,
  stopCount: number,
  index: number,
) {
  const visibleStopCount = Math.min(Math.max(minimumGradientStops, stopCount), stops.length);
  const sourceStop = stops[Math.min(index, visibleStopCount - 1)];

  return {
    alpha: values[sourceStop.alphaKey],
    stop: values[sourceStop.stopKey],
  };
}

function collapseDeletedStop(
  values: SeaglassWorkbenchValues,
  stops: ReadonlyArray<SeaglassStopConfig>,
  stopCount: number,
  deletedIndex: number,
): SeaglassWorkbenchValues {
  if (stopCount <= minimumGradientStops) {
    return values;
  }

  const nextValues = { ...values };

  for (let index = deletedIndex; index < stopCount - 1; index += 1) {
    nextValues[stops[index].alphaKey] = values[stops[index + 1].alphaKey];
    nextValues[stops[index].stopKey] = values[stops[index + 1].stopKey];
  }

  const lastVisibleStop = stops[stopCount - 2];

  for (let index = stopCount - 1; index < stops.length; index += 1) {
    nextValues[stops[index].alphaKey] = nextValues[lastVisibleStop.alphaKey];
    nextValues[stops[index].stopKey] = nextValues[lastVisibleStop.stopKey];
  }

  return nextValues;
}

function insertGradientStop(
  values: SeaglassWorkbenchValues,
  stops: ReadonlyArray<SeaglassStopConfig>,
  stopCount: number,
  insertIndex: number,
): SeaglassWorkbenchValues {
  if (stopCount >= stops.length) {
    return values;
  }

  const clampedInsertIndex = Math.min(Math.max(insertIndex, 1), stopCount);
  const nextValues = { ...values };

  for (let index = stopCount; index > clampedInsertIndex; index -= 1) {
    nextValues[stops[index].alphaKey] = values[stops[index - 1].alphaKey];
    nextValues[stops[index].stopKey] = values[stops[index - 1].stopKey];
  }

  const previousStop = stops[clampedInsertIndex - 1];
  const nextStop = stops[clampedInsertIndex];
  const previousAlpha = values[previousStop.alphaKey];
  const previousPosition = values[previousStop.stopKey];
  const nextAlpha = clampedInsertIndex < stopCount ? values[nextStop.alphaKey] : previousAlpha;
  const nextPosition = clampedInsertIndex < stopCount ? values[nextStop.stopKey] : 100;

  nextValues[stops[clampedInsertIndex].alphaKey] = clampWorkbenchValue(
    (previousAlpha + nextAlpha) / 2,
    0,
    1,
    0.0001,
  );
  nextValues[stops[clampedInsertIndex].stopKey] = clampWorkbenchValue(
    (previousPosition + nextPosition) / 2,
    0,
    100,
    0.1,
  );

  return nextValues;
}

function SeaglassDirectNumberField({
  label,
  value,
  min,
  max,
  step,
  suffix = '',
  description,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  description?: string;
  onChange: (value: number) => void;
}) {
  const inputId = React.useId();
  const sliderId = React.useId();
  const [draftValue, setDraftValue] = React.useState(() => draftValueFromNumber(value, step));
  const [isEditing, setIsEditing] = React.useState(false);
  const clampedValue = clampWorkbenchValue(value, min, max, step);

  React.useEffect(() => {
    if (!isEditing) {
      setDraftValue(draftValueFromNumber(value, step));
    }
  }, [isEditing, step, value]);

  const commitDraft = () => {
    const parsedValue = Number(draftValue);

    if (Number.isFinite(parsedValue)) {
      const nextValue = clampWorkbenchValue(parsedValue, min, max, step);
      onChange(nextValue);
      setDraftValue(draftValueFromNumber(nextValue, step));
    } else {
      setDraftValue(draftValueFromNumber(clampedValue, step));
    }

    setIsEditing(false);
  };

  const updateValue = (nextValue: number) => {
    const clampedNextValue = clampWorkbenchValue(nextValue, min, max, step);
    onChange(clampedNextValue);
    setDraftValue(draftValueFromNumber(clampedNextValue, step));
  };

  return (
    <div className="grid gap-2 text-xs font-medium text-gray-700">
      <div className="flex items-start justify-between gap-3">
        <label className="leading-5" htmlFor={sliderId}>
          {label}
        </label>
        {description ? (
          <span className="max-w-[190px] text-right text-[11px] font-normal leading-4 text-gray-700">
            {description}
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_104px] items-center gap-3">
        <input
          id={sliderId}
          aria-label={`${label} slider`}
          className="h-2 min-w-0 cursor-pointer accent-blue-600"
          max={max}
          min={min}
          step={step}
          type="range"
          value={clampedValue}
          onChange={(event) => updateValue(Number(event.target.value))}
        />
        <div className="flex min-w-0 items-center overflow-hidden rounded-md border border-gray-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
          <input
            id={inputId}
            aria-label={`${label} value`}
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-right font-mono text-xs text-gray-800 outline-none"
            max={max}
            min={min}
            step={step}
            type="number"
            value={draftValue}
            onBlur={commitDraft}
            onChange={(event) => {
              setIsEditing(true);
              setDraftValue(event.target.value);
            }}
            onFocus={() => setIsEditing(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                commitDraft();
              }

              if (event.key === 'Escape') {
                event.preventDefault();
                setDraftValue(draftValueFromNumber(value, step));
                setIsEditing(false);
                event.currentTarget.blur();
              }
            }}
          />
          {suffix ? (
            <span className="pr-2 text-[10px] font-semibold text-gray-700">{suffix}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SeaglassColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputId = React.useId();

  return (
    <label className="grid gap-1 text-xs font-medium text-gray-700" htmlFor={inputId}>
      <span>{label}</span>
      <div className="grid grid-cols-[40px_1fr] overflow-hidden rounded-md border border-gray-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        <input
          aria-label={`${label} color picker`}
          className="h-9 w-10 cursor-pointer border-0 bg-transparent p-1"
          type="color"
          value={safeColorValue(value)}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
        />
        <input
          id={inputId}
          className="min-w-0 bg-transparent px-2 font-mono text-xs text-gray-800 outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={(event) => {
            const normalized = event.target.value.trim();
            if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
              onChange(normalized.toUpperCase());
            }
          }}
        />
      </div>
    </label>
  );
}

function SeaglassWorkbenchPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-950">{title}</h3>
      {description ? <p className="mt-1 text-xs text-gray-700">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SeaglassStopEditor({
  title,
  description,
  radiusControls,
  stops,
  values,
  setValues,
  previewColor,
  maxStopCount,
  onAddStop,
  onDeleteStop,
}: {
  title: string;
  description: string;
  radiusControls: readonly [
    {
      label: string;
      valueKey: SeaglassWorkbenchKey;
    },
    {
      label: string;
      valueKey: SeaglassWorkbenchKey;
    },
  ];
  stops: ReadonlyArray<SeaglassStopConfig>;
  values: SeaglassWorkbenchValues;
  setValues: React.Dispatch<React.SetStateAction<SeaglassWorkbenchValues>>;
  previewColor: string;
  maxStopCount: number;
  onAddStop: (index: number) => void;
  onDeleteStop: (index: number) => void;
}) {
  const railRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const selectedStop = stops[Math.min(selectedIndex, stops.length - 1)];
  const selectedAlpha = values[selectedStop.alphaKey];
  const selectedPosition = values[selectedStop.stopKey];
  const selectedAlphaPercent = alphaToPercentValue(selectedAlpha);
  const [radiusXControl, radiusYControl] = radiusControls;
  const previewBaseColor = safeColorValue(previewColor);
  const previewGradient = seaglassStopsToGradient(stops, values);
  const radialPreviewGradient = seaglassStopsToRadialGradient(
    stops,
    values,
    radiusXControl.valueKey,
    radiusYControl.valueKey,
  );
  const canAddStop = stops.length < maxStopCount;
  const canDeleteStop = stops.length > minimumGradientStops;

  React.useEffect(() => {
    setSelectedIndex((currentIndex) => Math.min(currentIndex, stops.length - 1));
  }, [stops.length]);

  const updateValue = (valueKey: SeaglassWorkbenchKey, nextValue: number) => {
    setValues((current) => ({
      ...current,
      [valueKey]: nextValue,
    }));
  };

  const updateSelectedAlpha = (alphaPercent: number) => {
    updateValue(selectedStop.alphaKey, percentToAlphaValue(alphaPercent));
  };

  const updateSelectedPosition = (position: number) => {
    updateValue(selectedStop.stopKey, clampWorkbenchValue(position, 0, 100, 0.1));
  };

  const updateStopPosition = (stop: SeaglassStopConfig, position: number) => {
    updateValue(stop.stopKey, clampWorkbenchValue(position, 0, 100, 0.1));
  };

  const positionFromPointer = (clientX: number) => {
    const rail = railRef.current;

    if (!rail) {
      return selectedPosition;
    }

    const rect = rail.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  };

  const beginHandleDrag = (index: number, event: React.PointerEvent<HTMLButtonElement>) => {
    const stop = stops[index];

    setSelectedIndex(index);
    updateStopPosition(stop, positionFromPointer(event.clientX));

    const handlePointerMove = (pointerEvent: PointerEvent) => {
      updateStopPosition(stop, positionFromPointer(pointerEvent.clientX));
    };

    const stopDragging = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointercancel', stopDragging);
    window.addEventListener('pointerup', stopDragging, { once: true });
  };

  const addStopAfterSelection = () => {
    if (!canAddStop) {
      return;
    }

    const nextSelectedIndex = Math.min(selectedIndex + 1, stops.length);
    onAddStop(nextSelectedIndex);
    setSelectedIndex(nextSelectedIndex);
  };

  const deleteSelectedStop = () => {
    if (!canDeleteStop) {
      return;
    }

    const nextSelectedIndex = Math.max(0, Math.min(selectedIndex - 1, stops.length - 2));
    onDeleteStop(selectedIndex);
    setSelectedIndex(nextSelectedIndex);
  };

  const handleStopKeyDown = (
    index: number,
    stop: SeaglassStopConfig,
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    event.preventDefault();
    setSelectedIndex(index);

    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const keyboardStep = event.shiftKey ? 5 : 1;
    updateStopPosition(stop, values[stop.stopKey] + direction * keyboardStep);
  };

  return (
    <SeaglassWorkbenchPanel title={title} description={description}>
      <div className="grid gap-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-gray-800">Radial overlay</div>
                <p className="mt-1 text-[11px] text-gray-700">
                  {stops.length}-stop gradient, matching the current button CSS slots.
                </p>
              </div>
              <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-gray-700">
                Radial
              </span>
            </div>
            <div
              className="relative mt-3 h-24 overflow-hidden rounded-md border border-gray-200"
              style={{ backgroundColor: previewBaseColor }}
            >
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{ backgroundImage: radialPreviewGradient }}
              />
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 bg-gray-950/40 shadow"
              />
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div>
              <div className="text-xs font-semibold text-gray-800">Size</div>
              <p className="mt-1 text-[11px] text-gray-700">
                Width and height set the reach of the white bloom.
              </p>
            </div>
            {radiusControls.map((control) => (
              <SeaglassDirectNumberField
                key={control.valueKey}
                label={control.label}
                value={values[control.valueKey]}
                min={120}
                max={900}
                step={1}
                suffix="px"
                onChange={(value) => updateValue(control.valueKey, value)}
              />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-gray-800">Stops</div>
              <p className="mt-1 text-[11px] text-gray-700">
                Drag a handle to set location, then edit the selected stop below.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-gray-700">
                {stops.length}/{maxStopCount} stops
              </span>
              <button
                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400"
                disabled={!canAddStop}
                type="button"
                onClick={addStopAfterSelection}
              >
                Add stop
              </button>
            </div>
          </div>
          <div
            ref={railRef}
            className="relative h-12 rounded-md border border-gray-200 shadow-inner"
            style={{
              backgroundColor: previewBaseColor,
              backgroundImage: `${previewGradient}, linear-gradient(90deg,${previewBaseColor},${previewBaseColor})`,
            }}
            onPointerDown={(event) => {
              updateSelectedPosition(positionFromPointer(event.clientX));
            }}
          >
            {stops.map((stop, index) => {
              const isSelected = index === selectedIndex;

              return (
                <button
                  aria-label={`Select stop ${index + 1}`}
                  className={[
                    'absolute top-1/2 h-6 w-4 -translate-x-1/2 -translate-y-1/2 rounded-[4px] border shadow-sm transition',
                    isSelected
                      ? 'border-blue-600 ring-4 ring-blue-100'
                      : 'border-white hover:border-blue-300',
                  ].join(' ')}
                  key={stop.alphaKey}
                  style={{
                    left: `${values[stop.stopKey]}%`,
                    backgroundColor: `rgba(255,255,255,${Math.max(values[stop.alphaKey], 0.12)})`,
                  }}
                  type="button"
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    beginHandleDrag(index, event);
                  }}
                  onClick={() => setSelectedIndex(index)}
                  onKeyDown={(event) => handleStopKeyDown(index, stop, event)}
                />
              );
            })}
          </div>

          <div className="mt-4 grid gap-2">
            {stops.map((stop, index) => {
              const isSelected = index === selectedIndex;

              return (
                <button
                  className={[
                    'grid grid-cols-[24px_minmax(0,1fr)_72px_72px] items-center gap-3 rounded-md border px-3 py-2 text-left text-xs',
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                  ].join(' ')}
                  key={stop.alphaKey}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  onKeyDown={(event) => handleStopKeyDown(index, stop, event)}
                >
                  <span
                    aria-hidden="true"
                    className="h-5 w-5 rounded border border-gray-200"
                    style={{
                      backgroundColor: previewBaseColor,
                      backgroundImage: `linear-gradient(rgba(255,255,255,${values[stop.alphaKey]}),rgba(255,255,255,${values[stop.alphaKey]}))`,
                    }}
                  />
                  <span className="font-semibold">Stop {index + 1}</span>
                  <span className="font-mono">{alphaToPercentValue(values[stop.alphaKey])}%</span>
                  <span className="font-mono">{values[stop.stopKey]}%</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-gray-700">
            Tip: selected stops also move with Left/Right. Hold Shift for a larger jump.
          </p>
        </div>

        <div className="grid gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3 lg:grid-cols-[minmax(180px,1fr)_minmax(220px,1fr)_minmax(220px,1fr)_auto]">
          <div>
            <div className="text-xs font-semibold text-blue-950">
              Selected stop {selectedIndex + 1}
            </div>
            <p className="mt-1 text-xs text-blue-700">
              Opacity is the strength of the white overlay at this point in the radial curve.
            </p>
          </div>
          <SeaglassDirectNumberField
            label="Opacity"
            value={selectedAlphaPercent}
            min={0}
            max={100}
            step={0.25}
            suffix="%"
            onChange={updateSelectedAlpha}
          />
          <SeaglassDirectNumberField
            label="Location"
            value={selectedPosition}
            min={0}
            max={100}
            step={0.1}
            suffix="%"
            onChange={updateSelectedPosition}
          />
          <div className="grid content-end">
            <button
              className="rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:hover:bg-gray-50"
              disabled={!canDeleteStop}
              type="button"
              onClick={deleteSelectedStop}
            >
              Delete stop
            </button>
          </div>
        </div>
      </div>
    </SeaglassWorkbenchPanel>
  );
}

function SeaglassExportPanel({
  exportJson,
  onCopy,
  copied,
}: {
  exportJson: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <SeaglassWorkbenchPanel title="Export">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-gray-700">
          Copy this JSON and feed it back to Codex when you are ready to apply the final values.
        </p>
        <button
          className="shrink-0 rounded-md bg-gray-950 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800"
          type="button"
          onClick={onCopy}
        >
          {copied ? 'Copied' : 'Copy JSON'}
        </button>
      </div>
      <textarea
        className="mt-3 h-64 w-full resize-y rounded-md border border-gray-200 bg-gray-950 p-3 font-mono text-[11px] leading-5 text-gray-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        readOnly
        value={exportJson}
      />
    </SeaglassWorkbenchPanel>
  );
}

function seaglassWorkbenchStyle(
  values: SeaglassWorkbenchValues,
  baseStopCount: number,
  activeStopCount: number,
): SeaglassWorkbenchStyle {
  const style: SeaglassWorkbenchStyle = {
    '--button-seaglass-overlay-radius-x': `${values.radiusX}px`,
    '--button-seaglass-overlay-radius-y': `${values.radiusY}px`,
    '--button-seaglass-active-radius-x': `${values.activeRadiusX}px`,
    '--button-seaglass-active-radius-y': `${values.activeRadiusY}px`,
    '--button-seaglass-active-overlay-opacity': values.activeOverlayOpacity,
    '--button-seaglass-after-duration': `${values.afterDuration}ms`,
    '--button-seaglass-active-duration': `${values.activeDuration}ms`,
  };

  baseOverlayStops.forEach((stop, index) => {
    const value = stopValue(baseOverlayStops, values, baseStopCount, index);
    style[`--button-seaglass-fill-alpha-${index + 1}`] = value.alpha;
    style[`--button-seaglass-fill-stop-${index + 1}`] = `${value.stop}%`;
  });

  activeOverlayStops.forEach((stop, index) => {
    const value = stopValue(activeOverlayStops, values, activeStopCount, index);
    style[`--button-seaglass-active-alpha-${index + 1}`] = value.alpha;
    style[`--button-seaglass-active-stop-${index + 1}`] = `${value.stop}%`;
  });

  return style;
}

function createSeaglassWorkbenchExport(
  values: SeaglassWorkbenchValues,
  preview: SeaglassPreviewValues,
  baseStopCount: number,
  activeStopCount: number,
): SeaglassWorkbenchExport {
  const cssVariables = seaglassWorkbenchStyle(values, baseStopCount, activeStopCount);

  return {
    preview,
    baseOverlay: {
      stopCount: baseStopCount,
      radiusX: `${values.radiusX}px`,
      radiusY: `${values.radiusY}px`,
      stops: visibleStops(baseOverlayStops, baseStopCount).map((stop) => ({
        alpha: values[stop.alphaKey],
        stop: `${values[stop.stopKey]}%`,
      })),
    },
    activeOverlay: {
      stopCount: activeStopCount,
      radiusX: `${values.activeRadiusX}px`,
      radiusY: `${values.activeRadiusY}px`,
      opacity: values.activeOverlayOpacity,
      idleFade: `${values.afterDuration}ms`,
      pressFade: `${values.activeDuration}ms`,
      stops: visibleStops(activeOverlayStops, activeStopCount).map((stop) => ({
        alpha: values[stop.alphaKey],
        stop: `${values[stop.stopKey]}%`,
      })),
    },
    cssVariables,
  };
}

function SeaglassGradientWorkbench() {
  const text = useButtonText();
  const [values, setValues] = React.useState(seaglassWorkbenchDefaults);
  const [preview, setPreview] = React.useState(() => ({
    ...seaglassPreviewDefaults,
    label: text.start,
  }));
  const [baseStopCount, setBaseStopCount] = React.useState<number>(baseOverlayStops.length);
  const [activeStopCount, setActiveStopCount] = React.useState<number>(activeOverlayStops.length);
  const [selectedLayer, setSelectedLayer] = React.useState<SeaglassWorkbenchLayer>('hover');
  const [copied, setCopied] = React.useState(false);
  const previewStyle = seaglassWorkbenchStyle(values, baseStopCount, activeStopCount);
  const exportPayload = React.useMemo(
    () => createSeaglassWorkbenchExport(values, preview, baseStopCount, activeStopCount),
    [activeStopCount, baseStopCount, values, preview],
  );
  const exportJson = React.useMemo(() => JSON.stringify(exportPayload, null, 2), [exportPayload]);
  const visibleBaseOverlayStops = React.useMemo(
    () => visibleStops(baseOverlayStops, baseStopCount),
    [baseStopCount],
  );
  const visibleActiveOverlayStops = React.useMemo(
    () => visibleStops(activeOverlayStops, activeStopCount),
    [activeStopCount],
  );

  React.useEffect(() => {
    setPreview((current) =>
      current.label === buttonText.en.start || current.label === buttonText.dv.start
        ? { ...current, label: text.start }
        : current,
    );
  }, [text.start]);

  const updateWorkbenchValues: React.Dispatch<React.SetStateAction<SeaglassWorkbenchValues>> = (
    nextValues,
  ) => {
    setValues(nextValues);
    setCopied(false);
  };

  const updatePreview = <Key extends keyof SeaglassPreviewValues>(
    key: Key,
    value: SeaglassPreviewValues[Key],
  ) => {
    setPreview((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const applyPreset = (preset: (typeof seaglassPreviewPresets)[number]) => {
    setPreview((current) => ({
      ...current,
      baseColor: preset.baseColor,
      hoverColor: preset.hoverColor,
      activeColor: preset.activeColor,
      textColor: preset.textColor,
    }));
  };

  const resetAll = () => {
    setValues(seaglassWorkbenchDefaults);
    setPreview({ ...seaglassPreviewDefaults, label: text.start });
    setBaseStopCount(baseOverlayStops.length);
    setActiveStopCount(activeOverlayStops.length);
    setSelectedLayer('hover');
    setCopied(false);
  };

  const updateWorkbenchNumber = (valueKey: SeaglassWorkbenchKey, value: number) => {
    updateWorkbenchValues((current) => ({
      ...current,
      [valueKey]: value,
    }));
  };

  const addBaseStop = (index: number) => {
    if (baseStopCount >= baseOverlayStops.length) {
      return;
    }

    updateWorkbenchValues((current) =>
      insertGradientStop(current, baseOverlayStops, baseStopCount, index),
    );
    setBaseStopCount((current) => Math.min(baseOverlayStops.length, current + 1));
  };

  const deleteBaseStop = (index: number) => {
    if (baseStopCount <= minimumGradientStops) {
      return;
    }

    updateWorkbenchValues((current) =>
      collapseDeletedStop(current, baseOverlayStops, baseStopCount, index),
    );
    setBaseStopCount((current) => Math.max(minimumGradientStops, current - 1));
  };

  const addActiveStop = (index: number) => {
    if (activeStopCount >= activeOverlayStops.length) {
      return;
    }

    updateWorkbenchValues((current) =>
      insertGradientStop(current, activeOverlayStops, activeStopCount, index),
    );
    setActiveStopCount((current) => Math.min(activeOverlayStops.length, current + 1));
  };

  const deleteActiveStop = (index: number) => {
    if (activeStopCount <= minimumGradientStops) {
      return;
    }

    updateWorkbenchValues((current) =>
      collapseDeletedStop(current, activeOverlayStops, activeStopCount, index),
    );
    setActiveStopCount((current) => Math.max(minimumGradientStops, current - 1));
  };

  const copyExport = () => {
    void navigator.clipboard?.writeText(exportJson);
    setCopied(true);
  };

  const previewClassName = 'seaglass-workbench-preview-button';
  const selectedLayerCopy =
    selectedLayer === 'hover'
      ? 'The hover overlay is always present on seaglass fill buttons and follows the pointer.'
      : 'The press overlay fades in while pressed. Keep it quiet so the click feels inset, not flashy.';

  return (
    <div className="min-h-screen bg-gray-50 p-2 text-gray-950">
      <style>
        {`
          .${previewClassName} {
            width: ${preview.buttonWidth}px !important;
            background-color: ${preview.baseColor} !important;
            color: ${preview.textColor} !important;
          }
          .${previewClassName}:hover {
            background-color: ${preview.hoverColor} !important;
          }
          .${previewClassName}:active {
            background-color: ${preview.activeColor} !important;
          }
        `}
      </style>
      <div className="grid max-w-[1440px] gap-6 xl:grid-cols-[minmax(460px,0.85fr)_minmax(560px,1fr)]">
        <div className="h-fit overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm xl:sticky xl:top-4">
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold">Seaglass workbench</h2>
              <p className="text-xs text-gray-700">
                Tune the moving radial overlay on real buttons.
              </p>
            </div>
            <button
              className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              type="button"
              onClick={resetAll}
            >
              Reset all
            </button>
          </div>

          <div
            className="flex min-h-[260px] flex-col justify-center gap-6 p-6"
            style={{ backgroundColor: preview.canvasColor }}
          >
            <div className="flex flex-wrap items-center gap-4" style={previewStyle}>
              <Button
                variant="primary"
                style="fill"
                size="xl"
                treatment="seaglass"
                className={`${previewClassName} justify-center`}
              >
                {preview.label}
              </Button>
              <Button
                variant="primary"
                style="fill"
                size="md"
                treatment="seaglass"
                className={`${previewClassName} justify-center`}
              >
                {preview.label}
              </Button>
            </div>

            {preview.showSamples ? (
              <div className="flex flex-wrap items-center gap-3" style={previewStyle}>
                {seaglassColorExamples.map((color) => (
                  <Button
                    key={color.name}
                    variant="primary"
                    style="fill"
                    size="lg"
                    treatment="seaglass"
                    className={`min-w-[150px] ${color.buttonClassName}`}
                  >
                    {color.name}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 border-t border-gray-200 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-medium text-gray-700">
                Label
                <input
                  className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={preview.label}
                  onChange={(event) => updatePreview('label', event.target.value)}
                />
              </label>
              <SeaglassDirectNumberField
                label="Button width"
                value={preview.buttonWidth}
                min={120}
                max={420}
                step={1}
                suffix="px"
                onChange={(value) => updatePreview('buttonWidth', value)}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <SeaglassColorField
                label="Base color"
                value={preview.baseColor}
                onChange={(value) => updatePreview('baseColor', value)}
              />
              <SeaglassColorField
                label="Hover color"
                value={preview.hoverColor}
                onChange={(value) => updatePreview('hoverColor', value)}
              />
              <SeaglassColorField
                label="Active color"
                value={preview.activeColor}
                onChange={(value) => updatePreview('activeColor', value)}
              />
              <SeaglassColorField
                label="Canvas"
                value={preview.canvasColor}
                onChange={(value) => updatePreview('canvasColor', value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {seaglassPreviewPresets.map((preset) => (
                <button
                  key={preset.name}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  type="button"
                  onClick={() => applyPreset(preset)}
                >
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: preset.baseColor }}
                  />
                  {preset.name}
                </button>
              ))}
            </div>

            <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700">
              <input
                checked={preview.showSamples}
                className="h-4 w-4 accent-blue-600"
                type="checkbox"
                onChange={(event) => updatePreview('showSamples', event.target.checked)}
              />
              Show color sample buttons
            </label>
          </div>
        </div>

        <div className="grid gap-5">
          <SeaglassWorkbenchPanel
            title="Overlay"
            description="Switch between the moving hover surface and the quieter press layer."
          >
            <div className="grid grid-cols-2 rounded-lg border border-gray-200 bg-gray-100 p-1">
              {[
                { label: 'Hover overlay', value: 'hover' as const },
                { label: 'Press overlay', value: 'press' as const },
              ].map((layer) => {
                const isSelected = selectedLayer === layer.value;

                return (
                  <button
                    aria-pressed={isSelected}
                    className={[
                      'rounded-md px-3 py-2 text-xs font-semibold transition',
                      isSelected
                        ? 'bg-white text-gray-950 shadow-sm'
                        : 'text-gray-700 hover:text-gray-800',
                    ].join(' ')}
                    key={layer.value}
                    type="button"
                    onClick={() => setSelectedLayer(layer.value)}
                  >
                    {layer.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-gray-700">{selectedLayerCopy}</p>
          </SeaglassWorkbenchPanel>

          {selectedLayer === 'hover' ? (
            <SeaglassStopEditor
              title="Hover radial gradient"
              description="Edit the transparent white overlay that follows the cursor."
              radiusControls={[
                { label: 'Width', valueKey: 'radiusX' },
                { label: 'Height', valueKey: 'radiusY' },
              ]}
              maxStopCount={baseOverlayStops.length}
              onAddStop={addBaseStop}
              onDeleteStop={deleteBaseStop}
              previewColor={preview.baseColor}
              stops={visibleBaseOverlayStops}
              values={values}
              setValues={updateWorkbenchValues}
            />
          ) : (
            <>
              <SeaglassWorkbenchPanel
                title="Press timing"
                description="These values control the extra overlay while the button is pressed."
              >
                <div className="grid gap-4">
                  {timingControls.map((control) => (
                    <SeaglassDirectNumberField
                      key={control.valueKey}
                      label={control.label}
                      value={
                        control.valueKey === 'activeOverlayOpacity'
                          ? alphaToPercentValue(values[control.valueKey])
                          : values[control.valueKey]
                      }
                      min={control.min}
                      max={control.valueKey === 'activeOverlayOpacity' ? 100 : control.max}
                      step={control.valueKey === 'activeOverlayOpacity' ? 0.25 : control.step}
                      suffix={
                        control.valueKey === 'activeOverlayOpacity'
                          ? '%'
                          : 'suffix' in control
                            ? control.suffix
                            : undefined
                      }
                      description={
                        control.valueKey === 'activeOverlayOpacity'
                          ? 'Strength of the press layer.'
                          : undefined
                      }
                      onChange={(value) =>
                        updateWorkbenchNumber(
                          control.valueKey,
                          control.valueKey === 'activeOverlayOpacity'
                            ? percentToAlphaValue(value)
                            : value,
                        )
                      }
                    />
                  ))}
                </div>
              </SeaglassWorkbenchPanel>

              <SeaglassStopEditor
                title="Press radial gradient"
                description="Edit the transparent white overlay that fades in on press."
                radiusControls={[
                  { label: 'Width', valueKey: 'activeRadiusX' },
                  { label: 'Height', valueKey: 'activeRadiusY' },
                ]}
                maxStopCount={activeOverlayStops.length}
                onAddStop={addActiveStop}
                onDeleteStop={deleteActiveStop}
                previewColor={preview.activeColor}
                stops={visibleActiveOverlayStops}
                values={values}
                setValues={updateWorkbenchValues}
              />
            </>
          )}

          <SeaglassExportPanel copied={copied} exportJson={exportJson} onCopy={copyExport} />
        </div>
      </div>
    </div>
  );
}

type PreviewArgs = ButtonProps & {
  leadingIcon?: boolean;
  trailingIcon?: boolean;
};

function renderPreviewButton(args: PreviewArgs, fallback?: string) {
  const { leadingIcon, trailingIcon, children, ...buttonProps } = args;
  const text = useButtonText();
  const size = buttonProps.size ?? 'md';
  const iconSize = iconSizeMap[size];
  const buttonChildren = resolveButtonText(children, fallback ?? text.argsChildren);
  const content = buttonProps.iconOnly ? (
    <Plus size={iconSize} weight="bold" />
  ) : (
    <>
      {leadingIcon ? <Plus size={iconSize} weight="bold" /> : null}
      {buttonChildren}
      {trailingIcon ? <DirectionalArrow size={iconSize} weight="bold" /> : null}
    </>
  );
  const derivedAriaLabel =
    buttonProps['aria-label'] ??
    (typeof buttonChildren === 'string' ? buttonChildren : text.argsChildren);

  return (
    <Button
      {...buttonProps}
      aria-label={buttonProps.iconOnly ? derivedAriaLabel : buttonProps['aria-label']}
    >
      {content}
    </Button>
  );
}

const meta = {
  title: 'Components/Button',
  component: Button,
  render: renderPreviewButton,
  decorators: [
    (Story, context) => {
      const language = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const children = typeof args.children === 'string' ? args.children : '';
      const localizedChildren = getLocalizedButtonText(children, language);

      React.useEffect(() => {
        if (children !== localizedChildren) {
          updateArgs?.({ children: localizedChildren });
        }
      }, [children, localizedChildren, updateArgs]);

      return <Story />;
    },
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
    style: {
      control: 'select',
      options: ['fill', 'transparent', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    isLoading: {
      control: 'boolean',
    },
    iconOnly: {
      control: 'boolean',
    },
    leadingIcon: {
      control: 'boolean',
    },
    trailingIcon: {
      control: 'boolean',
    },
    treatment: {
      control: 'select',
      options: ['basic', 'seaglass'],
    },
    isDisabled: {
      control: 'boolean',
    },
  },
  args: {
    children: buttonText.en.argsChildren,
    variant: 'primary',
    style: 'fill',
    size: 'md',
    iconOnly: false,
    leadingIcon: false,
    trailingIcon: false,
    treatment: 'basic',
  },
} satisfies Meta<PreviewArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default button style used for most actions.
 */
export const Primary: Story = {
  render: (args) => {
    const text = useButtonText();

    return renderPreviewButton(args, text.primaryButton);
  },
  args: {
    children: buttonText.en.primaryButton,
  },
};

/**
 * A comprehensive view of all button variants and styles.
 * Useful for auditing visual consistency across the design system.
 */
export const AllVariants: Story = {
  render: () => {
    const text = useButtonText();

    return (
      <div className="grid grid-cols-4 gap-x-12 gap-y-8 items-center">
        <div />
        <div className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Fill
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Transparent
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Ghost
        </div>

        <div className="text-sm font-medium">Primary</div>
        <Button variant="primary" style="fill">
          {text.argsChildren}
        </Button>
        <Button variant="primary" style="transparent">
          {text.argsChildren}
        </Button>
        <Button variant="primary" style="ghost">
          {text.argsChildren}
        </Button>

        <div className="text-sm font-medium">Secondary</div>
        <Button variant="secondary" style="fill">
          {text.argsChildren}
        </Button>
        <Button variant="secondary" style="transparent">
          {text.argsChildren}
        </Button>
        <Button variant="secondary" style="ghost">
          {text.argsChildren}
        </Button>

        <div className="text-sm font-medium">Danger</div>
        <Button variant="danger" style="fill">
          {text.argsChildren}
        </Button>
        <Button variant="danger" style="transparent">
          {text.argsChildren}
        </Button>
        <Button variant="danger" style="ghost">
          {text.argsChildren}
        </Button>
      </div>
    );
  },
};

/**
 * Demonstrates common icon placement patterns with correct Figma sizing:
 * XL/LG: 20px, MD/SM: 16px, XS: 12px.
 */
export const WithIcons: Story = {
  render: (args) => {
    const text = useButtonText();
    const size = iconSizeMap[args.size as keyof typeof iconSizeMap] || 16;

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button {...args}>
            <Plus size={size} weight="bold" />
            {text.leadingIcon}
          </Button>
          <Button {...args}>
            {text.trailingIcon}
            <DirectionalArrow size={size} weight="bold" />
          </Button>
          <Button {...args}>
            <DownloadSimple size={size} weight="bold" />
            {text.bothIcons}
            <DirectionalArrow size={size} weight="bold" />
          </Button>
        </div>
        <div className="text-xs text-text-default-muted italic">
          Icon size for current {args.size} scale: {size}px
        </div>
      </div>
    );
  },
};

/**
 * Icon-only buttons keep the existing variant, style, size, and treatment system,
 * while switching to a square footprint. Provide an accessible label.
 */
export const IconOnly: Story = {
  render: (args) => (
    <div className="flex items-center gap-4 flex-wrap">
      <Button {...args} size="xl" iconOnly aria-label="Add item">
        <Plus size={24} weight="bold" />
      </Button>
      <Button
        {...args}
        variant="secondary"
        style="transparent"
        size="lg"
        iconOnly
        aria-label="Download file"
      >
        <DownloadSimple size={20} weight="bold" />
      </Button>
      <Button {...args} variant="danger" style="ghost" size="md" iconOnly aria-label="Delete item">
        <Trash size={16} weight="bold" />
      </Button>
      <Button
        {...args}
        variant="primary"
        style="fill"
        size="sm"
        iconOnly
        isLoading
        aria-label="Saving"
      >
        <Plus size={16} weight="bold" />
      </Button>
    </div>
  ),
};

/**
 * All supported sizes shown side-by-side with correctly sized icons.
 */
export const Sizes: Story = {
  render: (args) => {
    const text = useButtonText();

    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4 flex-wrap">
          <Button {...args} size="xl">
            <Plus size={20} weight="bold" /> {text.extraLargeButton}
          </Button>
          <Button {...args} size="lg">
            <Plus size={20} weight="bold" /> {text.largeButton}
          </Button>
          <Button {...args} size="md">
            <Plus size={16} weight="bold" /> {text.mediumButton}
          </Button>
          <Button {...args} size="sm">
            <Plus size={16} weight="bold" /> {text.smallButton}
          </Button>
          <Button {...args} size="xs">
            <Plus size={12} weight="bold" /> {text.extraSmallButton}
          </Button>
        </div>
      </div>
    );
  },
};

/**
 * Displays a loading spinner while preserving the button's dimensions.
 */
export const Loading: Story = {
  render: (args) => {
    const text = useButtonText();

    return renderPreviewButton(args, text.savingChanges);
  },
  args: {
    isLoading: true,
    children: buttonText.en.savingChanges,
  },
};

/**
 * Standard disabled state. Prevents all user interaction.
 */
export const Disabled: Story = {
  render: (args) => {
    const text = useButtonText();

    return renderPreviewButton(args, text.disabledAction);
  },
  args: {
    isDisabled: true,
    children: buttonText.en.disabledAction,
  },
};

/**
 * The seaglass treatment mapped onto the existing variant/style matrix.
 * Primary and secondary follow the dedicated Figma button set, while danger is a system-consistent extension behind the same treatment API.
 */
export const ExperimentalEnhanced: Story = {
  render: () => {
    return (
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-text-default-muted">
              Figma XL Matrix
            </span>
            <span className="text-sm text-text-default-subtle">
              Primary and secondary mirror the stylized Figma set at XL. Danger extends the same
              treatment for system consistency.
            </span>
          </div>
          <div className="grid grid-cols-4 gap-x-12 gap-y-8 items-center w-fit">
            <div />
            <div className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
              Fill
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
              Transparent
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
              Ghost
            </div>

            <div className="text-sm font-medium">Primary</div>
            <Button variant="primary" style="fill" size="xl" treatment="seaglass">
              <ButtonLabel size="xl" />
            </Button>
            <Button variant="primary" style="transparent" size="xl" treatment="seaglass">
              <ButtonLabel size="xl" />
            </Button>
            <Button variant="primary" style="ghost" size="xl" treatment="seaglass">
              <ButtonLabel size="xl" />
            </Button>

            <div className="text-sm font-medium">Secondary</div>
            <Button variant="secondary" style="fill" size="xl" treatment="seaglass">
              <ButtonLabel size="xl" />
            </Button>
            <Button variant="secondary" style="transparent" size="xl" treatment="seaglass">
              <ButtonLabel size="xl" />
            </Button>
            <Button variant="secondary" style="ghost" size="xl" treatment="seaglass">
              <ButtonLabel size="xl" />
            </Button>

            <div className="text-sm font-medium">Danger</div>
            <Button variant="danger" style="fill" size="xl" treatment="seaglass">
              <ButtonLabel size="xl" />
            </Button>
            <Button variant="danger" style="transparent" size="xl" treatment="seaglass">
              <ButtonLabel size="xl" />
            </Button>
            <Button variant="danger" style="ghost" size="xl" treatment="seaglass">
              <ButtonLabel size="xl" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-text-default-muted">
            State Coverage
          </span>
          <div className="grid grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
                Primary Default
              </span>
              <Button variant="primary" style="fill" size="xl" treatment="seaglass">
                <ButtonLabel size="xl" />
              </Button>
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
                Primary Loading
              </span>
              <Button
                variant="primary"
                style="fill"
                size="xl"
                isLoading
                treatment="seaglass"
                aria-label="Primary loading button"
              />
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
                Primary Disabled
              </span>
              <Button variant="primary" style="fill" size="xl" isDisabled treatment="seaglass">
                <ButtonLabel size="xl" />
              </Button>
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
                Secondary Default
              </span>
              <Button variant="secondary" style="fill" size="xl" treatment="seaglass">
                <ButtonLabel size="xl" />
              </Button>
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
                Secondary Loading
              </span>
              <Button
                variant="secondary"
                style="fill"
                size="xl"
                isLoading
                treatment="seaglass"
                aria-label="Secondary loading button"
              />
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
                Secondary Disabled
              </span>
              <Button variant="secondary" style="fill" size="xl" isDisabled treatment="seaglass">
                <ButtonLabel size="xl" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-text-default-muted">
            Size Adaptation
          </span>
          <div className="flex items-end gap-4 flex-wrap">
            <Button variant="primary" style="fill" size="xs" treatment="seaglass">
              <ButtonLabel size="xs" />
            </Button>
            <Button variant="primary" style="fill" size="sm" treatment="seaglass">
              <ButtonLabel size="sm" />
            </Button>
            <Button variant="primary" style="fill" size="md" treatment="seaglass">
              <ButtonLabel size="md" />
            </Button>
            <Button variant="primary" style="fill" size="lg" treatment="seaglass">
              <ButtonLabel size="lg" />
            </Button>
            <Button variant="primary" style="fill" size="xl" treatment="seaglass">
              <ButtonLabel size="xl" />
            </Button>
          </div>
        </div>
      </div>
    );
  },
};

/**
 * Seaglass fill with the same color-agnostic white radial overlay applied to
 * solid colors from the Figma Foundation Colors page.
 */
export const SeaglassColorExamples: Story = {
  parameters: {
    layout: 'padded',
  },
  render: () => {
    const text = useButtonText();

    return (
      <div className="flex max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
            Figma Foundation Colors
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {seaglassColorExamples.map((color) => (
            <div
              key={color.name}
              className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  aria-hidden="true"
                  className={`h-8 w-8 shrink-0 rounded-full ${color.swatchClassName}`}
                />
                <div className="truncate text-sm font-medium text-gray-900">{color.name}</div>
              </div>
              <Button
                variant="primary"
                style="fill"
                size="xl"
                treatment="seaglass"
                className={`min-w-[180px] ${color.buttonClassName}`}
              >
                {text.start}
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * Width changes should preserve the seaglass side bloom without washing out the center.
 */
export const SeaglassResponsiveWidths: Story = {
  parameters: {
    layout: 'padded',
  },
  render: () => (
    <div className="flex max-w-5xl flex-col gap-5">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
        Responsive Widths
      </span>
      <div className="flex flex-col items-start gap-4">
        {[
          { label: '140px', className: 'w-[140px]' },
          { label: '180px', className: 'w-[180px]' },
          { label: '260px', className: 'w-[260px]' },
          { label: '360px', className: 'w-[360px]' },
          { label: '480px', className: 'w-[480px]' },
        ].map((example) => (
          <Button
            key={example.label}
            variant="primary"
            style="fill"
            size="xl"
            treatment="seaglass"
            className={`justify-center ${example.className}`}
          >
            {example.label}
          </Button>
        ))}
      </div>
    </div>
  ),
};

export const InternalSeaglassGradientWorkbench: Story = {
  parameters: {
    layout: 'padded',
  },
  render: () => <SeaglassGradientWorkbench />,
};
