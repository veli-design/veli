import { useEffect, useMemo, useRef } from 'react';
import { useDialKitController } from 'dialkit';
import type { DialConfig } from 'dialkit';
import { DEFAULT_SHADER, getShader, PD784_SHADER_IDS } from '../shaders/registry';
import type { ParamSpec, ParamValue, ShaderDefinition } from '../shaders/types';

const SHADER_OPTIONS = PD784_SHADER_IDS.map((id) => ({
  value: id,
  label: getShader(id)?.label ?? id,
}));

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

function limitsFor(spec: ParamSpec) {
  const value = spec.value as number;
  const span = Math.max(Math.abs(value) * 2, 1);
  const min = spec.min ?? value - span;
  const max = spec.max ?? value + span;
  const step = spec.step ?? Math.max((max - min) / 200, 0.001);
  return [value, min, max, step] as [number, number, number, number];
}

function definitionConfig(definition: ShaderDefinition): DialConfig {
  const config: DialConfig = { _collapsed: true };
  for (const [name, spec] of Object.entries(definition.params)) {
    if (spec.type === 'float') {
      config[name] = limitsFor(spec);
    } else if (spec.type === 'color') {
      config[name] = { type: 'color', default: spec.value as string };
    } else {
      const components = spec.value as number[];
      const min = spec.min ?? (name.toLowerCase().includes('size') ? 0 : -2);
      const max = spec.max ?? 2;
      const step = spec.step ?? 0.01;
      config[name] = Object.fromEntries(
        components.map((value, index) => [['x', 'y', 'z'][index], [value, min, max, step]]),
      ) as DialConfig;
    }
  }
  return config;
}

const cymatics = getShader('veli-cymatics');
const fusion = getShader('veli-cymatics-gradient');

if (!cymatics || !fusion) throw new Error('PD-784 shader definitions are not registered.');

