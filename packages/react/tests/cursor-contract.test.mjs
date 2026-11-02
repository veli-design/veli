import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const DOC_LINK = 'docs/CURSOR_AFFORDANCES.md';

const DOC_MARKERS = [
  'Enabled menu, select, combobox, and calendar picker rows use cursor-default.',
  'Disabled rows use cursor-not-allowed and stay hit-testable.',
  'A disabled Button stays hit-testable and uses cursor-not-allowed.',
  'Pending Button uses data-[pending]:cursor-wait.',
  'Do not export a shared cursor string.',
];

const SRC_PREFIX = 'packages/react/src/';

const TRIPWIRES = [
  { id: 'aria-button', pattern: 'AriaButton' },
  { id: 'native-button', pattern: '<button[\\s>]' },
];

const CURSOR_RULES = [
  {
    kind: 'prose',
    id: 'contributing-link',
    file: 'CONTRIBUTING.md',
    require: [DOC_LINK],
  },
  {
    kind: 'prose',
    id: 'cursor-doc-markers',
    file: DOC_LINK,
    require: DOC_MARKERS,
  },
  {
    kind: 'src-forbid',
    id: 'no-exported-cursor-constant',
    pattern: 'export const \\w*[Cc]ursor',
    message:
      'Do not export a shared cursor string. Write the utility in the recipe. See docs/CURSOR_AFFORDANCES.md.',
  },
  {
    kind: 'src-forbid',
    id: 'src-does-not-import-the-contract',
    pattern: 'cursor-contract',
    message: 'Recipes do not import the cursor contract. See docs/CURSOR_AFFORDANCES.md.',
  },
  {
    kind: 'src-forbid',
    id: 'no-interaction-shared-module',
    pattern: 'interaction-shared-variants',
    message:
      'No shared interaction/cursor module. Keep the literal in the recipe. See docs/CURSOR_AFFORDANCES.md.',
  },
  {
    kind: 'src-forbid',
    id: 'no-disabled-pointer-events-none',
    pattern:
      '(?<![\\w-])(?:disabled:|data-\\[disabled\\]:)pointer-events-none|isDisabled:\\s*\\{[^}]*pointer-events-none',
    message:
      'A disabled host stays hit-testable. Do not set pointer-events-none on that state. See docs/CURSOR_AFFORDANCES.md.',
  },
  {
    kind: 'binding',
    id: 'accordion-trigger',
    file: 'packages/react/src/accordion.tsx',
    binding: 'accordionTriggerVariants',
    require: ['cursor-pointer'],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'button-host',
    file: 'packages/react/src/button.tsx',
    binding: 'buttonVariants',
    require: [
      'cursor-pointer',
      'disabled:cursor-not-allowed',
      'data-[disabled]:cursor-not-allowed',
      'data-[pending]:cursor-wait',
    ],
    forbid: ['disabled:pointer-events-none'],
    // Different utilities, so twMerge keeps every one. Source order is not the CSS cascade.
    order: [
      ['disabled:cursor-not-allowed', 'data-[pending]:cursor-wait'],
      ['data-[disabled]:cursor-not-allowed', 'data-[pending]:cursor-wait'],
    ],
  },
  {
    kind: 'binding',
    id: 'link-disabled',
    file: 'packages/react/src/link.tsx',
    binding: 'linkVariants',
    require: ['cursor-not-allowed'],
    forbid: ['pointer-events-none'],
  },
  {
    kind: 'binding',
    id: 'tab-base',
    file: 'packages/react/src/tabs.tsx',
    binding: 'tabBaseClassName',
    require: ['cursor-pointer'],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'tab-disabled',
    file: 'packages/react/src/tabs.tsx',
    binding: 'getTabClassName',
    require: ['cursor-not-allowed'],
    forbid: ['pointer-events-none'],
  },
  {
    kind: 'binding',
    id: 'date-picker-calendar-button',
    file: 'packages/react/src/date-picker.tsx',
    binding: 'calendarButtonClassName',
    require: ['cursor-pointer', 'data-[disabled]:cursor-not-allowed'],
    forbid: ['pointer-events-none'],
  },
  {
    kind: 'binding',
    id: 'combobox-chevron',
    file: 'packages/react/src/combobox.tsx',
    binding: 'triggerButtonVariants',
    require: ["true: 'cursor-not-allowed", 'cursor-pointer'],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'tag-remove',
    file: 'packages/react/src/tags.tsx',
    binding: 'removeButtonVariants',
    require: ['cursor-not-allowed', 'cursor-pointer'],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'tag-dropdown-label',
    file: 'packages/react/src/tags.tsx',
    binding: 'dropdownLabelVariants',
    require: ['cursor-pointer', 'cursor-not-allowed'],
    forbid: [],
    invocationMustMention: ['isDisabled'],
  },
  {
    kind: 'binding',
    id: 'tag-dropdown-caret',
    file: 'packages/react/src/tags.tsx',
    binding: 'dropdownCaretVariants',
    require: ['cursor-pointer', 'cursor-not-allowed'],
    forbid: [],
    invocationMustMention: ['isDisabled'],
  },
  {
    kind: 'compound-cursor',
    id: 'tag-disabled-wins',
    file: 'packages/react/src/tags.tsx',
    binding: 'tagVariants',
    guard: 'isDisabled: true',
    winningClass: 'cursor-not-allowed',
  },
  {
    kind: 'binding',
    id: 'dropzone-area',
    file: 'packages/react/src/dropzone.tsx',
    binding: 'areaVariants',
    require: ['cursor-pointer', "disabled: 'cursor-not-allowed"],
    forbid: [],
    order: [['cursor-pointer', "disabled: 'cursor-not-allowed"]],
  },
  // A button does not inherit the cell cursor, and Tailwind v4 leaves a bare button on the default arrow.
  {
    kind: 'opening-tag',
    id: 'table-drag-button',
    file: 'packages/react/src/table.tsx',
    component: 'AriaButton',
    require: ['cursor-grab', 'group-data-[dragging]/row:cursor-grabbing'],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'menu-row',
    file: 'packages/react/src/menu.tsx',
    binding: 'menuItemVariants',
    require: ['cursor-default', 'data-[disabled]:cursor-not-allowed'],
    forbid: ['pointer-events-none', 'cursor-pointer'],
  },
  {
    kind: 'binding',
    id: 'select-row',
    file: 'packages/react/src/select.tsx',
    binding: 'selectItemVariants',
    require: ['cursor-default', "true: 'cursor-not-allowed"],
    forbid: ['pointer-events-none', 'cursor-pointer'],
  },
  {
    kind: 'binding',
    id: 'combobox-row',
    file: 'packages/react/src/combobox.tsx',
    binding: 'itemVariants',
    require: ['cursor-default', 'data-[disabled]:cursor-not-allowed'],
    forbid: ['pointer-events-none', 'cursor-pointer'],
  },
  {
    kind: 'binding',
    id: 'calendar-picker-row',
    file: 'packages/react/src/calendar.tsx',
    binding: 'calendarPickerItemVariants',
    require: ['cursor-default', "true: 'cursor-not-allowed"],
    forbid: ['pointer-events-none', 'cursor-pointer'],
  },
  {
    kind: 'opening-tag',
    id: 'menu-item-call-site',
    component: 'MenuItem',
    require: [],
    forbid: ['cursor-'],
  },
  {
    kind: 'binding',
    id: 'input-shell',
    file: 'packages/react/src/input.tsx',
    binding: 'fieldShellVariants',
    require: ["true: 'cursor-not-allowed'", "false: 'cursor-text'"],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'textarea-shell',
    file: 'packages/react/src/textarea.tsx',
    binding: 'fieldShellVariants',
    require: ["true: 'cursor-not-allowed'", "false: 'cursor-text'"],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'textarea-grip',
    file: 'packages/react/src/textarea.tsx',
    binding: 'resizeIndicatorVariants',
    require: ['cursor-ns-resize', 'cursor-not-allowed'],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'search-shell',
    file: 'packages/react/src/search.tsx',
    binding: 'fieldShellVariants',
    require: ["true: 'cursor-not-allowed'", "false: 'cursor-text'"],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'search-clear',
    file: 'packages/react/src/search.tsx',
    binding: 'clearButtonVariants',
    require: ['cursor-not-allowed', 'cursor-pointer'],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'password-shell',
    file: 'packages/react/src/password-input-component.tsx',
    binding: 'fieldShellVariants',
    require: ["true: 'cursor-not-allowed'", "false: 'cursor-text'"],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'password-reveal',
    file: 'packages/react/src/password-input-component.tsx',
    binding: 'visibilityToggleVariants',
    require: ['cursor-not-allowed', 'cursor-pointer'],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'combobox-shell',
    file: 'packages/react/src/combobox.tsx',
    binding: 'fieldShellVariants',
    require: ["true: 'cursor-not-allowed'", "false: 'cursor-text'"],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'date-shell',
    file: 'packages/react/src/date-shared-variants.ts',
    binding: 'fieldShellVariants',
    require: ["true: 'cursor-not-allowed'", "false: 'cursor-text'"],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'date-segment-readonly',
    file: 'packages/react/src/date-shared-variants.ts',
    binding: 'dateSegmentVariants',
    require: ["true: 'cursor-default'"],
    forbid: ['cursor-pointer', 'cursor-text'],
  },
  {
    kind: 'file',
    id: 'date-field-claims-shared-cursors',
    file: 'packages/react/src/date-field.tsx',
    require: ['fieldShellVariants', 'fieldHeaderInfoTooltipTriggerVariants'],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'field-info-trigger',
    file: 'packages/react/src/field-shared-variants.ts',
    binding: 'fieldHeaderInfoTooltipTriggerVariants',
    require: ['cursor-help', 'cursor-not-allowed'],
    forbid: ['cursor-pointer'],
  },
  {
    kind: 'binding',
    id: 'select-trigger',
    file: 'packages/react/src/select.tsx',
    binding: 'fieldButtonVariants',
    require: ["true: 'cursor-not-allowed'", "false: 'cursor-pointer'"],
    forbid: ['cursor-text'],
  },
  {
    kind: 'binding',
    id: 'checkbox-root',
    file: 'packages/react/src/checkbox.tsx',
    binding: 'checkboxRootVariants',
    require: ["true: 'cursor-not-allowed", "false: 'cursor-pointer"],
    forbid: ['cursor-default'],
  },
  {
    kind: 'binding',
    id: 'radio-root',
    file: 'packages/react/src/radio.tsx',
    binding: 'radioRootVariants',
    require: ["true: 'cursor-not-allowed", "false: 'cursor-pointer"],
    forbid: ['cursor-default'],
  },
  {
    kind: 'binding',
    id: 'switch-root',
    file: 'packages/react/src/switch.tsx',
    binding: 'switchVariants',
    require: ['cursor-not-allowed', 'cursor-pointer', 'cursor-default'],
    forbid: [],
  },
  {
    kind: 'file',
    id: 'switch-readonly-gate',
    file: 'packages/react/src/switch.tsx',
    require: ['isReadOnly: !isDisabled && isReadOnly'],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'calendar-day',
    file: 'packages/react/src/calendar.tsx',
    binding: 'cellVariants',
    require: ['cursor-pointer', 'cursor-not-allowed'],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'calendar-range-day',
    file: 'packages/react/src/calendar.tsx',
    binding: 'getRangeCalendarCellClassName',
    require: ['cursor-pointer', 'cursor-not-allowed'],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'card-interactive',
    file: 'packages/react/src/card.tsx',
    binding: 'cardVariants',
    require: ['cursor-pointer'],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'breadcrumb-link',
    file: 'packages/react/src/breadcrumbs.tsx',
    binding: 'breadcrumbLinkVariants',
    require: ['cursor-pointer', "true: 'cursor-default"],
    forbid: ['cursor-not-allowed'],
  },
  {
    kind: 'binding',
    id: 'breadcrumb-overflow-trigger',
    file: 'packages/react/src/breadcrumbs.tsx',
    binding: 'breadcrumbOverflowTriggerVariants',
    require: ['cursor-pointer'],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'divider-action',
    file: 'packages/react/src/divider.tsx',
    binding: 'dividerActionClassName',
    require: ['cursor-pointer'],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'table-sort-header',
    file: 'packages/react/src/table.tsx',
    binding: 'tableColumnVariants',
    require: ["true: 'cursor-pointer"],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'table-drag-cell',
    file: 'packages/react/src/table.tsx',
    binding: 'tableDragCellClassName',
    require: ['cursor-grab', 'group-data-[dragging]/row:cursor-grabbing'],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'table-drag-column',
    file: 'packages/react/src/table.tsx',
    binding: 'tableDragColumnClassName',
    require: ['cursor-grab'],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'table-resizer',
    file: 'packages/react/src/table.tsx',
    binding: 'tableResizerVariants',
    require: ['cursor-col-resize'],
    forbid: [],
  },
  {
    kind: 'binding',
    id: 'table-row-has-no-cursor',
    file: 'packages/react/src/table.tsx',
    binding: 'tableRowVariants',
    require: [],
    forbid: ['cursor-'],
  },
];

