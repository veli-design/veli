import fields from '../lib/design-fields.json';

// Artwork coordinates are read from Figma 2382:89507, relative to each clip.
// These canvases provide the resting force fields and ambient hero/closing.
// Interactive card motion is owned by the deferred designer preview module.
const ambient = { period: 16, drift: 2.2 };
export function initDesignMotion() {
  const root = document.documentElement;
  const reduced = () =>
    root.dataset.reducedMotion === 'true' ||
    (root.dataset.reducedMotion === undefined &&
      matchMedia('(prefers-reduced-motion: reduce)').matches);
  const visible = new Set<Element>();
  const scenes: Array<{ element: HTMLElement; draw: (time: number, still: boolean) => void }> = [];
  let raf = 0;
  function wake() {
    if (!raf) raf = requestAnimationFrame(frame);
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
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      wake();
    },
    { rootMargin: '120px' },
  );

  document.querySelectorAll<HTMLElement>('[data-design-field]').forEach((element) => {
    const data = fields.find((field) => field.name === element.dataset.designField);
    const canvas = element instanceof HTMLCanvasElement ? element : element.querySelector('canvas');
    const context = canvas?.getContext('2d');
    if (!data || !canvas || !context) return;
    const sprite = new Image();
    sprite.src = `/images/marketing/${data.sprite}`;
    const scene = {
      element,
      draw(time: number, still: boolean) {
        if (!still && element.dataset.designPreviewReady === 'true') return;
        context.setTransform(canvas.width / data.width, 0, 0, canvas.height / data.height, 0, 0);
        context.clearRect(0, 0, data.width, data.height);
        if (!sprite.complete || !sprite.naturalWidth) return;
        const animate = !still && element instanceof HTMLCanvasElement;
        for (let i = 0; i < data.points.length; i++) {
          const [x, y] = data.points[i];
          const ox = animate
            ? Math.sin((time / ambient.period) * Math.PI * 2 + y * 0.013 + i * 0.1) * ambient.drift
            : 0;
          const oy = animate
            ? Math.cos((time / ambient.period) * Math.PI * 2 + x * 0.017) * ambient.drift
            : 0;
          const width = data.dotWidth,
            height = data.dotHeight;
          context.drawImage(sprite, x + ox - width / 2, y + oy - height / 2, width, height);
        }
      },
    };
    scenes.push(scene);
    sprite.onload = () => {
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
            initDesignPreviews(),
          );
        }
      },
      { rootMargin: '600px' },
    );
    previews.forEach((preview) => preload.observe(preview));
  }
  wake();
}
