import { useEffect, useMemo } from 'react';
import { useDialKitController } from 'dialkit';
import type { DialConfig } from 'dialkit';

const BRIDGE_EVENT = 'veli:wave-formation-dial-change';

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

export default function ShaderDialControls() {
  const controller = useDialKitController('WaveFormation BG', CONFIG, {
    id: 'pd-901-wave-formation-v2',
    persist: {
      key: 'veli-pd-901-wave-formation-controls-v2',
      storage: 'localStorage',
      presets: true,
    },
    onAction: (action) => {
      if (action.endsWith('resetTunedDefaults')) {
        controller.setValues(clone(DEFAULT_VALUES) as never);
      }
    },
  });

  const values = controller.values as unknown as AnyRecord;
  const serialised = useMemo(() => JSON.stringify(values), [values]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(BRIDGE_EVENT, {
        detail: { state: clone(toEngineState(values)) },
      }),
    );
  }, [serialised, values]);

  return null;
}