const IDENT = /[A-Za-z0-9_$]/;
const CURSOR_UTILITY = /cursor-[a-z-]+/;

function see(binding, text) {
  const who = binding ? `${binding}: ` : '';
  const sentence = text.includes(DOC_LINK) ? text : `${text} See ${DOC_LINK}.`;
  return `${who}${sentence}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function skipString(source, index) {
  const quote = source[index];
  let i = index + 1;
  if (quote !== '`') {
    while (i < source.length) {
      if (source[i] === '\\') {
        i += 2;
        continue;
      }
      if (source[i] === quote) return i + 1;
      i += 1;
    }
    return i;
  }
  while (i < source.length) {
    if (source[i] === '\\') {
      i += 2;
      continue;
    }
    if (source[i] === '`') return i + 1;
    if (source[i] === '$' && source[i + 1] === '{') {
      i += 2;
      let depth = 1;
      while (i < source.length && depth > 0) {
        const skipped = skipTrivia(source, i);
        if (skipped !== i) {
          i = skipped;
          continue;
        }
        if (source[i] === '{') depth += 1;
        else if (source[i] === '}') depth -= 1;
        i += 1;
      }
      continue;
    }
    i += 1;
  }
  return i;
}

function skipTrivia(source, index) {
  let i = index;
  while (i < source.length) {
    const next = source[i + 1];
    if (source[i] === '/' && next === '/') {
      i += 2;
      while (i < source.length && source[i] !== '\n') i += 1;
      continue;
    }
    if (source[i] === '/' && next === '*') {
      i += 2;
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i += 1;
      i = Math.min(source.length, i + 2);
      continue;
    }
    if (source[i] === "'" || source[i] === '"' || source[i] === '`') {
      i = skipString(source, i);
      continue;
    }
    break;
  }
  return i;
}

