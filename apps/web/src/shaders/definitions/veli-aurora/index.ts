import type { ShaderDefinition } from '../../types';
import common from '../../glsl/common.glsl?raw';
import body from './fragment.glsl?raw';

/**
 * Veli Aurora — recreation of the shaders.com homepage background.
 *
 * Every param below maps 1:1 to a shaders.com editor control, so the look can
 * be retuned here without touching GLSL. Each becomes a `u_<name>` uniform
 * (see fragment.glsl). Angles are stored in degrees for readability and
 * converted to radians by the renderer where the shader expects radians — see
 * the `*Angle` params (kept in degrees; the shader treats them as radians, so
 * they're pre-converted below).
 *
 * Source: https://shaders.com/design-editor/4727705
 */
export const veliAurora: ShaderDefinition = {
  id: 'veli-aurora',
  label: 'Veli Aurora',
  fragment: `${common}\n${body}`,
  params: {
    // 1. Swirl ---------------------------------------------------------------
    swirlColorA: { type: 'color', value: '#D6E1F6', label: 'Swirl colour A (cool blue)' },
    swirlColorB: { type: 'color', value: '#FEF6ED', label: 'Swirl colour B (warm cream)' },
    swirlDetail: { type: 'float', value: 1.5, min: 0, max: 3, step: 0.1, label: 'Swirl detail' },
    // shaders.com Blend is 0..100; stored normalised here.
    swirlBlend: { type: 'float', value: 0.5, min: 0, max: 1, step: 0.01, label: 'Swirl blend' },
    swirlSpeed: { type: 'float', value: 0.8, min: 0, max: 3, step: 0.05, label: 'Swirl speed' },

    // 2. Liquify -------------------------------------------------------------
    liquifyIntensity: {
      type: 'float',
      value: 10,
      min: 0,
      max: 40,
      step: 1,
      label: 'Liquify intensity',
    },
    liquifyRadius: {
      type: 'float',
      value: 1,
      min: 0.1,
      max: 3,
      step: 0.05,
      label: 'Liquify radius',
    },

    // 3. Halftone ------------------------------------------------------------
    halftoneFrequency: {
      type: 'float',
      value: 155,
      min: 10,
      max: 400,
      step: 1,
      label: 'Halftone frequency',
    },
    halftoneAngle: { type: 'float', value: (45 * Math.PI) / 180, label: 'Halftone angle (rad)' },
    halftoneOpacity: {
      type: 'float',
      value: 0.4,
      min: 0,
      max: 1,
      step: 0.01,
      label: 'Halftone opacity',
    },

    // 4. Chromatic aberration -----------------------------------------------
    caStrength: { type: 'float', value: 0.75, min: 0, max: 3, step: 0.05, label: 'CA strength' },
    caAngle: { type: 'float', value: (170 * Math.PI) / 180, label: 'CA angle (rad)' },
    caOffsets: { type: 'vec3', value: [-1.2, 0.4, -0.4], label: 'CA R/G/B offsets' },
    caOpacity: { type: 'float', value: 0.48, min: 0, max: 1, step: 0.01, label: 'CA opacity' },

    // 5. Film grain ----------------------------------------------------------
    grainStrength: {
      type: 'float',
      value: 0.8,
      min: 0,
      max: 2,
      step: 0.05,
      label: 'Grain strength',
    },
    grainBias: { type: 'float', value: 5, min: 1, max: 10, step: 0.5, label: 'Grain bias' },

    // 6. Fractal noise -------------------------------------------------------
    fnColorA: { type: 'color', value: '#FEF6ED', label: 'Fractal noise colour A' },
    fnColorB: { type: 'color', value: '#000000', label: 'Fractal noise colour B' },
    fnOctaves: { type: 'float', value: 8, min: 1, max: 8, step: 1, label: 'Fractal octaves' },
    fnDetail: { type: 'float', value: 3.8, min: 0.5, max: 10, step: 0.1, label: 'Fractal detail' },
    fnContrast: { type: 'float', value: 1, min: 0, max: 3, step: 0.05, label: 'Fractal contrast' },
    fnAngle: { type: 'float', value: (90 * Math.PI) / 180, label: 'Fractal angle (rad)' },
    fnSeed: { type: 'float', value: 47, min: 0, max: 200, step: 1, label: 'Fractal seed' },
    fnSpeed: { type: 'float', value: 1, min: 0, max: 3, step: 0.05, label: 'Fractal speed' },
    fnOpacity: { type: 'float', value: 0.5, min: 0, max: 1, step: 0.01, label: 'Fractal opacity' },
  },
};
