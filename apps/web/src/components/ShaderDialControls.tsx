import { useEffect, useMemo, useRef } from 'react';
import { useDialKitController } from 'dialkit';
import type { DialConfig } from 'dialkit';

const BRIDGE_EVENT = 'veli:wave-formation-dial-change';
const THEME_EVENT = 'veli:color-scheme-change';
const APPEARANCE_PRESETS_STORAGE_KEY = 'veli-wave-formation-appearance-presets-v1';

type ShaderMode = 'light' | 'dark';

type AppearanceValues = {
  dotColor: string;
  bgmode: string;
  bgColor: string;
  bgColor2: string;
  bgangle: number;
  bgspread: number;
};

const DEFAULT_APPEARANCE: Record<ShaderMode, AppearanceValues> = {
  dark: {
    dotColor: '#f5f5f0',
    bgmode: 'solid',
    bgColor: '#08090a',
    bgColor2: '#1a3a5c',
    bgangle: 180,
    bgspread: 1,
  },
  light: {
    dotColor: '#08213a',
    bgmode: 'linear',
    bgColor: '#f5f5f0',
    bgColor2: '#d8eaf8',
    bgangle: 145,
    bgspread: 1,
  },
};

const CONFIG = {
  particles: {
    _collapsed: false,
    count: [700, 100, 6000, 100],
    size: [1.6, 0.5, 20, 0.1],
    sizevar: [0, 0, 1, 0.05],
    sizevarstyle: {
      type: 'select',
      options: [
        { value: 'uniform', label: 'Uniform' },
        { value: 'bimodal', label: 'Bimodal' },
        { value: 'gaussian', label: 'Gaussian' },
      ],
      default: 'uniform',
    },
    speed: [0.4, 0, 20, 0.1],
  },
  mouse: {
    _collapsed: true,
    mousemode: {
      type: 'select',
      options: [
        { value: 'repel', label: 'Repel' },
        { value: 'attract', label: 'Attract' },
        { value: 'off', label: 'Off' },
      ],
      default: 'repel',
    },
    radius: [110, 0, 300, 5],
    force: [2.2, 0, 8, 0.1],
  },
  ballToBall: {
    _collapsed: true,
    interforce: [1.2, 0, 4, 0.1],
    interradius: [18, 0, 60, 1],
    rangevar: [0, 0, 1, 0.05],
    rangevarstyle: {
      type: 'select',
      options: [
        { value: 'uniform', label: 'Uniform' },
        { value: 'bimodal', label: 'Bimodal' },
        { value: 'gaussian', label: 'Gaussian' },
      ],
      default: 'uniform',
    },
    connections: false,
    connectdist: [80, 10, 220, 5],
  },
  formation: {
    _collapsed: false,
    formation: {
      type: 'select',
      options: [
        { value: 'free', label: 'Free' },
        { value: 'wave', label: 'Wave' },
        { value: 'lines', label: 'Lines' },
        { value: 'grid', label: 'Grid' },
        { value: 'circle', label: 'Circle' },
        { value: 'rings', label: 'Rings' },
        { value: 'spiral', label: 'Spiral' },
        { value: 'radial', label: 'Radial' },
        { value: 'hex', label: 'Hex grid' },
      ],
      default: 'free',
    },
    formationstrength: [0.75, 0, 1, 0.05],
    formationscale: [1, 0.3, 2.5, 0.05],
    formationrotation: [0, 0, 360, 1],
    formationoffsetx: [0, -400, 400, 5],
    offsetxloop: false,
    formationoffsety: [0, -300, 300, 5],
  },
  wave: {
    _collapsed: true,
    wavedirection: {
      type: 'select',
      options: [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' },
      ],
      default: 'horizontal',
    },
    waveamp: [1, 0, 3, 0.05],
    wavefreq: [1, 0.2, 3, 0.05],
    wavedensity: [1, 0.3, 3, 0.05],
    wavespeed: [1, 0, 5, 0.05],
    waveshape: {
      type: 'select',
      options: [
        { value: 'sine', label: 'Sine' },
        { value: 'triangle', label: 'Triangle' },
        { value: 'square', label: 'Square' },
      ],
      default: 'sine',
    },
    wavevariation: [1, 0, 2, 0.05],
    wavecomplexity: [0, 0, 1, 0.05],
  },
  marqueeLoop: {
    _collapsed: true,
    loopdir: {
      type: 'select',
      options: [
        { value: 'off', label: 'Off' },
        { value: 'right', label: 'Left → Right' },
        { value: 'left', label: 'Right → Left' },
        { value: 'down', label: 'Up → Down' },
        { value: 'up', label: 'Down → Up' },
      ],
      default: 'off',
    },
    loopspeed: [135, 5, 250, 5],
  },
  seamlessLoop: {
    _collapsed: true,
    seamless: false,
    loopduration: [8, 2, 20, 1],
  },
  fieldForces: {
    _collapsed: true,
    gravity: [0, 0, 3, 0.05],
    trail: [1, 0.02, 1, 0.02],
  },
  canvas: {
    _collapsed: true,
    canvasw: [1920, 320, 3840, 20],
    canvash: [1080, 320, 2160, 20],
  },
  appearance: {
    _collapsed: true,
    dotColor: { type: 'color', default: '#f5f5f0' },
    bgmode: {
      type: 'select',
      options: [
        { value: 'solid', label: 'Solid' },
        { value: 'linear', label: 'Linear gradient' },
        { value: 'radial', label: 'Radial gradient' },
      ],
      default: 'solid',
    },
    bgColor: { type: 'color', default: '#08090a' },
    bgColor2: { type: 'color', default: '#1a3a5c' },
    bgangle: [180, 0, 360, 5],
    bgspread: [1, 0.2, 2, 0.05],
  },
  actions: {
    _collapsed: false,
    resetTunedDefaults: { type: 'action', label: 'Reset tuned defaults' },
  },
} satisfies DialConfig;