function sliceAfterEquals(source, eqIndex) {
  const start = eqIndex + 1;
  let i = start;
  let paren = 0;
  let brace = 0;
  let bracket = 0;
  let entered = false;
  while (i < source.length) {
    const skipped = skipTrivia(source, i);
    if (skipped !== i) {
      i = skipped;
      continue;
    }
    const char = source[i];
    if (char === '(') {
      paren += 1;
      entered = true;
    } else if (char === ')') paren -= 1;
    else if (char === '{') {
      brace += 1;
      entered = true;
    } else if (char === '}') brace -= 1;
    else if (char === '[') {
      bracket += 1;
      entered = true;
    } else if (char === ']') bracket -= 1;
    else if (char === ';' && paren === 0 && brace === 0 && bracket === 0) {
      return [start, i];
    }
    if (
      entered &&
      paren === 0 &&
      brace === 0 &&
      bracket === 0 &&
      (char === ')' || char === '}' || char === ']')
    ) {
      return [start, i + 1];
    }
    i += 1;
  }
  return [start, source.length];
}

function sliceFunctionBody(source, nameEnd) {
  let i = nameEnd;
  while (i < source.length) {
    const skipped = skipTrivia(source, i);
    if (skipped !== i) {
      i = skipped;
      continue;
    }
    if (source[i] === '(') break;
    i += 1;
  }
  let paren = 0;
  while (i < source.length) {
    const skipped = skipTrivia(source, i);
    if (skipped !== i) {
      i = skipped;
      continue;
    }
    if (source[i] === '(') paren += 1;
    else if (source[i] === ')') {
      paren -= 1;
      if (paren === 0) {
        i += 1;
        break;
      }
    }
    i += 1;
  }
  while (i < source.length) {
    const skipped = skipTrivia(source, i);
    if (skipped !== i) {
      i = skipped;
      continue;
    }
    if (source[i] === '{') {
      const start = i;
      let brace = 1;
      i += 1;
      while (i < source.length && brace > 0) {
        const skippedBody = skipTrivia(source, i);
        if (skippedBody !== i) {
          i = skippedBody;
          continue;
        }
        if (source[i] === '{') brace += 1;
        else if (source[i] === '}') brace -= 1;
        i += 1;
      }
      return [start, i];
    }
    i += 1;
  }
  return null;
}

