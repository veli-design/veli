import type { ShaderDefinition } from '../../types';
import common from '../../glsl/common.glsl?raw';
import body from './fragment.glsl?raw';

/**
 * Veli Dunes — flowing Maldivian white-sand dunes.
 *
 * A from-scratch alternative background (see fragment.glsl for the layer
 * breakdown). Every knob below maps to a `u_<name>` uniform, so the look is
 * retunable here without touching GLSL.
 *
 * Colours are sampled from the designer reference: warm cream highlights in
 * the upper-right falling to cool periwinkle shadow in the lower-left — the
 * white sand of a Maldivian beach rather than desert dune.
 */
export const veliDunes: ShaderDefinition = {
  id: 'veli-dunes',
  label: 'Veli Dunes',
  fragment: `${common}\n${body}`,
  params: {
    // Sand palette --------------------------------------------------------
    sandLight: { type: 'color', value: '#FBF7F0', label: 'Lit crest (warm white)' },
    sandWarm: { type: 'color', value: '#FBEFE0', label: 'Sunlit highlight (cream)' },
    sandBlue: { type: 'color', value: '#C2CEEC', label: 'Mid tone (periwinkle)' },
    sandShadow: { type: 'color', value: '#9DB0DC', label: 'Lee shadow (blue)' },

    // Dune field ----------------------------------------------------------
    duneScale: { type: 'float', value: 3.2, min: 0.5, max: 6, step: 0.1, label: 'Dune scale' },
    duneWarp: { type: 'float', value: 1.4, min: 0, max: 4, step: 0.1, label: 'Dune warp' },
    flowSpeed: {
      type: 'float',
      value: 0.06,
      min: 0,
      max: 0.5,
      step: 0.01,
      label: 'Dune flow speed',
    },
    windDir: { type: 'vec2', value: [1.0, -0.35], label: 'Wind direction' },

    // Flowing grain -------------------------------------------------------
    grainScale: { type: 'float', value: 60, min: 10, max: 200, step: 1, label: 'Grain scale' },
    grainFlow: { type: 'float', value: 0.5, min: 0, max: 3, step: 0.05, label: 'Grain flow speed' },
    grainStrength: {
      type: 'float',
      value: 0.1,
      min: 0,
      max: 0.4,
      step: 0.01,
      label: 'Grain strength',
    },

    // Drift sand ----------------------------------------------------------
    driftAmount: {
      type: 'float',
      value: 0.7,
      min: 0,
      max: 2,
      step: 0.05,
      label: 'Drift sand amount',
    },
    driftSpeed: {
      type: 'float',
      value: 0.9,
      min: 0,
      max: 4,
      step: 0.05,
      label: 'Drift sand speed',
    },
    pointerStrength: {
      type: 'float',
      value: 1.0,
      min: 0,
      max: 3,
      step: 0.05,
      label: 'Pointer disturbance',
    },
  },
};
