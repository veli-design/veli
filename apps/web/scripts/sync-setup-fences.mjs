import { applySetupFences } from '../src/lib/setup-fences.mjs';

// Check-only in this docs change. The package PR runs the script to copy owner fences into published READMEs.
applySetupFences({ write: true });