export function sliceBinding(source, binding) {
  const escaped = escapeRegExp(binding);
  const constMatch = new RegExp(`^(?:export\\s+)?const\\s+${escaped}\\b`, 'm').exec(source);
  const fnMatch = new RegExp(`^function\\s+${escaped}\\b`, 'm').exec(source);
  const chosen =
    constMatch && (!fnMatch || constMatch.index <= fnMatch.index)
      ? { kind: 'const', match: constMatch }
      : fnMatch
        ? { kind: 'function', match: fnMatch }
        : null;
  if (!chosen) return null;

  if (chosen.kind === 'function') {
    const range = sliceFunctionBody(source, chosen.match.index + chosen.match[0].length);
    if (!range) return null;
    return { binding, text: source.slice(range[0], range[1]), start: range[0], end: range[1] };
  }

  let i = chosen.match.index + chosen.match[0].length;
  let paren = 0;
  let brace = 0;
  let bracket = 0;
  while (i < source.length) {
    const skipped = skipTrivia(source, i);
    if (skipped !== i) {
      i = skipped;
      continue;
    }
    const char = source[i];
    if (char === '=' && paren === 0 && brace === 0 && bracket === 0) {
      const range = sliceAfterEquals(source, i);
      return { binding, text: source.slice(range[0], range[1]), start: range[0], end: range[1] };
    }
    if (char === '(') paren += 1;
    else if (char === ')') paren -= 1;
    else if (char === '{') brace += 1;
    else if (char === '}') brace -= 1;
    else if (char === '[') bracket += 1;
    else if (char === ']') bracket -= 1;
    else if (char === ';' && paren === 0 && brace === 0 && bracket === 0) break;
    i += 1;
  }
  return null;
}

