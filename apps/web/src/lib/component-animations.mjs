import assets from './component-animation-assets.json' with { type: 'json' };

export const componentAnimationSlugs = [
  'accordion',
  'alert',
  'avatar',
  'badge',
  'breadcrumbs',
  'button',
  'calendar',
  'card',
  'checkbox',
  'combobox',
  'date-field',
  'date-picker',
  'divider',
  'dropzone',
  'field',
  'input',
  'kbd',
  'link',
  'loading-text',
  'menu',
  'modal',
  'pagination',
  'password-input',
  'popover',
  'radio',
  'search',
  'select',
  'sheet',
  'skeleton',
  'spinner',
  'switch',
  'table',
  'tabs',
  'tags',
  'textarea',
  'toast',
  'tooltip',
];

export const retainedAnimationSlugs = [
  'account-panel',
  'notification-tray',
  'page-tab',
  'site-footer',
  'site-header',
];

/** @param {string} slug */
export function getComponentAnimation(slug) {
  if (!componentAnimationSlugs.includes(slug)) return undefined;
  const variants = assets.filter((asset) => asset.slug === slug);
  const sources = Object.fromEntries(
    ['en', 'dv'].map((locale) => [
      locale,
      Object.fromEntries(
        variants
          .filter((asset) => asset.locale === locale)
          .map((asset) => [
            asset.theme,
            {
              src: asset.path,
              poster: asset.path.replace('.lottie', '.webp'),
              posterFrame: asset.posterFrame,
            },
          ]),
      ),
    ]),
  );
  return {
    slug,
    status: sources.en.light && sources.en.dark ? 'available' : 'missing',
    width: 805,
    height: 476,
    sources,
  };
}

export const missingComponentAnimations = componentAnimationSlugs.filter(
  (slug) => getComponentAnimation(slug)?.status === 'missing',
);
