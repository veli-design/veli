# Third-party notices

Engineering inventory for the proposed npm release. Third-party software retains
its own copyright and licence. Veli's proposed MIT software and CC BY documentation licences do not replace them.
The packages use TypeScript compilation with external dependency imports; they
do not bundle the dependency implementations. Their installed packages supply
the authoritative licence text. Versions below describe the inspected local
installation, not a promise about future dependency resolution.

| Used by | Dependency               | Inspected version | Declared licence |
| ------- | ------------------------ | ----------------- | ---------------- |
| React   | @internationalized/date  | 3.12.2            | Apache-2.0       |
| React   | @phosphor-icons/react    | 2.1.10            | MIT              |
| React   | class-variance-authority | 0.7.1             | Apache-2.0       |
| React   | react-aria               | 3.49.0            | Apache-2.0       |
| React   | tailwind-merge           | 2.6.0             | MIT              |
| CLI     | @clack/prompts           | 0.9.1             | MIT              |
| CLI     | commander                | 14.0.3            | MIT              |
| CLI     | node-diff3               | 3.2.0             | MIT              |
| CLI     | package-manager-detector | 1.6.0             | MIT              |
| CLI     | semver                   | 7.7.3             | ISC              |

React, React DOM and React Aria Components are external peer dependencies.
Tokens contain generated CSS/JSON, with no runtime dependencies or font binaries.
Development/build tools are not bundled into these npm tarballs. This is a direct
dependency inventory, not a complete transitive SBOM or legal clearance.

The Phosphor notice below is reproduced from the installed
`@phosphor-icons/react@2.1.10/LICENSE`. The seven standalone SVGs in
`packages/blocks/src/{service-detail,notification-tray}/` need source/rights
verification before a separate Blocks registry release; similarity and filenames
alone do not establish that they are Phosphor assets.

## Inventory boundaries and pending obligations

The table above covers inspected direct runtime dependencies of the three npm
packages. It does not claim that development or transitive dependencies are
licence-free. React, React DOM and React Aria Components peers retain their own
upstream terms. Blocks' motion and Phosphor dependencies, apps' dependencies,
Tailwind/build tooling, fonts and generated Storybook assets require review for
their respective distribution surfaces. `ASSET_LICENSES.md` records exact known
source assets and unresolved rights. Source copying/modification history has not
been comprehensively cleared by this inventory.

Before distributing copied, modified or bundled upstream material, preserve its
actual copyright, licence, attribution and NOTICE requirements, including any
applicable Apache-2.0 notices. Do not infer those requirements from a dependency
name or add a blanket Veli copyright over upstream material. When dependencies
remain external, retain their own installed licence files and terms. No licence
text below grants rights to an unverified standalone SVG, font or government
asset. Confirm exact provenance before assigning it an upstream licence.

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
