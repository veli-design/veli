'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { DotLottie } from '@lottiefiles/dotlottie-web';
import { useVeliColorScheme } from '@veli-design/react/provider';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
const getReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;
const getServerReducedMotion = () => true;
const fallbackUrl = new URL('./notification-empty.svg', import.meta.url).href;

function subscribeToReducedMotion(callback: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

type Segment = 'intro' | 'hover' | 'unhover';

function playSegment(player: DotLottie, segment: Segment, still = false) {
  player.pause();
  player.setMarker(segment);
  const bounds = player.segment;
  if (!bounds) return;
  const [start, end] = bounds;
  player.setFrame(still ? end - 1 : start);
  if (!still) player.play();
}

export function NotificationEmptyArtwork({ replayLabel }: { replayLabel: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<DotLottie | null>(null);
  const { resolvedColorScheme } = useVeliColorScheme();
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );
  const variant = `${resolvedColorScheme}-${reducedMotion}`;
  const [loadedVariant, setLoadedVariant] = useState<string>();
  const ready = loadedVariant === variant;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let player: DotLottie | undefined;

    void import('@lottiefiles/dotlottie-web')
      .then(({ DotLottie }) => {
        if (cancelled) return;
        DotLottie.setWasmUrl(
          new URL('@lottiefiles/dotlottie-web/dotlottie-player.wasm', import.meta.url).href,
        );
        const instance = new DotLottie({
          canvas,
          src: new URL('./notifications-empty.lottie', import.meta.url).href,
          autoplay: false,
          loop: false,
          renderConfig: { autoResize: true },
        });
        player = instance;
        instance.addEventListener('load', () => {
          if (cancelled) return;
          // The archive initially loads its first animation.
          if (instance.activeAnimationId !== resolvedColorScheme) {
            instance.loadAnimation(resolvedColorScheme);
            return;
          }
          playSegment(instance, 'intro', reducedMotion);
          playerRef.current = instance;
          setLoadedVariant(variant);
        });
        instance.addEventListener('renderError', () => {
          if (cancelled) return;
          playerRef.current = null;
          setLoadedVariant(undefined);
        });
      })
      .catch(() => {
        // Leave the static artwork visible if the player cannot be loaded.
      });

    return () => {
      cancelled = true;
      playerRef.current = null;
      player?.destroy();
    };
  }, [reducedMotion, resolvedColorScheme, variant]);

  function play(segment: Segment) {
    if (!getReducedMotion() && playerRef.current) playSegment(playerRef.current, segment);
  }

  return (
    <div className="relative aspect-[4/3] w-[154.667px] max-w-full shrink-0">
      {!ready && (
        <img
          src={fallbackUrl}
          alt=""
          className={`block size-full ${resolvedColorScheme === 'dark' ? 'brightness-25' : ''}`}
        />
      )}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 block size-full ${ready ? '' : 'opacity-0'}`}
      />
      {ready && !reducedMotion && (
        <button
          type="button"
          aria-label={replayLabel}
          className="absolute inset-0 cursor-default rounded-lg focus-visible:outline-2 focus-visible:outline-border-focus"
          onPointerEnter={(event) => {
            if (event.pointerType !== 'touch') play('hover');
          }}
          onPointerLeave={(event) => {
            if (event.pointerType !== 'touch') play('unhover');
          }}
          onClick={() => play('intro')}
        />
      )}
    </div>
  );
}
