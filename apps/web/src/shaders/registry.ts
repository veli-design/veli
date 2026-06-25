import type { ShaderDefinition } from './types';
import { veliAurora } from './definitions/veli-aurora';
import { veliDunes } from './definitions/veli-dunes';

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
  [veliDunes.id]: veliDunes,
} satisfies Record<string, ShaderDefinition>;

export type ShaderId = keyof typeof shaderRegistry;

export const DEFAULT_SHADER: ShaderId = veliAurora.id;

export function getShader(id: string): ShaderDefinition | undefined {
  return shaderRegistry[id as ShaderId];
}
