'use client';

import { useEffect, useRef, useState } from 'react';
import { useVeliColorScheme } from '@veli-design/react/provider';
import { createErrorArtwork, type BakedArtwork } from './error-artwork-engine';
import offlineArtwork from './artwork-data/offline';
import type { ErrorPageArtworkLabels, ErrorPageKind } from './types';

const loaders = {
  '401': () => import('./artwork-data/401'),
  '403': () => import('./artwork-data/403'),
  '404': () => import('./artwork-data/404'),
  '500': () => import('./artwork-data/500'),
  '503': () => import('./artwork-data/503'),
  offline: () => Promise.resolve({ default: offlineArtwork }),
};
const compactClasses: Record<ErrorPageKind, string> = {
  '404': 'aspect-[740/331]',
  '500': 'max-w-[302px] aspect-[302/315]',
  '503': 'max-w-[314px] aspect-[314/321]',
  '403': 'max-w-[302px] aspect-[302/316]',
  '401': 'max-w-[315px] aspect-[315/323]',
  offline: 'max-w-[336px] aspect-[336/289]',
};
const focusClass =
  'outline-none focus-visible:ring-2 focus-visible:ring-border-focus forced-colors:focus-visible:outline-2';

export function ErrorArtwork({
  kind,
  animation,
  labels,
}: {
  kind: ErrorPageKind;
  animation: 'auto' | 'static';
  labels: ErrorPageArtworkLabels;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<ReturnType<typeof createErrorArtwork>>(null);
  const [ready, setReady] = useState(false);
  const { resolvedColorScheme } = useVeliColorScheme();

  useEffect(() => {
    let cancelled = false;
    let instance: ReturnType<typeof createErrorArtwork> = null;
    void loaders[kind]()
      .then(({ default: data }: { default: BakedArtwork }) => {
        if (cancelled || !canvas.current) return;
        instance = createErrorArtwork(canvas.current, kind, data, animation === 'static');
        engine.current = instance;
        setReady(instance !== null);
      })
      .catch(() => {
        // Text and recovery actions remain usable if an artwork chunk cannot load.
      });
    return () => {
      cancelled = true;
      instance?.dispose();
      engine.current = null;
    };
  }, [kind, animation]);

  useEffect(() => {
    engine.current?.refreshPalette();
  }, [resolvedColorScheme]);

  const interactive = ready && animation === 'auto';
  return (
    <div
      className="veli-error-artwork @container relative mt-12 w-full md:mt-11"
      data-ready={ready}
    >
      <div
        className={`relative mx-auto w-full ${compactClasses[kind]} @[768px]:aspect-[936/380] @[768px]:max-w-none`}
      >
        <canvas
          ref={canvas}
          width={936}
          height={380}
          aria-hidden="true"
          className="pointer-events-none block size-full"
        />
        {interactive && (
          <button
            type="button"
            aria-label={labels.changeStyle}
            className={`absolute inset-0 w-full cursor-pointer rounded-xl ${focusClass}`}
            onClick={(event) =>
              engine.current?.next(
                event.detail > 0
                  ? engine.current.position(event.clientX, event.clientY)
                  : undefined,
              )
            }
            onPointerMove={(event) =>
              engine.current?.point(engine.current.position(event.clientX, event.clientY) ?? null)
            }
            onPointerLeave={() => engine.current?.point(null)}
            onBlur={() => engine.current?.point(null)}
          />
        )}
      </div>
    </div>
  );
}
