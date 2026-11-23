import type { DotLottie } from '@lottiefiles/dotlottie-web';
import wasmUrl from '@lottiefiles/dotlottie-web/dotlottie-player.wasm?url';

let runtime: Promise<typeof import('@lottiefiles/dotlottie-web')> | undefined;
const instances = new Map<HTMLElement, ComponentAnimation>();
let initialized = false;

function loadRuntime() {
  runtime ??= import('@lottiefiles/dotlottie-web').then((module) => {
    module.DotLottie.setWasmUrl(wasmUrl);
    return module;
  });
  return runtime;
}

class ComponentAnimation {
  private player?: DotLottie;
  private fetchAbort?: AbortController;
  private canvas: HTMLCanvasElement;
  private playButton: HTMLButtonElement;
  private replayButton: HTMLButtonElement;
  private status: HTMLElement;
  private abort = new AbortController();
  private intersection: IntersectionObserver;
  private resize: ResizeObserver;
  private panelObserver: MutationObserver;
  private motion = matchMedia('(prefers-reduced-motion: reduce)');
  private visible = false;
  private wanted = !this.motion.matches;
  private motionAllowed = false;
  private loaded = false;
  private completed = false;
  private failed = false;
  private disposed = false;
  private generation = 0;
  private progress = 0;
  private theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  private timeout?: ReturnType<typeof setTimeout>;

