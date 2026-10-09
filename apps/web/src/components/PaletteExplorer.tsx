import { useState } from 'react';

import styles from './PaletteExplorer.module.css';

const PALETTES = [
  'slate',
  'ash',
  'stone',
  'sage',
  'blue',
  'emerald',
  'lime',
  'green',
  'yellow',
  'orange',
  'red',
  'teal',
  'indigo',
  'magenta',
] as const;

const STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200] as const;

type Variant = 'solid' | 'alpha';

function tokenName(
  palette: (typeof PALETTES)[number],
  step: (typeof STEPS)[number],
  variant: Variant,
) {
  return `--veli-color-${palette}-${variant === 'alpha' ? 'alpha-' : ''}${step}`;
}

export function PaletteExplorer() {
  const [variant, setVariant] = useState<Variant>('solid');
  const [status, setStatus] = useState('');

  async function copyToken(palette: (typeof PALETTES)[number], step: (typeof STEPS)[number]) {
    const token = tokenName(palette, step, variant);
    const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();

    try {
      await navigator.clipboard.writeText(value || `var(${token})`);
      setStatus(`${token} copied`);
    } catch {
      setStatus(`Copy unavailable. Token: ${token}`);
    }
  }

  return (
    <div className={styles.explorer}>
      <div className={styles.toolbar}>
        <div className={styles.variantGroup} role="group" aria-label="Palette variant">
          {(['solid', 'alpha'] as const).map((option) => (
            <button
              className={styles.variantButton}
              type="button"
              aria-pressed={variant === option}
              onClick={() => {
                setVariant(option);
                setStatus('');
              }}
              key={option}
            >
              {option[0].toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
        <p className={styles.themeNote}>Values follow the active site appearance.</p>
      </div>

      <p className={styles.status} aria-live="polite">
        {status}
      </p>

      <ul className={styles.paletteList}>
        {PALETTES.map((palette) => (
          <li className={styles.palette} key={palette}>
            <h3 className={styles.paletteName}>{palette}</h3>
            <ol className={styles.swatchList} aria-label={`${palette} ${variant} scale`}>
              {STEPS.map((step) => {
                const token = tokenName(palette, step, variant);

                return (
                  <li className={styles.swatchItem} key={step}>
                    <button
                      className={styles.swatch}
                      type="button"
                      style={{ background: `var(${token})` }}
                      aria-label={`Copy ${token} value`}
                      title={`Copy ${token}`}
                      onClick={() => void copyToken(palette, step)}
                    />
                    <span className={styles.swatchStep} aria-hidden="true">
                      {step}
                    </span>
                  </li>
                );
              })}
            </ol>
          </li>
        ))}
      </ul>
    </div>
  );
}
