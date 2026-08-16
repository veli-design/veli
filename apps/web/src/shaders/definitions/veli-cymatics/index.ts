import type { ShaderDefinition } from '../../types';
import common from '../../glsl/common.glsl?raw';
import body from './fragment.glsl?raw';

/**
 * Veli Cymatics — fine sand collecting along a slowly breathing Chladni field.
 *
 * The behavior is adapted from the designer's particle study, while the
 * palette is taken directly from Veli's Sage (neutral) and Teal (primary)
 * primitives. Separate token values are supplied for light and dark themes;
 * the renderer blends between them through its built-in `u_theme` uniform.
 */
export const veliCymatics: ShaderDefinition = {
  id: 'veli-cymatics',
  label: 'Veli Cymatics',
  fragment: `${common}\n${body}`,
  params: {
    // Veli Sage + Teal palette -------------------------------------------
    lightBase: { type: 'color', value: '#F4F6F3', label: 'Sage 200' },
    lightWash: { type: 'color', value: '#FBFCFB', label: 'Sage 100' },
    lightGrain: { type: 'color', value: '#696B66', label: 'Sage 800' },
    lightAccent: { type: 'color', value: '#19767E', label: 'Teal 800' },
    darkBase: { type: 'color', value: '#0E0E0D', label: 'Sage 100 · dark' },
    darkWash: { type: 'color', value: '#161614', label: 'Sage 200 · dark' },
    darkGrain: { type: 'color', value: '#83867F', label: 'Sage 800 · dark' },
    darkAccent: { type: 'color', value: '#40B3B5', label: 'Teal 900 · dark' },

    // Standing wave ------------------------------------------------------
    frequencyA: { type: 'float', value: 3.15, min: 1, max: 12, step: 0.05, label: 'Frequency A' },
    frequencyB: { type: 'float', value: 5.05, min: 1, max: 12, step: 0.05, label: 'Frequency B' },
    nodeWidth: { type: 'float', value: 0.16, min: 0.04, max: 0.4, step: 0.01, label: 'Node width' },
    patternScale: {
      type: 'float',
      value: 1.08,
      min: 0.5,
      max: 2,
      step: 0.01,
      label: 'Pattern scale',
    },
    morphSpeed: {
      type: 'float',
      value: 0.12,
      min: 0,
      max: 0.5,
      step: 0.005,
      label: 'Cymatic breathing',
    },
    formationDuration: {
      type: 'float',
      value: 4.2,
      min: 0.5,
      max: 12,
      step: 0.1,
      label: 'Formation duration',
    },

    // Grain --------------------------------------------------------------
    grainSize: { type: 'float', value: 5.2, min: 3, max: 10, step: 0.1, label: 'Grain spacing' },
    grainDensity: {
      type: 'float',
      value: 0.84,
      min: 0.1,
      max: 1,
      step: 0.01,
      label: 'Grain density',
    },
    dustAmount: { type: 'float', value: 0.045, min: 0, max: 0.2, step: 0.005, label: 'Loose dust' },
    pointerStrength: {
      type: 'float',
      value: 0.85,
      min: 0,
      max: 2,
      step: 0.05,
      label: 'Pointer vibration',
    },
    safeZoneCenter: { type: 'vec2', value: [0.5, 0.51], label: 'Reading zone centre' },
    safeZoneSize: { type: 'vec2', value: [0.4, 0.49], label: 'Reading zone size' },
    safeZoneStrength: {
      type: 'float',
      value: 0.86,
      min: 0,
      max: 1,
      step: 0.01,
      label: 'Reading zone calm',
    },
  },
};
