import type { ShaderDefinition } from '../../types';
import common from '../../glsl/common.glsl?raw';
import body from './fragment.glsl?raw';

/**
 * Shore — the designer's stable teal ocean-floor scene, rebuilt as one
 * fullscreen pass. The light and stipple layers share the same swash clock so
 * the particles feel suspended in the illuminated water rather than overlaid.
 */
export const veliGradientStipple: ShaderDefinition = {
  id: 'veli-gradient-stipple',
  label: 'Shore Gradient',
  fragment: `${common}\n${body}`,
  params: {
    // The dark values are the experiment's exact Shore OKLCH stops converted
    // to sRGB. The light values preserve its hue and depth ordering on a calm
    // surface that can carry dark homepage copy.
    lightDeep: { type: 'color', value: '#B7D9D9', label: 'Light · deep water' },
    lightMid: { type: 'color', value: '#D8EEEA', label: 'Light · shallow water' },
    lightShine: { type: 'color', value: '#FCFFFD', label: 'Light · caustic shine' },
    lightGrain: { type: 'color', value: '#2D7F84', label: 'Light · sand grain' },
    lightReading: { type: 'color', value: '#EAF4F0', label: 'Light · reading surface' },
    darkDeep: { type: 'color', value: '#022634', label: 'Dark · deep water' },
    darkMid: { type: 'color', value: '#47BFC3', label: 'Dark · shallow water' },
    darkShine: { type: 'color', value: '#DDFFFF', label: 'Dark · caustic shine' },
    darkGrain: { type: 'color', value: '#36B8C5', label: 'Dark · sand grain' },
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
    lightRadiusA: {
      type: 'float',
      value: 0.48,
      min: 0.1,
      max: 1,
      step: 0.01,
      label: 'Primary light spread',
    },
    lightRadiusB: {
      type: 'float',
      value: 0.46,
      min: 0.1,
      max: 1,
      step: 0.01,
      label: 'Secondary light spread',
    },
    lightIntensity: {
      type: 'float',
      value: 0.9,
      min: 0,
      max: 2,
      step: 0.01,
      label: 'Light intensity',
    },
    wanderAmount: { type: 'float', value: 1, min: 0, max: 2.5, step: 0.05, label: 'Light wander' },
    wanderSpeed: { type: 'float', value: 1, min: 0, max: 2.5, step: 0.05, label: 'Wander speed' },
    swashAmount: { type: 'float', value: 1, min: 0, max: 2, step: 0.05, label: 'Shore swash' },

    causticScale: { type: 'float', value: 8.5, min: 2, max: 20, step: 0.1, label: 'Caustic scale' },
    causticStrength: {
      type: 'float',
      value: 0.18,
      min: 0,
      max: 0.65,
      step: 0.01,
      label: 'Caustic strength',
    },
    causticSpeed: {
      type: 'float',
      value: 0.12,
      min: 0,
      max: 0.6,
      step: 0.01,
      label: 'Caustic speed',
    },
    grainSize: { type: 'float', value: 6.2, min: 3, max: 14, step: 0.1, label: 'Grain spacing' },
    grainDensity: {
      type: 'float',
      value: 0.36,
      min: 0,
      max: 1,
      step: 0.01,
      label: 'Grain density',
    },
    grainGlow: {
      type: 'float',
      value: 0.42,
      min: 0,
      max: 1,
      step: 0.01,
      label: 'Grain brightness',
    },
    driftSpeed: { type: 'float', value: 0.55, min: 0, max: 2, step: 0.05, label: 'Sand drift' },
    pointerStrength: {
      type: 'float',
      value: 0.55,
      min: 0,
      max: 2,
      step: 0.05,
      label: 'Pointer drift',
    },

    safeZoneCenter: { type: 'vec2', value: [0.5, 0.51], label: 'Reading zone centre' },
    safeZoneSize: { type: 'vec2', value: [0.43, 0.5], label: 'Reading zone size' },
    safeZoneStrength: {
      type: 'float',
      value: 0.8,
      min: 0,
      max: 1,
      step: 0.01,
      label: 'Reading zone calm',
    },
  },
};