function endOfOpeningTag(source, start) {
  let i = start + 1;
  let brace = 0;
  while (i < source.length) {
    const skipped = skipTrivia(source, i);
    if (skipped !== i) {
      i = skipped;
      continue;
    }
    if (source[i] === '{') brace += 1;
    else if (source[i] === '}') brace = Math.max(0, brace - 1);
    else if (source[i] === '>' && brace === 0) return i;
    i += 1;
  }
  return -1;
}

export function openingTagTexts(source, component) {
  const needle = `<${component}`;
  const texts = [];
  let from = 0;
  while (from < source.length) {
    const at = source.indexOf(needle, from);
    if (at < 0) break;
    const next = source[at + needle.length];
    if (next && IDENT.test(next)) {
      from = at + needle.length;
      continue;
    }
    const end = endOfOpeningTag(source, at);
    if (end < 0) break;
    texts.push(source.slice(at, end + 1));
    from = end + 1;
  }
  return texts;
}

function balancedEnd(source, openIndex, openChar, closeChar) {
  let i = openIndex;
  let depth = 0;
  while (i < source.length) {
    const skipped = skipTrivia(source, i);
    if (skipped !== i) {
      i = skipped;
      continue;
    }
    if (source[i] === openChar) depth += 1;
    else if (source[i] === closeChar) {
      depth -= 1;
      if (depth === 0) return i;
    }
    i += 1;
  }
  return -1;
}

function readCall(source, openParen) {
  const end = balancedEnd(source, openParen, '(', ')');
  if (end < 0) return source.slice(openParen);
  return source.slice(openParen, end + 1);
}

function callsOutside(files, definingPath, binding, start, end) {
  const re = new RegExp(`\\b${escapeRegExp(binding)}\\s*\\(`, 'g');
  const found = [];
  for (const [path, text] of files) {
    if (text == null) continue;
    re.lastIndex = 0;
    let match = re.exec(text);
    while (match) {
      const inside = path === definingPath && match.index >= start && match.index < end;
      if (!inside) {
        const openParen = match.index + match[0].length - 1;
        found.push({ path, arg: readCall(text, openParen) });
      }
      match = re.exec(text);
    }
  }
  return found;
}

