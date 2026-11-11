export function initMarketingPreferences() {
  const root = document.documentElement;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const controls = document.querySelectorAll<HTMLButtonElement>('[data-reduce-motion]');
  let choice: boolean | null = null;
  try {
    const saved = localStorage.getItem('veli-reduced-motion');
    choice = saved === null ? null : saved === 'true';
  } catch {
    /* Use the system preference when storage is unavailable. */
  }
  const apply = () => {
    const reduced = choice ?? media.matches;
    root.dataset.reducedMotion = String(reduced);
    controls.forEach((control) => {
      control.setAttribute('aria-checked', String(reduced));
    });
    root.classList.toggle('low-motion', reduced);
    window.dispatchEvent(new CustomEvent('veli:motion-change', { detail: { reduced } }));
  };
  controls.forEach((control) =>
    control.addEventListener('click', () => {
      choice = control.getAttribute('aria-checked') !== 'true';
      try {
        localStorage.setItem('veli-reduced-motion', String(choice));
      } catch {
        /* Preference still applies to this page. */
      }
      apply();
    }),
  );
  media.addEventListener('change', apply);
  apply();
}