  constructor(private root: HTMLElement) {
    this.canvas = root.querySelector('canvas')!;
    this.playButton = root.querySelector('[data-animation-play]')!;
    this.replayButton = root.querySelector('[data-animation-replay]')!;
    this.status = root.querySelector('[role="status"]')!;
    this.setState('poster');
    this.status.textContent = '';
    const options = { signal: this.abort.signal };
    this.playButton.addEventListener(
      'click',
      () => {
        this.motionAllowed = true;
        this.wanted = true;
        this.sync();
        this.root.focus({ preventScroll: true });
      },
      options,
    );
    this.replayButton.addEventListener(
      'click',
      () => {
        this.completed = false;
        this.status.textContent = '';
        this.progress = 0;
        this.player?.setFrame(0);
        this.wanted = true;
        this.motionAllowed = true;
        this.sync();
        this.root.focus({ preventScroll: true });
      },
      options,
    );
    this.motion.addEventListener(
      'change',
      () => {
        // A changed motion preference always requires a new explicit play action.
        this.wanted = false;
        this.motionAllowed = false;
        this.completed = false;
        this.status.textContent = '';
        this.progress = 0;
        this.dropPlayer();
        this.setState('poster');
        this.sync();
      },
      options,
    );
    window.addEventListener('veli:color-scheme-change', () => this.syncTheme(), options);
    document.addEventListener('visibilitychange', () => this.sync(), options);
    this.intersection = new IntersectionObserver(
      (entries) => {
        this.visible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0);
        this.sync();
      },
      { threshold: [0, 0.01] },
    );
    this.intersection.observe(root);
    this.resize = new ResizeObserver(() => {
      this.player?.setRenderConfig({ devicePixelRatio: window.devicePixelRatio || 1 });
      this.player?.resize();
    });
    this.resize.observe(root);
    this.panelObserver = new MutationObserver(() => this.sync());
    const panel = root.closest('[data-doc-tab-panel]');
    if (panel) this.panelObserver.observe(panel, { attributes: true, attributeFilter: ['hidden'] });
    this.updateControls();
  }

  private canAnimate() {
    return !this.motion.matches || this.motionAllowed;
  }

  private onScreen() {
    return this.visible && !document.hidden && !this.root.closest('[hidden]');
  }

  private setState(state: string) {
    this.root.dataset.state = state;
  }

  private updateControls() {
    this.playButton.hidden = this.failed || this.completed || this.wanted || this.loaded;
    this.replayButton.hidden = this.failed || !this.completed;
  }

  private syncTheme() {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    if (theme === this.theme) return;
    this.theme = theme;
    if (this.loaded && this.player) {
      this.progress = this.player.currentFrame / Math.max(1, this.player.totalFrames - 1);
    }
    const hadPlayer = !!this.player || this.root.dataset.state === 'loading';
    this.dropPlayer();
    this.setState('poster');
    if (hadPlayer && this.canAnimate() && this.onScreen() && !this.failed) void this.mount();
    else this.sync();
  }

  private sync() {
    if (this.disposed || this.failed) return;
    if (
      !this.player &&
      this.wanted &&
      this.canAnimate() &&
      this.onScreen() &&
      this.root.dataset.state !== 'loading'
    ) {
      void this.mount();
    }
    if (this.loaded && this.player) {
      if (this.wanted && !this.completed && this.canAnimate() && this.onScreen()) {
        this.player.play();
        this.setState('playing');
      } else {
        this.player.pause();
        this.setState(this.completed ? 'completed' : 'paused');
      }
    }
    this.updateControls();
  }

  private async mount() {
    const generation = ++this.generation;
    this.setState('loading');
    this.updateControls();
    this.timeout = setTimeout(() => this.fail(generation), 15000);
    try {
      this.fetchAbort = new AbortController();
      const src = this.theme === 'dark' ? this.root.dataset.srcDark : this.root.dataset.srcLight;
      if (!src) throw new Error('Missing animation source');
      const [{ DotLottie: Player }, data] = await Promise.all([
        loadRuntime(),
        fetch(src, { signal: this.fetchAbort.signal }).then((response) => {
          if (!response.ok) throw new Error('Animation request failed');
          return response.arrayBuffer();
        }),
      ]);
      if (generation !== this.generation || this.disposed) return;
      const player = new Player({
        canvas: this.canvas,
        data,
        autoplay: false,
        loop: false,
        layout: { fit: 'contain', align: [0.5, 0.5] },
        renderConfig: { autoResize: true, devicePixelRatio: window.devicePixelRatio || 1 },
      });
      this.player = player;
      player.addEventListener('load', () => {
        if (generation !== this.generation) return;
        clearTimeout(this.timeout);
        this.loaded = true;
        player.setFrame(this.progress * Math.max(0, player.totalFrames - 1));
        this.sync();
      });
      player.addEventListener('render', () => {
        if (generation === this.generation && this.loaded) this.root.classList.add('is-rendered');
      });
      player.addEventListener('complete', () => {
        if (generation !== this.generation) return;
        this.completed = true;
        this.wanted = false;
        this.progress = 1;
        const hadFocus = document.activeElement === this.root;
        this.status.textContent = 'Animation complete.';
        this.sync();
        if (hadFocus) this.replayButton.focus({ preventScroll: true });
      });
      player.addEventListener('loadError', () => this.fail(generation));
      player.addEventListener('renderError', () => this.fail(generation));
    } catch {
      this.fail(generation);
    }
  }

  private fail(generation: number) {
    if (generation !== this.generation || this.disposed) return;
    this.failed = true;
    this.dropPlayer();
    this.setState('error');
    this.status.textContent = 'Animation unavailable. Showing a still image.';
    this.updateControls();
  }

  private dropPlayer() {
    ++this.generation;
    this.fetchAbort?.abort();
    this.fetchAbort = undefined;
    clearTimeout(this.timeout);
    this.player?.destroy();
    this.player = undefined;
    this.loaded = false;
    this.root.classList.remove('is-rendered');
  }

  destroy() {
    this.disposed = true;
    this.dropPlayer();
    this.abort.abort();
    this.intersection.disconnect();
    this.resize.disconnect();
    this.panelObserver.disconnect();
    this.setState('poster');
    this.replayButton.hidden = true;
    this.playButton.hidden = true;
  }
}

export function initComponentAnimations() {
  const mountAll = () => {
    for (const [root, instance] of instances) {
      if (!root.isConnected) {
        instance.destroy();
        instances.delete(root);
      }
    }
    for (const root of document.querySelectorAll<HTMLElement>('[data-component-animation]')) {
      if (!instances.has(root)) instances.set(root, new ComponentAnimation(root));
    }
  };
  mountAll();
  if (initialized) return;
  initialized = true;
  document.addEventListener('astro:page-load', mountAll);
  document.addEventListener('astro:after-swap', mountAll);
  document.addEventListener('astro:before-swap', () => {
    for (const instance of instances.values()) instance.destroy();
    instances.clear();
  });
  // Hot reloads replace DOM without Astro page events. Production navigation
  // is covered above, so only development pays for watching the whole body.
  if (!import.meta.env.DEV) return;
  new MutationObserver((mutations) => {
    if (
      mutations.some((mutation) =>
        [...mutation.addedNodes, ...mutation.removedNodes].some(
          (node) =>
            node instanceof Element &&
            (node.matches('[data-component-animation]') ||
              node.querySelector('[data-component-animation]')),
        ),
      )
    )
      mountAll();
  }).observe(document.body, { childList: true, subtree: true });
}
