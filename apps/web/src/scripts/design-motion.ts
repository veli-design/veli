import fields from '../lib/force-fields.json';

// Parameters from the designer’s interactive preview. Scene-local controls let
// future timing and artwork updates land without changing page content or URLs.
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
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      wake();
    },
    { rootMargin: '120px' },
  );

  document.querySelectorAll<HTMLElement>('[data-force]').forEach((element) => {
    const data = fields.find((field) => field.name === element.dataset.force);
    const canvas = element.querySelector('canvas')!;
    const context = canvas.getContext('2d');
    if (!data || !context) return;
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
    scenes.push({
      element,
      draw(time, still) {
        const scale = canvas.width / data.width;
        context.setTransform(scale, 0, 0, canvas.height / data.height, 0, 0);
        context.clearRect(0, 0, data.width, data.height);
        const tint =
          data.name === 'reef' ? '197,90,215' : data.name === 'ocean' ? '50,156,245' : '58,173,161';
        while (ripples.length && time - ripples[0].time > motion.waveLife) ripples.shift();
        for (let i = 0; i < data.points.length; i++) {
          const [x, y] = data.points[i];
          let ox = still
            ? 0
            : Math.sin((time / motion.period) * Math.PI * 2 + y * 0.013 + i * 0.1) * motion.drift;
          let oy = still
            ? 0
            : Math.cos((time / motion.period) * Math.PI * 2 + x * 0.017) * motion.drift;
          let radius = 1.6;
          if (!still && pointer) {
            const dx = pointer.x - x,
              dy = pointer.y - y,
              distance = Math.hypot(dx, dy) || 1;
            const amount = Math.max(0, 1 - distance / motion.lightReach);
            if (data.name === 'reef') {
              ox += (dx / distance) * amount * motion.lightLean;
              oy += (dy / distance) * amount * motion.lightLean;
              radius *= 1 + amount * 0.85;
            }
            if (data.name === 'wind') {
              const wind = Math.max(0, 1 - distance / motion.windReach);
              ox += wind * motion.windShift;
              oy -= wind * 10;
            }
          }
          if (!still && data.name === 'ocean')
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
          context.fillStyle = `rgba(${tint},${root.dataset.theme === 'dark' ? 0.4 : 0.22})`;
          context.beginPath();
          context.arc(x + ox, y + oy, radius, 0, Math.PI * 2);
          context.fill();
        }
      },
    });
    const resize = new ResizeObserver(() => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(element.clientWidth * dpr);
      canvas.height = Math.round(element.clientHeight * dpr);
      wake();
    });
    resize.observe(element);
  });

  document.querySelectorAll<HTMLCanvasElement>('[data-design-stipple]').forEach((canvas) => {
    const element = canvas.parentElement!;
    const context = canvas.getContext('2d');
    if (!context) return;
    const closing = element.classList.contains('design-closing');
    scenes.push({
      element,
      draw(time, still) {
        const w = canvas.width,
          h = canvas.height;
        context.clearRect(0, 0, w, h);
        const dpr = Math.min(devicePixelRatio || 1, 2);
        for (let i = 0; i < 1300; i++) {
          const x = ((((Math.sin(i * 127.1) * 43758.5453) % 1) + 1) % 1) * w;
          const y = ((((Math.sin(i * 311.7) * 9631.517) % 1) + 1) % 1) * h;
          const phase = still ? 0 : time * 0.12;
          const band = Math.sin((x / w) * 7 + Math.sin((y / h) * 4 + phase) * 2.2);
          if (band < 0.35) continue;
          context.fillStyle = closing ? 'rgba(154,243,102,.58)' : 'rgba(150,154,145,.22)';
          context.beginPath();
          context.arc(
            x + (still ? 0 : Math.sin(i + time * 0.2) * dpr * 2),
            y,
            1.4 * dpr,
            0,
            Math.PI * 2,
          );
          context.fill();
        }
      },
    });
    new ResizeObserver(() => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      wake();
    }).observe(canvas);
  });
  const sceneVisibility = new IntersectionObserver((entries) =>
    entries.forEach((entry) => {
      (entry.target as HTMLElement).dataset.sceneVisible = String(entry.isIntersecting);
    }),
  );
  document
    .querySelectorAll('[data-design-scene]')
    .forEach((element) => sceneVisibility.observe(element));
  const atoll = document.querySelector<HTMLElement>('.design-atoll');
  if (atoll)
    new ResizeObserver(() =>
      atoll.style.setProperty('--art-scale', String(atoll.clientWidth / 1349)),
    ).observe(atoll);
  const thaana = document.querySelector<HTMLElement>('.design-thaana');
  if (thaana)
    new ResizeObserver(() =>
      thaana.style.setProperty('--thaana-scale', String(thaana.clientWidth / 1349)),
    ).observe(thaana);
  thaana?.addEventListener('pointermove', (event) => {
    if (reduced()) return;
    const box = thaana.getBoundingClientRect();
    thaana.style.setProperty(
      '--thaana-x',
      `${(event.clientX - box.left - box.width / 2) * 0.025}px`,
    );
    thaana.style.setProperty(
      '--thaana-y',
      `${(event.clientY - box.top - box.height / 2) * 0.025}px`,
    );
  });
  thaana?.addEventListener('pointerleave', () => {
    thaana.style.setProperty('--thaana-x', '0px');
    thaana.style.setProperty('--thaana-y', '0px');
  });
  let raf = 0;
  function frame(timestamp: number) {
    raf = 0;
    if (document.hidden) return;
    const still = reduced();
    scenes.forEach((scene) => {
      if (visible.has(scene.element)) scene.draw(timestamp / 1000, still);
    });
    if (!still && visible.size) raf = requestAnimationFrame(frame);
  }
  function wake() {
    if (!raf) raf = requestAnimationFrame(frame);
  }
  scenes.forEach((scene) => observer.observe(scene.element));
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