function topLevelObjects(arrayText) {
  const objects = [];
  let i = 0;
  let depth = 0;
  let objStart = -1;
  while (i < arrayText.length) {
    const skipped = skipTrivia(arrayText, i);
    if (skipped !== i) {
      i = skipped;
      continue;
    }
    if (arrayText[i] === '{') {
      if (depth === 0) objStart = i;
      depth += 1;
    } else if (arrayText[i] === '}') {
      depth -= 1;
      if (depth === 0 && objStart >= 0) {
        objects.push({ text: arrayText.slice(objStart, i + 1), end: i + 1 });
        objStart = -1;
      }
    }
    i += 1;
  }
  return objects;
}

function compoundArray(sliceText) {
  const at = sliceText.indexOf('compoundVariants');
  if (at < 0) return null;
  const bracket = sliceText.indexOf('[', at);
  if (bracket < 0) return null;
  const end = balancedEnd(sliceText, bracket, '[', ']');
  if (end < 0) return null;
  return { text: sliceText.slice(bracket, end + 1), start: bracket, end: end + 1 };
}

function push(violations, ruleId, path, binding, message) {
  violations.push({ ruleId, path, binding: binding ?? null, message });
}

function checkSubstrings(violations, rule, path, binding, text) {
  for (const required of rule.require ?? []) {
    if (!text.includes(required)) {
      push(
        violations,
        rule.id,
        path,
        binding,
        see(binding, `missing ${JSON.stringify(required)}.`),
      );
    }
  }
  for (const forbidden of rule.forbid ?? []) {
    if (text.includes(forbidden)) {
      push(
        violations,
        rule.id,
        path,
        binding,
        see(binding, `must not contain ${JSON.stringify(forbidden)}.`),
      );
    }
  }
  for (const [earlier, later] of rule.order ?? []) {
    const earlierAt = text.indexOf(earlier);
    const laterAt = text.indexOf(later);
    if (earlierAt >= 0 && laterAt >= 0 && earlierAt > laterAt) {
      push(
        violations,
        rule.id,
        path,
        binding,
        see(binding, `${JSON.stringify(earlier)} must appear before ${JSON.stringify(later)}.`),
      );
    }
  }
}

function checkTags(violations, rule, path, tags) {
  if (tags.length === 0 && rule.require.length > 0) {
    push(violations, rule.id, path, rule.component, see(rule.component, 'opening tag is missing.'));
    return;
  }
  for (const tag of tags) checkSubstrings(violations, rule, path, rule.component, tag);
}

function checkBindingRule(violations, files, rule, text) {
  const slice = sliceBinding(text, rule.binding);
  if (!slice) {
    push(violations, rule.id, rule.file, rule.binding, see(rule.binding, 'binding was not found.'));
    return;
  }
  checkSubstrings(violations, rule, rule.file, rule.binding, slice.text);
  for (const mention of rule.invocationMustMention ?? []) {
    for (const call of callsOutside(files, rule.file, rule.binding, slice.start, slice.end)) {
      if (!call.arg.includes(mention)) {
        push(
          violations,
          rule.id,
          call.path,
          rule.binding,
          see(rule.binding, `call must mention ${JSON.stringify(mention)}.`),
        );
      }
    }
  }
}

function checkCompound(violations, rule, text) {
  const slice = sliceBinding(text, rule.binding);
  if (!slice) {
    push(violations, rule.id, rule.file, rule.binding, see(rule.binding, 'binding was not found.'));
    return;
  }
  const array = compoundArray(slice.text);
  if (!array) {
    push(
      violations,
      rule.id,
      rule.file,
      rule.binding,
      see(rule.binding, 'compoundVariants array was not found.'),
    );
    return;
  }
  const cursorObjects = topLevelObjects(array.text).filter((object) =>
    CURSOR_UTILITY.test(object.text),
  );
  const last = cursorObjects.at(-1);
  if (!last || !last.text.includes(rule.guard) || !last.text.includes(rule.winningClass)) {
    push(
      violations,
      rule.id,
      rule.file,
      rule.binding,
      see(
        rule.binding,
        `last cursor compound must include ${rule.guard} and ${rule.winningClass}.`,
      ),
    );
    return;
  }
  const after = slice.text.slice(array.start + last.end);
  if (CURSOR_UTILITY.test(after)) {
    push(
      violations,
      rule.id,
      rule.file,
      rule.binding,
      see(rule.binding, 'a cursor utility appears after the disabled compound.'),
    );
  }
}

