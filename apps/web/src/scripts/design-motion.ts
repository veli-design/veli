import fields from '../lib/design-fields.json';

// Artwork coordinates are read from Figma 2382:89507, relative to each clip.
// These canvases provide the resting force fields and ambient hero/closing.
// Interactive card motion is owned by the deferred designer preview module.
const ambient = { period: 16, drift: 2.2 };
const HERO = {
  T: 6,
  waves: 2,
  waveAmp: 7,
  waveLen: 300,
  waveLift: 0.35,
  amp: [0.6, 1.4],
  lag: 1.2,
  wander: [1, 3],
};
const TAU = Math.PI * 2;
export function initDesignMotion() {
  const root = document.documentElement;
  const reduced = () =>
    root.dataset.reducedMotion === 'true' ||
    (root.dataset.reducedMotion === undefined &&
      matchMedia('(prefers-reduced-motion: reduce)').matches);
  const visible = new Set<Element>();
  const systemCard = document.querySelector<HTMLElement>('[data-design-one-system]');
  let systemCardVisible = false;
  const scenes: Array<{ element: HTMLElement; draw: (time: number, still: boolean) => void }> = [];
  // Keep the designer's seeded stream: hero grains are sampled before the forces.
  let heroSeed = 2024;
  const random = () => (heroSeed = (heroSeed * 16807) % 2147483647) / 2147483647;
  const heroGrains = fields
    .find((field) => field.name === 'hero')!
    .points.map(() => ({
      amp: HERO.amp[0] + random() * (HERO.amp[1] - HERO.amp[0]),
      lag: (random() - 0.5) * HERO.lag,
      wr: HERO.wander[0] + random() * (HERO.wander[1] - HERO.wander[0]),
      f1: 1 + Math.floor(random() * 3),
      f2: 1 + Math.floor(random() * 3),
      p1: random() * TAU,
      p2: random() * TAU,
    }));
  let raf = 0;
  function wake() {
    systemCard?.toggleAttribute(
      'data-animating',
      systemCardVisible && !document.hidden && !reduced(),
    );
    if (!raf) raf = requestAnimationFrame(frame);
  }
  if (systemCard) {
    new IntersectionObserver(([entry]) => {
      systemCardVisible = entry.isIntersecting;
      wake();
    }).observe(systemCard);
  }
  function frame(timestamp: number) {
    raf = 0;
    if (document.hidden) return;
    const still = reduced();
    for (const scene of scenes) {
      if (visible.has(scene.element)) scene.draw(timestamp / 1000, still);
    }
    if (
      !still &&
      scenes.some(
        (scene) => visible.has(scene.element) && scene.element instanceof HTMLCanvasElement,
      )
    )
      raf = requestAnimationFrame(frame);
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    wake();
  });

  document.querySelectorAll<HTMLElement>('[data-design-field]').forEach((element) => {
    const data = fields.find((field) => field.name === element.dataset.designField);
    const canvas = element instanceof HTMLCanvasElement ? element : element.querySelector('canvas');
    const context = canvas?.getContext('2d');
    if (!data || !canvas || !context) return;
    const sprite = new Image();
    let cachedSprite: CanvasImageSource | null = null;
    sprite.src = `/images/marketing/${data.sprite}`;
    const scene = {
      element,
      draw(time: number, still: boolean) {
        if (!still && element.dataset.designPreviewReady === 'true') return;
        context.setTransform(canvas.width / data.width, 0, 0, canvas.height / data.height, 0, 0);
        context.clearRect(0, 0, data.width, data.height);
        if (!cachedSprite) return;
        const animate = !still && element instanceof HTMLCanvasElement;
        const hero = data.name === 'hero';
        const phase = (time % HERO.T) / HERO.T;
        for (let i = 0; i < data.points.length; i++) {
          const [x, y] = data.points[i];
          let ox = 0,
            oy = 0;
          if (animate && hero) {
            const grain = heroGrains[i];
            const wave = Math.sin(TAU * phase * HERO.waves - (TAU * x) / HERO.waveLen + grain.lag);
            ox = grain.wr * Math.sin(TAU * phase * grain.f1 + grain.p1);
            oy =
              grain.wr * Math.sin(TAU * phase * grain.f2 + grain.p2) -
              HERO.waveAmp * grain.amp * wave;
            context.globalAlpha = 1 - (HERO.waveLift * (1 - wave)) / 2;
          } else if (animate) {
            ox =
              Math.sin((time / ambient.period) * Math.PI * 2 + y * 0.013 + i * 0.1) * ambient.drift;
            oy = Math.cos((time / ambient.period) * Math.PI * 2 + x * 0.017) * ambient.drift;
          }
          const width = data.dotWidth,
            height = data.dotHeight;
          context.drawImage(cachedSprite, x + ox - width / 2, y + oy - height / 2, width, height);
        }
        context.globalAlpha = 1;
      },
    };
    scenes.push(scene);
    sprite.onload = () => {
      // Rasterize each dot once instead of drawing an SVG for every grain.
      // The oversampled 32px bitmap stays sharp at the capped 2x DPR.
      const bitmap = document.createElement('canvas');
      bitmap.width = 32;
      bitmap.height = Math.max(1, Math.round((32 * data.dotHeight) / data.dotWidth));
      const bitmapContext = bitmap.getContext('2d');
      if (bitmapContext) {
        bitmapContext.drawImage(sprite, 0, 0, bitmap.width, bitmap.height);
        cachedSprite = bitmap;
      } else cachedSprite = sprite;
      scene.draw(0, true);
      wake();
    };
    new ResizeObserver(() => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      scene.draw(0, true);
      wake();
    }).observe(canvas);
    observer.observe(element);
  });

  // Scale composed illustrations as a unit, preserving every source SVG's
  // aspect ratio and layer position inside the artwork's own clip.
  for (const [selector, property, width] of [
    ['.design-atoll', '--art-scale', 1349],
    ['.design-thaana', '--thaana-scale', 1349],
    ['.design-motion-demo', '--motion-scale', 1352],
  ] as const) {
    const element = document.querySelector<HTMLElement>(selector);
    if (!element) continue;
    new ResizeObserver(() => {
      element.style.setProperty(property, String(element.clientWidth / width));
      if (selector === '.design-motion-demo') {
        element.style.setProperty(
          '--mobile-motion-scale',
          String(Math.min(1, element.clientWidth / 382)),
        );
      }
    }).observe(element);
  }
  document.addEventListener('visibilitychange', wake);
  window.addEventListener('veli:motion-change', wake);
  window.addEventListener('veli:design-previews-ready', wake);
  window.addEventListener('veli:color-scheme-change', wake);
  window.addEventListener('pagehide', () => {
    systemCard?.removeAttribute('data-animating');
    cancelAnimationFrame(raf);
    raf = 0;
  });
  window.addEventListener('pageshow', wake);
  // Fetch the interactive layers as the first previews approach the viewport.
  // Stills preserve the composition while loading and when motion is reduced.
  const previews = document.querySelectorAll(
    '.design-forces, .design-atoll, .design-crystalline, .design-motion-demo, .design-thaana',
  );
  if (previews.length) {
    const preload = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          preload.disconnect();
          void import('./design-previews.js').then(({ initDesignPreviews }) =>
            initDesignPreviews(heroSeed),
          );
        }
      },
      { rootMargin: '600px' },
    );
    previews.forEach((preview) => preload.observe(preview));
  }
  wake();
}
