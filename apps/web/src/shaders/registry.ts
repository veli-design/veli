import type { ShaderDefinition } from './types';
import { veliAurora } from './definitions/veli-aurora';
import { veliCymatics } from './definitions/veli-cymatics';
import { veliCymaticsGradient } from './definitions/veli-cymatics-gradient';
import { veliDunes } from './definitions/veli-dunes';
import { veliGradientStipple } from './definitions/veli-gradient-stipple';

/**
 * All available background shaders, keyed by id.
 *
 * To add an alternative background:
 *   1. Create `definitions/<name>/{fragment.glsl, index.ts}` (copy veli-aurora).
 *   2. Import its definition here and add it to the map below.
 *   3. Point `<ShaderBackground shader="...">` at its id (or set DEFAULT_SHADER).
 */
export const shaderRegistry = {
  [veliAurora.id]: veliAurora,
  [veliCymatics.id]: veliCymatics,
  [veliGradientStipple.id]: veliGradientStipple,
  [veliCymaticsGradient.id]: veliCymaticsGradient,
  [veliDunes.id]: veliDunes,
} satisfies Record<string, ShaderDefinition>;

export type ShaderId = keyof typeof shaderRegistry;

export const DEFAULT_SHADER: ShaderId = veliCymaticsGradient.id;

/** Deliberately excludes Aurora and Dunes from the PD-784 tuning switcher. */
export const PD784_SHADER_IDS = [
  veliCymatics.id,
  veliGradientStipple.id,
  veliCymaticsGradient.id,
] as const satisfies readonly ShaderId[];

export function getShader(id: string): ShaderDefinition | undefined {
  return shaderRegistry[id as ShaderId];
}
