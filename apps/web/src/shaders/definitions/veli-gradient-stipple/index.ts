import type { ShaderDefinition } from '../../types';

/**
 * Registry marker for the designer's original Stipple BG document. Unlike the
 * other registered effects, ShaderBackground hosts this definition through
 * `/gradient-stipple.html` so its two-pass renderer and CPU particle model stay
 * identical to the supplied experiment.
 */
export const veliGradientStipple: ShaderDefinition = {
  id: 'veli-gradient-stipple',
  label: 'Stipple BG · Original',
  fragment: '',
  params: {},
};
