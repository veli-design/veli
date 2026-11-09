# Veli Design third-party notices

Third-party software retains its own copyright and licence. Veli Design's MIT software
and CC BY documentation licences do not replace them.
The packages use TypeScript compilation with external dependency imports; they
do not bundle the dependency implementations. Their installed packages supply
the authoritative licence text. The table identifies direct runtime dependencies
and their declared licences.

| Used by                             | Dependency               | Declared licence |
| ----------------------------------- | ------------------------ | ---------------- |
| Veli Design React component library | @internationalized/date  | Apache-2.0       |
| Veli Design React component library | @phosphor-icons/react    | MIT              |
| Veli Design React component library | class-variance-authority | Apache-2.0       |
| Veli Design React component library | react-aria               | Apache-2.0       |
| Veli Design React component library | tailwind-merge           | MIT              |
| Veli Design CLI                     | @clack/prompts           | MIT              |
| Veli Design CLI                     | commander                | MIT              |
| Veli Design CLI                     | node-diff3               | MIT              |
| Veli Design CLI                     | package-manager-detector | MIT              |
| Veli Design CLI                     | semver                   | ISC              |

The React framework, React DOM and React Aria Components are external peer
dependencies.
Veli Design tokens contain generated CSS/JSON, with no runtime dependencies or font binaries.
Development/build tools are not bundled into these npm tarballs. This is a direct
dependency inventory, not a complete transitive SBOM or legal clearance.

Phosphor icons are supplied by `@phosphor-icons/react` under MIT. The
complete upstream copyright and licence notice is reproduced below and must
accompany redistributed Phosphor artwork. The MIT licence grants no trademark
or endorsement rights.

Third-party fonts retain their own licences and conditions. Preserve embedded
licensing metadata and any accompanying copyright, licence and notice information
required for redistribution. Font binaries are not included in these npm packages.
See `ASSET_LICENSES.md` for the category-level asset policy.

## Self-hosted web fonts

The following unchanged font binaries in `apps/web/public/fonts/` use the
SIL Open Font License, Version 1.1. The complete notices are copied into the
website's `/fonts/` directory with the binaries:

| Font              | Files                                                                                             | Copyright and licence                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Inter 4.001       | `inter-latin.woff2`, `inter-latin-ext.woff2`                                                      | Copyright (c) 2016 The Inter Project Authors. [Full OFL notice](apps/web/public/fonts/Inter-OFL.txt).                       |
| IBM Plex Mono 2.3 | `ibm-plex-mono-latin-400.woff2`, `ibm-plex-mono-latin-500.woff2`, `ibm-plex-mono-latin-600.woff2` | Copyright © 2017 IBM Corp., with Reserved Font Name "Plex". [Full OFL notice](apps/web/public/fonts/IBM-Plex-Mono-OFL.txt). |

Inter's embedded version identifies source revision `66647c0bb`; its notice is
preserved from [that upstream revision](https://github.com/rsms/inter/blob/66647c0bb/LICENSE.txt).
IBM Plex Mono's notice is preserved from [IBM Plex](https://github.com/IBM/plex/blob/master/LICENSE.txt).
Keep the accompanying notices, embedded metadata and applicable reserved-font-name
conditions when redistributing or modifying these fonts. These notices cover only
the listed open-source fonts; they do not grant rights to the Dhivehi font files.
See [the Dhivehi font notice](ASSET_LICENSES.md#dhivehi-fonts) for their credits,
Veli Design's author approval and separate conditions. Storybook's externally
loaded Google Fonts stylesheet is separate from these self-hosted web binaries.

## Notice scope and obligations

The runtime-dependency table covers inspected direct dependencies of the three npm
packages. It does not claim that development or transitive dependencies are
licence-free. The React framework, React DOM and React Aria Components retain their own
upstream terms. Blocks' motion and Phosphor dependencies, apps' dependencies,
Tailwind/build tooling, fonts and generated Storybook assets retain the
permissions and notice requirements applicable to their distribution. `ASSET_LICENSES.md` defines category-level
asset scope and rights-holder permission requirements. This dependency inventory
does not independently clear third-party redistribution rights.

Before distributing copied, modified or bundled upstream material, preserve its
actual copyright, licence, attribution and NOTICE requirements, including any
applicable Apache-2.0 notices. Do not infer those requirements from a dependency
name or add a blanket Veli Design copyright over upstream material. When dependencies
remain external, retain their own installed licence files and terms. No licence
text below grants rights to an unverified standalone SVG, font or government
asset. Confirm exact provenance before assigning it an upstream licence.

## Package distribution notices

### Veli Design React component library

<!-- BEGIN PACKAGE react -->

# Third-party notices — Veli Design React component library

The Veli Design React component library uses external @internationalized/date,
@phosphor-icons/react, class-variance-authority, react-aria and tailwind-merge
dependencies. The React framework, React DOM and React Aria Components are
external peer dependencies. Their implementations are not bundled in this
package; retain the upstream copyright, licence and any NOTICE files supplied
with those separately installed dependencies. Veli Design's original-work
licences do not replace upstream terms. The Phosphor notice below is preserved
from the inspected upstream package; it grants no rights to unrelated assets.

## Phosphor Icons

MIT License

Copyright (c) 2020 Phosphor Icons

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

<!-- END PACKAGE react -->

### Veli Design CLI

<!-- BEGIN PACKAGE cli -->

# Third-party notices — Veli Design CLI

Veli Design CLI runtime dependencies are @clack/prompts, commander, node-diff3,
package-manager-detector and semver. They are external imports, not bundled
implementations. Retain their supplied copyright, licence and attribution
files when distributing those dependencies; Veli Design's licence does not replace
their MIT/ISC terms. This package includes no app font, government/brand image or
Block source asset. Fetching a Block archive is a separate distribution and does
not waive its third-party notices or required permissions.

<!-- END PACKAGE cli -->
