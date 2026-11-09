import fields from '../lib/design-fields.json';

// Artwork coordinates are read from Figma 2382:89507, relative to each clip.
// Keep the resting composition separate from the designer prototype's motion
// parameters so future timing changes cannot change the illustration itself.
const motion = {
  period: 16,
  drift: 2.2,
  lightReach: 130,
  lightLean: 11,
  waveSpeed: 240,
  waveWidth: 20,
  waveLife: 1.7,
  waveAmplitude: 7,
  windReach: 100,
  windShift: 35,
};

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
    if (!still && visible.size) raf = requestAnimationFrame(frame);
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
    let pointer: { x: number; y: number } | null = null;
    const ripples: Array<{ x: number; y: number; time: number }> = [];
    const point = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      return {
        x: ((event.clientX - box.left) / box.width) * data.width,
        y: ((event.clientY - box.top) / box.height) * data.height,
      };
    };
    let lastDrop = { x: -1000, y: -1000 };
    element.addEventListener('pointermove', (event) => {
      pointer = point(event);
      if (
        data.name === 'ocean' &&
        Math.hypot(pointer.x - lastDrop.x, pointer.y - lastDrop.y) > 46
      ) {
        ripples.push({ ...pointer, time: performance.now() / 1000 });
        lastDrop = pointer;
      }
      wake();
    });
    element.addEventListener('pointerleave', () => {
      pointer = null;
    });
    element.addEventListener('pointerdown', (event) => {
      ripples.push({ ...point(event), time: performance.now() / 1000 });
      wake();
    });
    const scene = {
      element,
      draw(time: number, still: boolean) {
        context.setTransform(canvas.width / data.width, 0, 0, canvas.height / data.height, 0, 0);
        context.clearRect(0, 0, data.width, data.height);
        if (!sprite.complete || !sprite.naturalWidth) return;
        while (ripples.length && time - ripples[0].time > motion.waveLife) ripples.shift();
        for (let i = 0; i < data.points.length; i++) {
          const [x, y] = data.points[i];
          let ox = still
            ? 0
            : Math.sin((time / motion.period) * Math.PI * 2 + y * 0.013 + i * 0.1) * motion.drift;
          let oy = still
            ? 0
            : Math.cos((time / motion.period) * Math.PI * 2 + x * 0.017) * motion.drift;
          let size = 1;
          if (!still && pointer) {
            const dx = pointer.x - x,
              dy = pointer.y - y,
              distance = Math.hypot(dx, dy) || 1;
            if (data.name === 'reef') {
              const amount = Math.max(0, 1 - distance / motion.lightReach);
              ox += (dx / distance) * amount * motion.lightLean;
              oy += (dy / distance) * amount * motion.lightLean;
              size += amount * 0.85;
            }
            if (data.name === 'wind') {
              const amount = Math.max(0, 1 - distance / motion.windReach);
              ox += amount * motion.windShift;
              oy -= amount * 10;
            }
          }
          if (!still && data.name === 'ocean') {
            for (const ripple of ripples) {
              const age = time - ripple.time,
                dx = x - ripple.x,
                dy = y - ripple.y,
                distance = Math.hypot(dx, dy) || 1;
              const u = (distance - motion.waveSpeed * age) / motion.waveWidth;
              const wave =
                -u *
                Math.exp(-u * u) *
                1.65 *
                motion.waveAmplitude *
                Math.max(0, 1 - age / motion.waveLife) ** 2;
              ox += (dx / distance) * wave;
              oy += (dy / distance) * wave;
            }
          }
          const width = data.dotWidth * size,
            height = data.dotHeight * size;
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
  window.addEventListener('veli:color-scheme-change', wake);
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(raf);
    raf = 0;
  });
  window.addEventListener('pageshow', wake);
  wake();
}
