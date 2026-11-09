# Marketing motion references

The homepage follows Basim's `veli-home-v2.html` attached to PD-1326. PD-1391
tracks implementation and prototype parity. The Figma frames remain the layout
references; the HTML supplies the animation sequences, SVG layers, and timing.

- `src/scripts/home-motion-settings.js` holds the designer's final numeric
  overrides. No tuning controls or prototype settings storage ship to users.
- `src/scripts/home-stipple.js` runs the hero field. Its collision boundary is
  the logo's alpha mask, including the spaces and counters between glyphs.
- `src/scripts/home-experience.js` coordinates the opening outline/fill sequence,
  scroll reveals, card stipple, foundation scenes, and card playback.
- `src/assets/marketing/home-*.svg` preserves the prototype's hero, government
  wordmark, and layered Explore artwork. The inline layers are needed for motion.
- `public/animations/marketing/` contains the three supplied Lottie animations
  in both themes. These are decoded from the prototype's light JSON and dark
  patches, without changing their layers, frame rates, or markers. Preserve
  the `final` and `reset` markers when replacing them: playback stops at `final`,
  and replay tidies away from `reset` before starting again.
- The SVG light player uses the prototype's `lottie-web` version, 5.12.2. It loads
  separately from the hero; its MIT notice ships in `public/third-party/`.

Motion honors the saved site preference and the system reduced-motion setting.
Reduced motion displays complete artwork immediately. Scenes pause offscreen
and while the document is hidden. The hero canvas clears after the introduction
has scrolled out, including in reduced-motion mode. Without JavaScript the
content and supplied still previews remain visible.

The agency strip uses the exact government emblem and repeated agency entries
in the supplied prototype; it does not imply additional, distinct agency assets.
Its duplicate visual entries are hidden from assistive technology. Brand and
government identifiers retain the exclusions in the repository's brand policy.

The Design page follows frame `2382:89507` in the same Figma file. Its editorial
spacing and footer live in `src/styles/design.css` and `DesignFooter.astro`,
independently of the homepage prototype. The composed atoll and Thaana plates
keep their native layer coordinates and scale together inside their clips.
`src/lib/design-fields.json` records the visible particle centres and dot sizes
relative to the five frame clips; each field draws the original exported SVG dot
from `public/images/marketing/`. The resting composition matches Figma, while
`src/scripts/design-motion.ts` retains the supplied preview's Reef, Ocean, and
Wind pointer interactions. Reduced motion keeps the exact resting composition.
The designer has not provided mobile frames for this page; its smaller layouts
adapt the same content and artwork without changing the desktop reference.
