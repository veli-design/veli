import type { ShaderDefinition } from '../../types';
import common from '../../glsl/common.glsl?raw';
import body from './fragment.glsl?raw';

/**
 * Shore Cymatics — a causal fusion of the recovered cymatic plate and the
 * Shore experiment. The moving light field widens the standing-wave nodes and
 * controls how much sand can collect, so both systems visibly move as one.
 */
export const veliCymaticsGradient: ShaderDefinition = {
  id: 'veli-cymatics-gradient',
  label: 'Shore Cymatics',
  fragment: `${common}\n${body}`,
  params: {
    lightDeep: { type: 'color', value: '#B7D9D9', label: 'Light · deep water' },
    lightMid: { type: 'color', value: '#D8EEEA', label: 'Light · shallow water' },
    lightShine: { type: 'color', value: '#FCFFFD', label: 'Light · caustic shine' },
    lightGrain: { type: 'color', value: '#4E6D6D', label: 'Light · cymatic sand' },
    lightAccent: { type: 'color', value: '#1A7A80', label: 'Light · teal glint' },
    lightReading: { type: 'color', value: '#EAF4F0', label: 'Light · reading surface' },
    darkDeep: { type: 'color', value: '#022634', label: 'Dark · deep water' },
    darkMid: { type: 'color', value: '#47BFC3', label: 'Dark · shallow water' },
    darkShine: { type: 'color', value: '#DDFFFF', label: 'Dark · caustic shine' },
    darkGrain: { type: 'color', value: '#91A8A5', label: 'Dark · cymatic sand' },
    darkAccent: { type: 'color', value: '#36B8C5', label: 'Dark · teal glint' },
    darkReading: { type: 'color', value: '#102D36', label: 'Dark · reading surface' },

    gradientDirection: { type: 'vec2', value: [-0.12, -0.3], label: 'Gradient direction' },
    gradientOffset: {
      type: 'float',
      value: 0.2,
      min: -0.5,
      max: 0.8,
      step: 0.01,
      label: 'Gradient offset',
    },
    lightPositionA: { type: 'vec2', value: [0.12, 0.1], label: 'Primary light position' },
    lightPositionB: { type: 'vec2', value: [0.72, 0.28], label: 'Secondary light position' },
    lightSpread: {
      type: 'float',
      value: 0.48,
      min: 0.1,
      max: 1,
      step: 0.01,
      label: 'Light spread',
    },
    lightIntensity: {
      type: 'float',
      value: 0.88,
      min: 0,
      max: 2,
      step: 0.01,
      label: 'Light intensity',
    },
    wanderAmount: { type: 'float', value: 1, min: 0, max: 2.5, step: 0.05, label: 'Light wander' },
    wanderSpeed: { type: 'float', value: 1, min: 0, max: 2.5, step: 0.05, label: 'Wander speed' },
    swashAmount: { type: 'float', value: 0.82, min: 0, max: 2, step: 0.05, label: 'Shore swash' },
    causticScale: { type: 'float', value: 8.5, min: 2, max: 20, step: 0.1, label: 'Caustic scale' },
    causticStrength: {
      type: 'float',
      value: 0.13,
      min: 0,
      max: 0.65,
      step: 0.01,
      label: 'Caustic strength',
    },

    frequencyA: { type: 'float', value: 3.15, min: 1, max: 12, step: 0.05, label: 'Frequency A' },
    frequencyB: { type: 'float', value: 5.05, min: 1, max: 12, step: 0.05, label: 'Frequency B' },
    nodeWidth: { type: 'float', value: 0.15, min: 0.03, max: 0.4, step: 0.01, label: 'Node width' },
    patternScale: {
      type: 'float',
      value: 1.04,
      min: 0.5,
      max: 2,
      step: 0.01,
      label: 'Pattern scale',
    },
    morphSpeed: {
      type: 'float',
      value: 0.1,
      min: 0,
      max: 0.5,
      step: 0.005,
      label: 'Cymatic breathing',
    },
    fusionStrength: {
      type: 'float',
      value: 0.9,
      min: 0,
      max: 1.5,
      step: 0.01,
      label: 'Light–node coupling',
    },
    grainSize: { type: 'float', value: 5.6, min: 3, max: 12, step: 0.1, label: 'Grain spacing' },
    grainDensity: {
      type: 'float',
      value: 0.78,
      min: 0,
      max: 1,
      step: 0.01,
      label: 'Cymatic grain density',
    },
    looseGrain: {
      type: 'float',
      value: 0.055,
      min: 0,
      max: 0.25,
      step: 0.005,
      label: 'Loose sand',
    },
    driftSpeed: { type: 'float', value: 0.4, min: 0, max: 2, step: 0.05, label: 'Sand drift' },
    pointerStrength: {
      type: 'float',
      value: 0.62,
      min: 0,
      max: 2,
      step: 0.05,
      label: 'Pointer vibration',
    },

    safeZoneCenter: { type: 'vec2', value: [0.5, 0.51], label: 'Reading zone centre' },
    safeZoneSize: { type: 'vec2', value: [0.43, 0.5], label: 'Reading zone size' },
    safeZoneStrength: {
      type: 'float',
      value: 0.84,
      min: 0,
      max: 1,
      step: 0.01,
      label: 'Reading zone calm',
    },
  },
};
