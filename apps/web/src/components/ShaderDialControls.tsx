import { useEffect, useMemo, useRef } from 'react';
import { useDialKitController } from 'dialkit';
import type { DialConfig } from 'dialkit';

const SHADER_ID = 'veli-gradient-stipple';

const ADJUSTMENT_DEFAULTS = {
  hue: 0,
  light: 1,
  spread: 1,
  lx: 0,
  ly: 0,
  dx: 0,
  dy: 0,
};

const SCENE_ADJUSTMENT_CONFIG = {
  _collapsed: true,
  hue: [0, -60, 60, 1],
  light: [1, 0.2, 2, 0.05],
  spread: [1, 0.3, 2.5, 0.05],
  lx: [0, -0.5, 0.5, 0.01],
  ly: [0, -0.5, 0.5, 0.01],
  dx: [0, -0.5, 0.5, 0.01],
  dy: [0, -0.5, 0.5, 0.01],
} satisfies DialConfig;

const CONFIG = {
  originalStipple: {
    _collapsed: false,
    scene: {
      type: 'select',
      options: [
        { value: '0', label: 'Wave' },
        { value: '1', label: 'Dune' },
        { value: '2', label: 'Shore' },
      ],
      default: '0',
    },
    sceneTiming: {
      _collapsed: true,
      autoCycle: true,
      dwell: [10, 4, 30, 1],
      morphDur: [3, 1, 6, 0.1],
      stagger: [0.65, 0, 1, 0.05],
    },
    motion: {
      _collapsed: true,
      speed: [1, 0, 3, 0.05],
      driftOn: true,
      driftAmt: [0.5, 0, 1, 0.05],
      wanderAmt: [1, 0, 2.5, 0.05],
      wanderSpeed: [1, 0, 2.5, 0.05],
      paused: false,
    },
    lightDance: {
      _collapsed: true,
      danceOn: true,
      danceAmt: [1, 0, 2, 0.05],
      dancePulse: [1, 0, 2, 0.05],
    },
    stipple: {
      _collapsed: true,
      density: [5200, 400, 9000, 100],
      dotSize: [1.2, 0.5, 3, 0.05],
      sizeVar: [1, 0, 1, 0.05],
      dotGlow: [1, 0.3, 2, 0.05],
      twinkle: [0.4, 0, 1, 0.05],
      seed: [1337, 0, 4294967295, 1],
    },
    wave: SCENE_ADJUSTMENT_CONFIG,
    dune: SCENE_ADJUSTMENT_CONFIG,
    shore: SCENE_ADJUSTMENT_CONFIG,
  },
  actions: {
    _collapsed: false,
    reseedParticles: { type: 'action', label: 'Reseed particles' },
    resetSceneTuning: { type: 'action', label: 'Reset scene tuning' },
    resetAllControls: { type: 'action', label: 'Reset all controls' },
    copyJson: { type: 'action', label: 'Copy JSON' },
    downloadJson: { type: 'action', label: 'Download JSON' },
    importJson: { type: 'action', label: 'Import JSON' },
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

function flatten(value: AnyRecord, prefix = '', output: Record<string, unknown> = {}) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) {
      flatten(child as AnyRecord, path, output);
    } else {
      output[path] = child;
    }
  }
  return output;
}

function exactPreset(values: AnyRecord) {
  const exact = values.originalStipple as AnyRecord;
  return {
    version: 1,
    shader: SHADER_ID,
    scene: Number(exact.scene),
    controls: {
      ...(exact.sceneTiming as AnyRecord),
      ...(exact.motion as AnyRecord),
      ...(exact.lightDance as AnyRecord),
      ...(exact.stipple as AnyRecord),
    },
    sceneAdjustments: ['wave', 'dune', 'shore'].map((name) => clone(exact[name] as AnyRecord)),
  };
}