export function evaluateCursorContract(files) {
  const violations = [];
  for (const rule of CURSOR_RULES) {
    if (rule.kind === 'src-forbid') {
      const re = new RegExp(rule.pattern);
      for (const [path, text] of files) {
        if (text == null || !path.startsWith(SRC_PREFIX)) continue;
        if (re.test(text)) push(violations, rule.id, path, null, rule.message);
      }
      continue;
    }
    if (rule.kind === 'opening-tag' && rule.file == null) {
      for (const [path, text] of files) {
        if (text == null || !path.startsWith(SRC_PREFIX)) continue;
        if (!path.endsWith('.tsx') && !path.endsWith('.ts')) continue;
        checkTags(violations, rule, path, openingTagTexts(text, rule.component));
      }
      continue;
    }

    const text = files.get(rule.file);
    if (text == null) {
      push(
        violations,
        rule.id,
        rule.file,
        rule.binding ?? rule.component ?? null,
        see(null, `missing ${rule.file}.`),
      );
      continue;
    }
    if (rule.kind === 'binding') checkBindingRule(violations, files, rule, text);
    else if (rule.kind === 'compound-cursor') checkCompound(violations, rule, text);
    else if (rule.kind === 'opening-tag') {
      checkTags(violations, rule, rule.file, openingTagTexts(text, rule.component));
    } else checkSubstrings(violations, rule, rule.file, null, text);
  }

  const claimed = new Set(
    CURSOR_RULES.filter(
      (rule) =>
        rule.file &&
        (rule.kind === 'binding' ||
          rule.kind === 'file' ||
          rule.kind === 'compound-cursor' ||
          rule.kind === 'opening-tag'),
    ).map((rule) => rule.file),
  );
  for (const trip of TRIPWIRES) {
    const re = new RegExp(trip.pattern);
    for (const [path, text] of files) {
      if (text == null || !path.startsWith(SRC_PREFIX)) continue;
      if (!path.endsWith('.ts') && !path.endsWith('.tsx')) continue;
      if (re.test(text) && !claimed.has(path)) {
        push(
          violations,
          'unclaimed-pressable',
          path,
          null,
          see(null, `file matches ${trip.id} and has no cursor rule.`),
        );
      }
    }
  }

  violations.sort(
    (a, b) =>
      a.path.localeCompare(b.path) ||
      a.ruleId.localeCompare(b.ruleId) ||
      (a.binding ?? '').localeCompare(b.binding ?? '') ||
      a.message.localeCompare(b.message),
  );
  return violations.length === 0 ? { ok: true } : { ok: false, violations };
}

function readRepoFile(repoRoot, rel) {
  try {
    return readFileSync(join(repoRoot, ...rel.split('/')), 'utf8').replaceAll('\r\n', '\n');
  } catch {
    return null;
  }
}

function walkSrc(repoRoot, files) {
  const stack = [join(repoRoot, 'packages', 'react', 'src')];
  while (stack.length > 0) {
    const dir = stack.pop();
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) stack.push(abs);
      else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
        const rel = relative(repoRoot, abs).replaceAll('\\', '/');
        files.set(rel, readFileSync(abs, 'utf8').replaceAll('\r\n', '\n'));
      }
    }
  }
}

export function checkCursorContract(repoRoot) {
  const files = new Map();
  for (const rel of ['CONTRIBUTING.md', DOC_LINK]) files.set(rel, readRepoFile(repoRoot, rel));
  walkSrc(repoRoot, files);
  return evaluateCursorContract(files);
}

export function formatViolations(result) {
  if (result.ok) return '';
  return result.violations
    .map((item) => `${item.path} [${item.ruleId}] ${item.binding ?? '-'} ${item.message}`)
    .join('\n');
}

test('cursor contract matches the source and the contributor doc', () => {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
  const result = checkCursorContract(repoRoot);
  assert.equal(result.ok, true, formatViolations(result));
});