const CONFIG = {
  implementation: {
    type: 'select',
    options: SHADER_OPTIONS,
    default: String(DEFAULT_SHADER),
  },
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
  veliCymatics: definitionConfig(cymatics),
  shoreCymatics: definitionConfig(fusion),
  actions: {
    _collapsed: false,
    reseedParticles: { type: 'action', label: 'Reseed particles' },
    resetSceneTuning: { type: 'action', label: 'Reset scene tuning' },
    resetCurrentShader: { type: 'action', label: 'Reset current shader' },
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

function paramValues(folder: AnyRecord, definition: ShaderDefinition) {
  const values: Record<string, ParamValue> = {};
  for (const [name, spec] of Object.entries(definition.params)) {
    const value = folder[name];
    values[name] =
      spec.type === 'vec2' || spec.type === 'vec3'
        ? (Object.values(value as AnyRecord) as ParamValue)
        : (value as ParamValue);
  }
  return values;
}

function exactPreset(values: AnyRecord) {
  const exact = values.originalStipple as AnyRecord;
  const controls = {
    ...(exact.sceneTiming as AnyRecord),
    ...(exact.motion as AnyRecord),
    ...(exact.lightDance as AnyRecord),
    ...(exact.stipple as AnyRecord),
  };
  return {
    version: 1,
    shader: 'veli-gradient-stipple',
    scene: Number(exact.scene),
    controls,
    sceneAdjustments: ['wave', 'dune', 'shore'].map((name) => clone(exact[name] as AnyRecord)),
  };
}

function exportValue(values: AnyRecord) {
  const shader = String(values.implementation);
  if (shader === 'veli-gradient-stipple') return exactPreset(values);
  const definition = getShader(shader);
  const folder = shader === 'veli-cymatics' ? values.veliCymatics : values.shoreCymatics;
  return {
    version: 1,
    shader,
    params: definition ? paramValues(folder as AnyRecord, definition) : {},
  };
}

function downloadJson(value: unknown, shader: string) {
  const blob = new Blob([`${JSON.stringify(value, null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${shader}-preset.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function randomSeed() {
  return window.crypto.getRandomValues(new Uint32Array(1))[0];
}

export default function ShaderDialControls() {
  const fileInput = useRef<HTMLInputElement>(null);
  const previous = useRef<Record<string, unknown>>({});
  const queryApplied = useRef(false);

  const controller = useDialKitController('Homepage shaders', CONFIG, {
    id: 'pd-784-homepage-shaders',
    persist: { key: 'veli-pd-784-shader-controls', storage: 'localStorage', presets: true },
    onAction: (action) => {
      const values = controller.getValues() as unknown as AnyRecord;
      const activeShader = String(values.implementation);
      if (action.endsWith('reseedParticles')) {
        controller.setValue('originalStipple.stipple.seed', randomSeed());
      } else if (action.endsWith('resetSceneTuning')) {
        const exact = values.originalStipple as AnyRecord;
        const scene = ['wave', 'dune', 'shore'][Number(exact.scene ?? 0)] ?? 'wave';
        controller.setValues({
          originalStipple: { [scene]: clone(ADJUSTMENT_DEFAULTS) },
        } as never);
      } else if (action.endsWith('resetCurrentShader')) {
        if (activeShader === 'veli-gradient-stipple') {
          controller.setValues({ originalStipple: clone(DEFAULT_VALUES.originalStipple) } as never);
        } else {
          const key = activeShader === 'veli-cymatics' ? 'veliCymatics' : 'shoreCymatics';
          controller.setValues({ [key]: clone(DEFAULT_VALUES[key]) } as never);
        }
      } else if (action.endsWith('copyJson')) {
        void navigator.clipboard.writeText(JSON.stringify(exportValue(values), null, 2));
      } else if (action.endsWith('downloadJson')) {
        downloadJson(exportValue(values), activeShader);
      } else if (action.endsWith('importJson')) {
        fileInput.current?.click();
      }
    },
  });

  const values = controller.values as unknown as AnyRecord;
  const serialised = useMemo(() => JSON.stringify(values), [values]);

  useEffect(() => {
    if (queryApplied.current) return;
    queryApplied.current = true;
    const requested = new URLSearchParams(window.location.search).get('shader');
    if (requested && PD784_SHADER_IDS.some((id) => id === requested)) {
      controller.setValue('implementation', requested);
    }
  }, [controller]);

  useEffect(() => {
    const next = flatten(values);
    const changedPaths = Object.keys(next).filter(
      (path) => JSON.stringify(next[path]) !== JSON.stringify(previous.current[path]),
    );
    previous.current = next;
    window.dispatchEvent(
      new CustomEvent('veli:shader-dial-change', {
        detail: { values: clone(values), changedPaths },
      }),
    );
  }, [serialised, values]);

  async function importPreset(file: File) {
    const preset = JSON.parse(await file.text()) as AnyRecord;
    const shader = String(preset.shader ?? '');
    if (!PD784_SHADER_IDS.some((id) => id === shader) || preset.version !== 1) {
      throw new Error('This is not a supported PD-784 shader preset.');
    }
    if (shader === 'veli-gradient-stipple') {
      const controls = (preset.controls ?? {}) as AnyRecord;
      const adjustments = (preset.sceneAdjustments ?? []) as AnyRecord[];
      controller.setValues({
        implementation: shader,
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
    } else {
      const key = shader === 'veli-cymatics' ? 'veliCymatics' : 'shoreCymatics';
      const definition = getShader(shader);
      const params = (preset.params ?? {}) as Record<string, ParamValue>;
      const folder: AnyRecord = {};
      if (definition) {
        for (const [name, spec] of Object.entries(definition.params)) {
          const value = params[name] ?? spec.value;
          folder[name] = Array.isArray(value)
            ? Object.fromEntries(
                value.map((component, index) => [['x', 'y', 'z'][index], component]),
              )
            : value;
        }
      }
      controller.setValues({ implementation: shader, [key]: folder } as never);
    }
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