function downloadJson(value: unknown) {
  const blob = new Blob([`${JSON.stringify(value, null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${SHADER_ID}-preset.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function randomSeed() {
  return window.crypto.getRandomValues(new Uint32Array(1))[0];
}

export default function ShaderDialControls() {
  const fileInput = useRef<HTMLInputElement>(null);
  const previous = useRef<Record<string, unknown>>({});

  const controller = useDialKitController('Stipple BG', CONFIG, {
    id: 'pd-784-stipple-bg',
    persist: { key: 'veli-pd-784-stipple-controls', storage: 'localStorage', presets: true },
    onAction: (action) => {
      const values = controller.getValues() as unknown as AnyRecord;
      if (action.endsWith('reseedParticles')) {
        controller.setValue('originalStipple.stipple.seed', randomSeed());
      } else if (action.endsWith('resetSceneTuning')) {
        const exact = values.originalStipple as AnyRecord;
        const scene = ['wave', 'dune', 'shore'][Number(exact.scene ?? 0)] ?? 'wave';
        controller.setValues({
          originalStipple: { [scene]: clone(ADJUSTMENT_DEFAULTS) },
        } as never);
      } else if (action.endsWith('resetAllControls')) {
        controller.setValues({ originalStipple: clone(DEFAULT_VALUES.originalStipple) } as never);
      } else if (action.endsWith('copyJson')) {
        void navigator.clipboard.writeText(JSON.stringify(exactPreset(values), null, 2));
      } else if (action.endsWith('downloadJson')) {
        downloadJson(exactPreset(values));
      } else if (action.endsWith('importJson')) {
        fileInput.current?.click();
      }
    },
  });

  const values = controller.values as unknown as AnyRecord;
  const serialised = useMemo(() => JSON.stringify(values), [values]);

  useEffect(() => {
    const next = flatten(values);
    const changedPaths = Object.keys(next).filter(
      (path) => JSON.stringify(next[path]) !== JSON.stringify(previous.current[path]),
    );
    previous.current = next;
    window.dispatchEvent(
      new CustomEvent('veli:stipple-dial-change', {
        detail: { values: clone(values), changedPaths },
      }),
    );
  }, [serialised, values]);

  async function importPreset(file: File) {
    const preset = JSON.parse(await file.text()) as AnyRecord;
    if (preset.shader !== SHADER_ID || preset.version !== 1) {
      throw new Error('This is not a Veli Stipple BG preset.');
    }
    const controls = (preset.controls ?? {}) as AnyRecord;
    const adjustments = (preset.sceneAdjustments ?? []) as AnyRecord[];
    controller.setValues({
      originalStipple: {
        scene: String(preset.scene ?? 0),
        sceneTiming: {
          autoCycle: controls.autoCycle,
          dwell: controls.dwell,
          morphDur: controls.morphDur,
          stagger: controls.stagger,
        },
        motion: {
          speed: controls.speed,
          driftOn: controls.driftOn,
          driftAmt: controls.driftAmt,
          wanderAmt: controls.wanderAmt,
          wanderSpeed: controls.wanderSpeed,
          paused: controls.paused,
        },
        lightDance: {
          danceOn: controls.danceOn,
          danceAmt: controls.danceAmt,
          dancePulse: controls.dancePulse,
        },
        stipple: {
          density: controls.density,
          dotSize: controls.dotSize,
          sizeVar: controls.sizeVar,
          dotGlow: controls.dotGlow,
          twinkle: controls.twinkle,
          seed: controls.seed,
        },
        wave: adjustments[0] ?? ADJUSTMENT_DEFAULTS,
        dune: adjustments[1] ?? ADJUSTMENT_DEFAULTS,
        shore: adjustments[2] ?? ADJUSTMENT_DEFAULTS,
      },
    } as never);
  }

  return (
    <input
      ref={fileInput}
      type="file"
      accept="application/json,.json"
      hidden
      onChange={(event) => {
        const file = event.currentTarget.files?.[0];
        if (file) void importPreset(file);
        event.currentTarget.value = '';
      }}
    />
  );
}
