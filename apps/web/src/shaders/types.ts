/**
 * Shared types for the swappable shader-background system.
 *
 * A "shader definition" is a self-contained background effect: a fragment
 * shader plus the set of tweakable parameters it exposes. The runtime renderer
 * (`runtime/renderer.ts`) knows nothing about any specific effect — it only
 * binds these params to GLSL uniforms — so adding a new background is just a
 * matter of writing a new definition and registering it.
 */

/** Kinds of values a parameter can hold, mapped to GLSL uniform types. */
export type ParamType = 'float' | 'vec2' | 'vec3' | 'color';

/**
 * A single tweakable parameter. The `value` is the default; `min`/`max`/`step`
 * are advisory metadata for any future tweaking UI (a debug panel, etc.) and
 * are ignored by the renderer.
 *
 * `color` params accept a hex string (e.g. `#D6E1F6`). They are converted to
 * linear-light RGB before being uploaded, so shaders always receive linear
 * colours and can mix them correctly (e.g. in OKLab).
 */
export type ParamValue = number | [number, number] | [number, number, number] | string;

export interface ParamSpec {
  type: ParamType;
  value: ParamValue;
  min?: number;
  max?: number;
  step?: number;
  /** Human label for a future debug/tweak panel. */
  label?: string;
}

export type ParamMap = Record<string, ParamSpec>;

export interface ShaderDefinition {
  /** Stable id used in the registry and as the `data-shader` attribute value. */
  id: string;
  /** Human-friendly name. */
  label: string;
  /**
   * Fragment shader source (GLSL ES 1.00). Must declare a `uniform` for every
   * param in `params` named `u_<paramName>`, plus it may use the built-in
   * uniforms documented in `runtime/renderer.ts`.
   */
  fragment: string;
  /** Tweakable parameters, keyed by name. Bound to `u_<name>` uniforms. */
  params: ParamMap;
}