type AnyRecord = Record<string, unknown>;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function resolveDefaults(config: DialConfig): AnyRecord {
  const values: AnyRecord = {};
  for (const [key, value] of Object.entries(config)) {
    if (key === '_collapsed') continue;
    if (Array.isArray(value)) {
      values[key] = value[0];
    } else if (value && typeof value === 'object') {
      if (value.type === 'action') continue;
      if (value.type === 'select' || value.type === 'color' || value.type === 'text') {
        values[key] = value.default ?? '';
      } else {
        values[key] = resolveDefaults(value as DialConfig);
      }
    } else {
      values[key] = value;
    }
  }
  return values;
}

const DEFAULT_VALUES = resolveDefaults(CONFIG);

function toEngineState(values: AnyRecord): AnyRecord {
  return {
    ...(values.particles as AnyRecord),
    ...(values.mouse as AnyRecord),
    ...(values.ballToBall as AnyRecord),
    ...(values.formation as AnyRecord),
    ...(values.wave as AnyRecord),
    ...(values.marqueeLoop as AnyRecord),
    ...(values.seamlessLoop as AnyRecord),
    ...(values.fieldForces as AnyRecord),
    ...(values.canvas as AnyRecord),
    ...(values.appearance as AnyRecord),
  };
}

function isShaderMode(value: unknown): value is ShaderMode {
  return value === 'light' || value === 'dark';
}

function getAppearance(values: AnyRecord): AppearanceValues {
  return clone(values.appearance as AppearanceValues);
}

function readAppearancePresets(): Record<ShaderMode, AppearanceValues> {
  const presets = clone(DEFAULT_APPEARANCE);

  try {
    const stored = window.localStorage.getItem(APPEARANCE_PRESETS_STORAGE_KEY);
    if (!stored) return presets;

    const parsed = JSON.parse(stored) as Partial<Record<ShaderMode, Partial<AppearanceValues>>>;
    for (const mode of ['light', 'dark'] as const) {
      if (parsed[mode]) {
        presets[mode] = { ...presets[mode], ...parsed[mode] };
      }
    }
  } catch {
    // The tuned defaults remain available if storage contains invalid data.
  }

  return presets;
}

function hasStoredAppearancePresets() {
  try {
    return Boolean(window.localStorage.getItem(APPEARANCE_PRESETS_STORAGE_KEY));
  } catch {
    return false;
  }
}

function writeAppearancePresets(presets: Record<ShaderMode, AppearanceValues>) {
  try {
    window.localStorage.setItem(APPEARANCE_PRESETS_STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // The active shader still updates if storage is unavailable.
  }
}

export default function ShaderDialControls() {
  const activeModeRef = useRef<ShaderMode | null>(null);
  const presetsRef = useRef<Record<ShaderMode, AppearanceValues> | null>(null);
  const presetsReadyRef = useRef(false);
  const controller = useDialKitController('WaveFormation BG', CONFIG, {
    id: 'pd-901-wave-formation-v2',
    persist: {
      key: 'veli-pd-901-wave-formation-controls-v2',
      storage: 'localStorage',
      presets: true,
    },
    onAction: (action) => {
      if (action.endsWith('resetTunedDefaults')) {
        const tunedDefaults = clone(DEFAULT_VALUES);
        tunedDefaults.appearance = clone(DEFAULT_APPEARANCE[activeModeRef.current ?? 'dark']);
        controller.setValues(tunedDefaults as never);
      }
    },
  });
  const controllerRef = useRef(controller);

  const values = controller.values as unknown as AnyRecord;
  const serialised = useMemo(() => JSON.stringify(values), [values]);

  useEffect(() => {
    const dial = controllerRef.current;

    let activeMode = isShaderMode(document.documentElement.dataset.theme)
      ? document.documentElement.dataset.theme
      : 'dark';
    const presets = readAppearancePresets();

    // Preserve colors tuned before mode-aware presets existed as the dark preset.
    if (!hasStoredAppearancePresets()) {
      presets.dark = getAppearance(dial.getValues() as unknown as AnyRecord);
      writeAppearancePresets(presets);
    }

    activeModeRef.current = activeMode;
    presetsRef.current = presets;
    presetsReadyRef.current = true;
    dial.setValues({ appearance: presets[activeMode] } as never);

    const onThemeChange = (event: Event) => {
      const detail = (event as CustomEvent<{ resolvedColorScheme?: string }>).detail;
      if (!isShaderMode(detail?.resolvedColorScheme) || detail.resolvedColorScheme === activeMode) {
        return;
      }

      presets[activeMode] = getAppearance(dial.getValues() as unknown as AnyRecord);
      activeMode = detail.resolvedColorScheme;
      activeModeRef.current = activeMode;
      dial.setValues({ appearance: presets[activeMode] } as never);
      writeAppearancePresets(presets);
    };

    window.addEventListener(THEME_EVENT, onThemeChange);

    return () => window.removeEventListener(THEME_EVENT, onThemeChange);
  }, []);

  useEffect(() => {
    if (!presetsReadyRef.current || !activeModeRef.current || !presetsRef.current) return;

    const activeMode = activeModeRef.current;
    const presets = presetsRef.current;
    presets[activeMode] = getAppearance(values);
    writeAppearancePresets(presets);

    window.dispatchEvent(
      new CustomEvent(BRIDGE_EVENT, {
        detail: { state: clone(toEngineState(values)) },
      }),
    );
  }, [serialised, values]);

  return null;
}
