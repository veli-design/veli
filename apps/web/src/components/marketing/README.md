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
- `src/assets/marketing/home-*.svg` preserves the prototype's hero and government
  wordmark. Explore uses the desktop and mobile Figma exports in
  `public/images/marketing/explore/` with a CSS pulse on the complete icon.
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
spacing lives in `src/styles/design.css`, independently of the homepage prototype.
Both marketing pages reuse `MarketingFooter.astro`, including its navigation
and theme/motion preferences. The composed atoll and Thaana plates
keep their native layer coordinates and scale together inside their clips.
`src/lib/design-fields.json` records the visible particle centres and dot sizes
relative to the four frame clips; each field draws the original exported SVG dot
from `public/images/marketing/`. The resting composition matches Figma, while
`src/scripts/design-motion.ts` supplies those resting fields and ambient hero artwork. The closing CTA uses the
original static stipple vector from frame `2382:107037`. The deferred preview module below owns the interactive card motion.
Reduced motion keeps the exact resting composition.
The portrait atoll, Crystalline Sand, movement, and Thaana cards follow the mobile
frames 2463:9376 through 2466:9376. The desktop artwork retains its own layout.

The One system card intentionally replaces the reference PNG with live text and
two CSS radial gradients. Its slow tide animation moves only the glow, pauses
offscreen or in a hidden tab, and becomes a complete still with reduced motion.

Design motion now follows the motion designer's `Designing Veli -
interactive preview (2).html`. The page layout still comes from Figma. Its
animation-only SVG layers are in `public/animations/design/`; `design-preview.json`
keeps their original coordinate metadata. Do not replace these with a screenshot
or embed the prototype's full page layout. `design-previews.js` preserves the
prototype's timings and easing for the three force fields, scroll-driven atoll
orbits and breathing Veli particles, breathing light, waving texture, morphing curve and loose
particles, Guide → Connect → Respond sequence, and Thaana pointer lens/pinning.

The hero canvas uses six-second traveling waves, per-grain wander, and crest
lighting. Canvas fields rasterize each SVG dot once to a 32px-wide bitmap for
reuse on every frame. Keep
this cache when changing artwork: per-grain SVG draws are costly at Retina
resolutions. Ambient canvases stop when they leave the viewport.
The atoll's dotted orbits follow scroll. Its white circles, outlined SVG labels,
and Coral/Reef/Islands/Atolls icons remain fixed. The static HTML illustration
has its own labels for reduced motion and before the SVG loads. Guide uses the
new slower glide; Connect draws and fills before the next steps settle in, and
Respond starts later within the shared seven-second sequence.

The preview code and layers load when the first cards approach the viewport.
Frames stop outside the viewport and while the page is hidden. Reduced motion
shows the stills, including the HTML letters in the Thaana card. With motion
enabled, Thaana adds one tab stop with arrow-key navigation and Enter/Space to
pin or release the same letters available through pointer and touch. Focus is drawn
around the original letter cell, not on the enlarged ink. On no-hover devices,
one small letter at a time blooms, returns fully to rest, and pauses before a
different on-screen letter blooms. This sequence pauses during manual interaction.
The six large painted letters never animate.

The curve's particle collision simulation is baked ahead of time to avoid
blocking interaction on the browser main thread. After changing its geometry or
motion settings in `design-preview-curve.js` / `design-preview.json`, regenerate
it with `corepack pnpm --filter @tradenetcorp/veli-web exec node scripts/generate-design-curve.mjs`.
The result is 360 frames for 104 grains, interpolated during playback. Preserve
the original SVG IDs' per-illustration prefixes when updating artwork: multiple
inline previews must not share gradient, mask, filter, or clip-path IDs.
