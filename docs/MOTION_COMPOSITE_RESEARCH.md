# Motion Composite Research

This note preserves the PD-320 research for later work. It is intentionally not part of the current shipped token surface, because designers asked us to publish only primitive easing, duration, and delay tokens for now.

## Current Boundary

Ship now:

- `ease/out`, `ease/in`, `ease/in-out`, `ease/spring`, `ease/linear`
- `duration/instant`, `duration/fast`, `duration/normal`, `duration/slow`, `duration/slower`, `duration/slowest`
- `delay/none`, `delay/fast`, `delay/normal`, `delay/slow`

Defer:

- `--animate-*` Tailwind recipes
- `@keyframes veli-*`
- Motion for React transition objects
- component-specific motion aliases such as enter, exit, reveal, collapse, press, or stagger

## Tailwind CSS Composite Approach

Tailwind v4 supports animation recipes through `--animate-*` theme variables. A future pass can compose finalized design aliases from the primitives:

```css
@theme {
  --animate-fade-in: veli-fade-in var(--duration-normal) var(--ease-out) both;
  --animate-fade-out: veli-fade-out var(--duration-fast) var(--ease-in) both;
  --animate-scale-in: veli-scale-in var(--duration-normal) var(--ease-spring) both;
  --animate-scale-out: veli-scale-out var(--duration-fast) var(--ease-in) both;

  @keyframes veli-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes veli-fade-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes veli-scale-in {
    from {
      opacity: 0;
      transform: scale(0.98);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes veli-scale-out {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.98);
    }
  }
}
```

Directional overlay recipes can follow the same pattern:

```css
@theme {
  --animate-slide-in-from-top: veli-slide-in-from-top var(--duration-normal) var(--ease-out) both;
  --animate-slide-out-to-top: veli-slide-out-to-top var(--duration-fast) var(--ease-in) both;

  @keyframes veli-slide-in-from-top {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes veli-slide-out-to-top {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-4px);
    }
  }
}
```

If these are added, keep them in `packages/tokens/postbuild.js` or move them to token-generated output only after the Figma source contains stable composite aliases.

## Motion For React Approach

Motion for React uses seconds for duration and arrays for cubic-bezier easing. A future `@tradenetcorp/veli-ui/motion` export can expose primitives and named transition recipes:

```ts
export const veliMotionEasings = {
  out: [0, 0, 0.2, 1],
  in: [0.4, 0, 1, 1],
  inOut: [0.4, 0, 0.2, 1],
  spring: [0.34, 1.56, 0.64, 1],
  linear: 'linear',
} as const;

export const veliMotionDurations = {
  instant: 0,
  fast: 0.08,
  normal: 0.2,
  slow: 0.35,
  slower: 0.5,
  slowest: 1.2,
} as const;

export const veliMotionDelays = {
  none: 0,
  fast: 0.04,
  normal: 0.08,
  slow: 0.12,
} as const;

export const veliMotionTransitions = {
  enter: {
    type: 'tween',
    duration: veliMotionDurations.normal,
    ease: veliMotionEasings.out,
  },
  exit: {
    type: 'tween',
    duration: veliMotionDurations.fast,
    ease: veliMotionEasings.in,
  },
  move: {
    type: 'tween',
    duration: veliMotionDurations.normal,
    ease: veliMotionEasings.inOut,
  },
  spring: {
    type: 'tween',
    duration: veliMotionDurations.normal,
    ease: veliMotionEasings.spring,
  },
} as const;
```

Default app-level configuration can be layered with Motion's `MotionConfig`:

```tsx
import { MotionConfig, motion } from 'motion/react';
import { veliMotionTransitions } from '@tradenetcorp/veli-ui/motion';

export function Example() {
  return (
    <MotionConfig reducedMotion="user" transition={veliMotionTransitions.enter}>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={veliMotionTransitions.enter}
      />
    </MotionConfig>
  );
}
```

## Follow-Up Guidance

When designers finalize aliases, add composite tokens only if the names are stable across CSS transitions, CSS keyframes, and Motion for React.

Good follow-up checks:

- Each alias references primitive values rather than duplicating cubic-bezier or millisecond literals.
- CSS `animate-*` utilities are backed by emitted `--animate-*` variables and `@keyframes`.
- Motion for React helpers use seconds, not milliseconds.
- Reduced-motion behavior is explicit for overlays and high-motion transforms.
- Component migrations preserve React Aria exit/unmount timing where applicable.
