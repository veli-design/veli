import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { ESLint, Linter } from 'eslint';
import { spawnSync } from 'node:child_process';
import { veliContracts, coreNames } from './veli-contracts.mjs';
import { compositionExceptions } from './veli-exceptions.mjs';
import tseslint from 'typescript-eslint';
import repositoryConfig from '../../eslint.veli.config.mjs';
import { veliStyling } from './veli-styling.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const linter = new Linter();
const config = [{ languageOptions: { parser: tseslint.parser } }, veliStyling];
const imports = `
import { Button } from '@veli-design/react/button';
import { Input } from '@veli-design/react/input';
import { PasswordInput } from '@veli-design/react/password-input';
import { OTPInput } from '@veli-design/react/otp-input';
import { Search } from '@veli-design/react/search';
import { TextArea } from '@veli-design/react/textarea';
import { Select, SelectItem } from '@veli-design/react/select';
import { ComboBox } from '@veli-design/react/combobox';
import { DateField } from '@veli-design/react/date-field';
import { DatePicker } from '@veli-design/react/date-picker';
`;

test('copied policy passes the reviewed Oxlint quality config while real errors still fail', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'veli-policy-quality-'));
  try {
    const policy = path.join(directory, 'scripts/lint');
    await mkdir(policy, { recursive: true });
    for (const file of ['veli-contracts.mjs', 'veli-styling.mjs'])
      await cp(path.join(root, 'scripts/lint', file), path.join(policy, file));
    // Exact config from the independent 2026-10-22 source-copy review; this
    // checks copied module code, not @shadcn/lint's separate Oxlint adapter.
    await cp(
      path.join(root, 'scripts/lint/fixtures/govmv.oxlintrc.json'),
      path.join(directory, '.oxlintrc.json'),
    );
    const run = () => {
      const result = spawnSync(
        process.execPath,
        [path.join(root, 'node_modules/oxlint/bin/oxlint'), '.', '--format', 'json'],
        { cwd: directory, encoding: 'utf8', timeout: 15000 },
      );
      return { ...result, report: JSON.parse(result.stdout) };
    };
    const clean = run();
    assert.equal(clean.status, 0, clean.stderr || clean.stdout);
    assert.equal(clean.report.number_of_files, 2);
    assert.deepEqual(clean.report.diagnostics, []);
    await writeFile(path.join(policy, 'quality-negative.mjs'), 'debugger;');
    const negative = run();
    assert.equal(negative.status, 1, negative.stderr || negative.stdout);
    assert.ok(
      negative.report.diagnostics.some(
        (message) => message.code === 'eslint(no-debugger)' && message.severity === 'error',
      ),
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

function messages(code, preamble = imports) {
  const result = linter.verify(`${preamble}\n${code}`, config, {
    filename: path.join(root, 'apps/veli-policy-test.tsx'),
  });
  assert.equal(result.filter((message) => message.fatal).length, 0, JSON.stringify(result));
  assert.ok(
    result.every((message) => message.severity === 1),
    JSON.stringify(result),
  );
  return result;
}

test('Button accepts explicit outer allowances and supported styling props', () => {
  assert.deepEqual(
    messages(
      '<Button size="lg" intent="primary" appearance="ghost" className="mt-4 ms-auto md:w-full min-w-0 self-end justify-self-center order-2" />',
    ),
    [],
  );
});

for (const className of [
  'h-12',
  'size-8',
  'w-48',
  'max-w-full',
  'px-4',
  'rounded-full',
  'bg-button-primary',
  'text-base',
  'justify-end',
  'items-start',
  'absolute',
  'translate-x-2',
]) {
  test(`Button reports ${className}, including Veli token styling`, () => {
    assert.ok(
      messages(`<Button className="${className}" />`).some(
        (message) => message.ruleId === 'shadcn/no-restyle',
      ),
    );
  });
}

for (const name of [
  'Input',
  'PasswordInput',
  'OTPInput',
  'Search',
  'TextArea',
  'Select',
  'ComboBox',
  'DateField',
  'DatePicker',
]) {
  test(`${name} permits only complete-field width`, () => {
    assert.deepEqual(messages(`<${name} className="w-full md:min-w-0" />`), []);
    for (const className of ['mt-4', 'w-64', 'h-12', 'gap-0', 'justify-end', 'px-2']) {
      assert.ok(
        messages(`<${name} className="${className}" />`).some(
          (message) => message.ruleId === 'shadcn/no-restyle',
        ),
        className,
      );
    }
  });
}

test('TextArea sizing APIs and parent-owned layout remain available', () => {
  assert.deepEqual(
    messages(
      '<div className="grid gap-4 w-64 col-span-2"><TextArea rows={8} minHeight={120} maxHeight={320} isResizable className="w-full" /></div>',
    ),
    [],
  );
});

test('arbitrary margin values and CSS variable assignments are reported', () => {
  for (const className of ['m-[13px]', 'm-[var(--custom)]', '[--button-color:red]']) {
    assert.ok(
      messages(`<Button className="${className}" />`).some(
        (message) => message.ruleId === 'shadcn/no-arbitrary-values',
      ),
    );
  }
});

test('Tailwind v4 variants, important modifiers and negative margins retain outer allowances', () => {
  assert.deepEqual(
    messages('<Button className="-mt-4 md:ms-2! data-[pending]:w-full min-w-0!" />'),
    [],
  );
  for (const className of ['hover:h-12!', 'md:!p-4', 'data-[pending]:rounded-full']) {
    assert.ok(
      messages(`<Button className="${className}" />`).some(
        (message) => message.ruleId === 'shadcn/no-restyle',
      ),
    );
  }
});

test('core contracts close the Tailwind v4 CSS-variable shorthand escape hatch', () => {
  for (const className of ['mt-(--gap)', 'order-(--order)', 'md:-mt-(length:--gap)!']) {
    assert.ok(
      messages(`<Button className="${className}" />`).some(
        (message) => message.ruleId === 'shadcn/no-restyle',
      ),
    );
  }
  assert.deepEqual(
    messages(
      '<Skeleton className="w-(--loading-width) h-(--loading-height)" />',
      "import {Skeleton} from '@veli-design/react/skeleton';",
    ),
    [],
  );
});

test('upstream handles conditional helpers, variables, aliases and namespace imports', () => {
  assert.ok(messages('const classes = "h-12"; <Button className={classes} />').length);
  assert.ok(messages('<Button className={cn("w-full", active && "px-4")} />').length);
  assert.ok(
    messages(
      '<Action className="h-12" />',
      "import { Button as Action } from '@veli-design/react/button';",
    ).length,
  );
  assert.ok(
    messages('<UI.Button className="h-12" />', "import * as UI from '@veli-design/react/button';")
      .length,
  );
});

test('internal class props never inherit root width allowances', () => {
  assert.deepEqual(messages('<Button xml:lang="dv" />'), []);
  for (const prop of ['inputClassName', 'popoverClassName', 'calendarClassName', 'classNames']) {
    assert.ok(
      messages(`<DatePicker ${prop}="w-full" />`).some(
        (message) => message.messageId === 'internal',
      ),
    );
  }
  assert.ok(
    messages(
      '<Field inputClassName={classes} />',
      "import {DateField as Field} from '@veli-design/react/date-field';",
    ).some((message) => message.messageId === 'internal'),
  );
  assert.ok(
    messages(
      '<UI.DateField inputClassName="w-full" />',
      "import * as UI from '@veli-design/react/date-field';",
    ).some((message) => message.messageId === 'internal'),
  );
  assert.deepEqual(messages('<DateField inputClassName="" />'), []);
});

test('inline styles and token CSS variable overrides require review', () => {
  for (const style of ['{height: 48}', '{"--veli-color-button-bg": "red"}', 'styles']) {
    assert.ok(
      messages(`<Button style={${style}} />`).some((message) => message.messageId === 'style'),
    );
  }
});

test('icon-only Button className requires review, even when upstream allows width', () => {
  assert.deepEqual(messages('<Button iconOnly aria-label="Close" size="sm" />'), []);
  for (const props of [
    'iconOnly className="w-full"',
    'iconOnly={true} className="min-w-0"',
    'iconOnly={condition} className={classes}',
    'iconOnly className="mt-4"',
  ]) {
    assert.ok(messages(`<Button ${props} />`).some((message) => message.messageId === 'icon'));
  }
  assert.deepEqual(messages('<Button iconOnly={false} className="w-full" />'), []);
});

test('unrelated components, plain elements and shadowed bindings stay outside contracts', () => {
  assert.deepEqual(messages('<div className="h-12" />'), []);
  assert.ok(
    messages('<SelectItem className="p-8" />').some(
      (message) => message.ruleId === 'shadcn/no-restyle' && message.severity === 1,
    ),
  );
  assert.deepEqual(
    messages(
      '<Button className="p-8" inputClassName="w-full" />',
      'import { Button } from "other-library";',
    ),
    [],
  );
  assert.deepEqual(
    messages('function Local(Button) { return <Button inputClassName="w-full" />; }'),
    [],
  );
});

test('shadowed named and namespace imports do not report unrelated local components', () => {
  for (const body of [
    'function Local(Button) { return <Button className="p-8 m-[13px]" />; }',
    'function Local() { const Button = Other; return <Button className={cn("p-8", "m-[13px]")} />; }',
    'function Local(Button) { const props = {className:"p-8"}; return <Button {...props} />; }',
  ]) {
    assert.deepEqual(messages(body), []);
    assert.ok(messages(`${body}\n<Button className="p-8" />`).some((m) => m.severity === 1));
  }
  assert.deepEqual(
    messages(
      'function Local(UI) { return <UI.Button className="p-8 m-[13px]" />; }',
      "import * as UI from '@veli-design/react/button';",
    ),
    [],
  );
  const shared = messages(
    'const classes = "m-[13px]"; function Local(Button) { return <Button className={classes} />; } <Button className={classes} />;',
  );
  assert.equal(shared.filter((m) => m.ruleId === 'shadcn/no-arbitrary-values').length, 1);
});

test('nested static helpers, templates and known object spreads still report forbidden classes', () => {
  for (const expression of [
    'cn("w-full", clsx({"p-8": active}))',
    '`w-full ${active ? "p-8" : "mt-4"}`',
    '("p-8" as string)',
    '("p-8" satisfies string)',
  ]) {
    assert.ok(
      messages(`<Button className={${expression}} />`).some(
        (m) => m.ruleId === 'shadcn/no-restyle',
      ),
    );
  }
  assert.ok(
    messages('<Button {...{className:"p-8"}} />').some((m) => m.ruleId === 'shadcn/no-restyle'),
  );
});

test('custom class-helper aliases are checked when explicitly configured', () => {
  const source = `${imports}import {clsx as mergeClasses} from 'clsx'; <Button className={mergeClasses('p-8')} />`;
  assert.deepEqual(
    messages(
      "import {clsx as mergeClasses} from 'clsx'; <Button className={mergeClasses('p-8')} />",
    ),
    [],
  );
  const custom = {
    ...veliStyling,
    settings: { shadcn: { ...veliStyling.settings.shadcn, mergeFunctions: ['mergeClasses'] } },
  };
  const result = linter.verify(source, [{ languageOptions: { parser: tseslint.parser } }, custom], {
    filename: path.join(root, 'apps/helper-alias.tsx'),
  });
  assert.ok(result.some((m) => m.ruleId === 'shadcn/no-restyle' && m.severity === 1));
});

test('documented upstream limits: generated classes and spread precedence need manual review', () => {
  for (const body of [
    '<Button className={["w-full", "p-8"].join(" ")} />',
    'const classes = cva("p-8"); <Button className={classes()} />',
    '<Button {...{style:{padding:8}}} />',
  ])
    assert.deepEqual(messages(body), []);
  for (const body of [
    '<Button {...{className:"p-8"}} className="w-full" />',
    '<Button className="p-8" {...{className:"w-full"}} />',
  ])
    assert.ok(messages(body).some((m) => m.ruleId === 'shadcn/no-restyle'));
});

test('boundary warnings never suppress independent core violations', () => {
  const result = messages(
    '<Button iconOnly className="p-8" style={{padding:8}} inputClassName="w-full" />',
  );
  assert.equal(
    result.filter((m) => m.ruleId === 'shadcn/no-restyle' && m.severity === 1).length,
    1,
  );
  assert.deepEqual(
    result
      .filter((m) => m.ruleId === 'veli/review-styling-boundaries')
      .map((m) => m.messageId)
      .sort(),
    ['icon', 'internal', 'style'],
  );
});

test('namespace compound parts retain boundary warnings and respect shadowing', () => {
  const preamble = "import * as UI from '@veli-design/react/card';";
  const result = messages('<UI.Card.Content style={{padding:8}} />', preamble);
  assert.equal(result.filter((m) => m.messageId === 'style').length, 1);
  assert.deepEqual(
    messages('function Local(UI) { return <UI.Card.Content style={{padding:8}} />; }', preamble),
    [],
  );
});

test('only the global undefined binding is treated as an empty styling value', () => {
  assert.deepEqual(messages('<Button style={undefined} inputClassName={undefined} />'), []);
  const result = messages(
    'function Local(undefined) { return <Button iconOnly style={undefined} inputClassName={undefined} className={undefined} />; }',
  );
  assert.deepEqual(result.map((m) => m.messageId).sort(), ['icon', 'internal', 'style']);
});

test('erased TypeScript wrappers preserve literal empty and false boundary behavior', () => {
  assert.deepEqual(
    messages(
      '<Button iconOnly={false as const} className="w-full" style={null as any} inputClassName={undefined!} />',
    ),
    [],
  );
  const result = messages(
    '<Button iconOnly={true satisfies boolean} className="w-full" style={styles as any} />',
  );
  assert.deepEqual(result.map((m) => m.messageId).sort(), ['icon', 'style']);
});

test('documented limits: descendant width selectors and class callbacks can pass unread', () => {
  assert.deepEqual(messages('<Input className="[&_input]:w-full" />'), []);
  assert.deepEqual(messages('<div className="[&_button]:p-4"><Button /></div>'), []);
  assert.deepEqual(messages('<Button className={() => "p-4"} />'), []);
  assert.deepEqual(messages('<Button {...unknownProps} />'), []);
});

test('documented limit: consumer re-exports are missed in this package-import setup', async () => {
  const directory = await mkdtemp(path.join(root, '.cache/veli-lint-'));
  try {
    const packageDirectory = path.join(directory, 'node_modules/@veli-design/react');
    await mkdir(packageDirectory, { recursive: true });
    await writeFile(path.join(directory, 'package.json'), '{"private":true}');
    await writeFile(
      path.join(packageDirectory, 'package.json'),
      JSON.stringify({
        name: '@veli-design/react',
        type: 'module',
        exports: { './button': './button.tsx' },
      }),
    );
    await writeFile(
      path.join(packageDirectory, 'button.tsx'),
      'export function Button(props) { return <button {...props} />; }',
    );
    await writeFile(
      path.join(directory, 'barrel.ts'),
      'export { Button as Action } from "@veli-design/react/button";',
    );
    const filename = path.join(directory, 'consumer.tsx');
    const verify = (source) => linter.verify(source, config, { filename });
    assert.deepEqual(verify('import {Action} from "./barrel"; <Action className="p-4" />'), []);
    assert.deepEqual(
      verify('import {Action} from "./barrel"; <Action iconOnly className="w-full" />'),
      [],
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('warning-only config reports core classes, preserves narrow directives, and excludes implementation', async () => {
  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: true,
    overrideConfig: repositoryConfig,
  });
  const code = `${imports}\n<Button className="h-12" />`;
  const [result] = await eslint.lintText(code, { filePath: 'apps/consumer.tsx' });
  assert.equal(result.errorCount, 0);
  assert.equal(result.warningCount, 1);
  const [exception] = await eslint.lintText(
    `${imports}\n// eslint-disable-next-line shadcn/no-restyle -- PD-809: preserve accessibility repair pending Veli support\n<Button className="h-12" />`,
    { filePath: 'apps/consumer.tsx' },
  );
  assert.equal(exception.warningCount, 0);
  assert.equal(exception.errorCount, 0);
  const [implementation] = await eslint.lintText(code, {
    filePath: 'packages/react/src/policy-test.tsx',
  });
  assert.equal(implementation.warningCount, 0);
  assert.equal(implementation.errorCount, 0);
});

test('the separate config recognizes quality directives without enabling quality rules', async () => {
  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: true,
    overrideConfig: repositoryConfig,
  });
  const [result] = await eslint.lintText(
    `${imports}
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
<><img src="example.png" /><Button className="p-8" /></>`,
    { filePath: 'apps/quality-directive-test.tsx' },
  );
  assert.deepEqual(
    result.messages.map((m) => m.ruleId),
    ['shadcn/no-restyle'],
  );
});

// Ensure fixture creation works in clean checkouts before the async barrel test.
await mkdir(path.join(root, '.cache'), { recursive: true });

for (const entry of veliContracts) {
  for (const name of entry.names) {
    test(`${name} has a warning contract protecting padding`, () => {
      const result = messages(
        `<${name} className="p-9" />`,
        `import {${name}} from '@veli-design/react/${entry.module}';`,
      );
      assert.ok(
        result.some((message) => message.ruleId === 'shadcn/no-restyle' && message.severity === 1),
        JSON.stringify(result),
      );
    });
  }
}

test('every configured component is a real public runtime export', async () => {
  const packageRoot = path.join(root, 'packages/react');
  const manifest = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
  const modules = new Map();
  for (const entry of veliContracts) {
    if (!modules.has(entry.module)) {
      const target = manifest.exports[`./${entry.module}`];
      const file = typeof target === 'string' ? target : (target?.import ?? target?.default);
      assert.equal(typeof file, 'string', entry.module);
      const { ast } = tseslint.parser.parseForESLint(
        await readFile(path.join(packageRoot, file), 'utf8'),
        {
          sourceType: 'module',
          ecmaVersion: 'latest',
        },
      );
      const names = ast.body.flatMap((node) => {
        if (node.type !== 'ExportNamedDeclaration') return [];
        if (node.declaration?.id) return [node.declaration.id.name];
        if (node.declaration?.declarations)
          return node.declaration.declarations.map((d) => d.id.name);
        return node.specifiers.map(
          (specifier) => specifier.exported.name ?? specifier.exported.value,
        );
      });
      modules.set(entry.module, new Set(names));
    }
    for (const name of entry.names)
      assert.ok(modules.get(entry.module).has(name), `${entry.module} does not export ${name}`);
  }
});

test('contract table has exactly the reviewed extra-value coverage and no broad category allowances', () => {
  for (const setting of Object.values(veliStyling.rules))
    assert.equal(Array.isArray(setting) ? setting[0] : setting, 'warn');
  assert.deepEqual(coreNames, [
    'Button',
    'Input',
    'PasswordInput',
    'OTPInput',
    'Search',
    'TextArea',
    'Select',
    'ComboBox',
    'DateField',
    'DatePicker',
  ]);
  const names = veliContracts.flatMap((entry) => entry.names);
  assert.equal(names.length, 97);
  assert.equal(
    veliContracts.filter((entry) => entry.coverage === 'classes').flatMap((entry) => entry.names)
      .length,
    87,
  );
  assert.equal(new Set(names).size, names.length);
  assert.ok(!names.includes('PageTab'));
  for (const entry of veliContracts) {
    assert.ok(
      !entry.allow.some((value) =>
        [
          'layout',
          'spacing',
          'color',
          'typography',
          'shape',
          'effects',
          'motion',
          '*',
          'flex-*',
        ].includes(value),
      ),
    );
  }
});

test('new complete-field and surface roots have explicit positive allowances', () => {
  for (const [module, name, classes] of [
    ['checkbox', 'CheckboxGroup', 'w-full min-w-0'],
    ['dropzone', 'DropzoneField', 'w-full min-w-0'],
    ['card', 'Card', 'mt-4 w-full'],
    ['badge', 'Badge', 'ms-2 shrink-0'],
    ['calendar', 'RangeCalendar', 'mt-4'],
    ['table', 'TableCell', 'text-end whitespace-nowrap'],
    ['skeleton', 'Skeleton', 'w-[137px] h-[29px] rounded-full'],
  ])
    assert.deepEqual(
      messages(
        `<${name} className="${classes}" />`,
        `import {${name}} from '@veli-design/react/${module}';`,
      ),
      [],
    );
});

test('content flex-group matching retains its current scope without broad layout permission', () => {
  for (const [module, name] of [
    ['card', 'Card'],
    ['modal', 'Modal'],
    ['popover', 'Popover'],
  ]) {
    const preamble = `import {${name}} from '@veli-design/react/${module}';`;
    assert.deepEqual(messages(`<${name}.Content className="flex-1 flex-auto" />`, preamble), []);
    for (const className of ['basis-1', 'shrink-0'])
      assert.ok(messages(`<${name}.Content className="${className}" />`, preamble).length);
  }
  assert.ok(messages('<Button className="flex-1" />').length);
});

test('compound parts and namespace aliases use their actual slot contracts', () => {
  for (const [module, rootName, part, valid] of [
    ['card', 'Card', 'Content', 'grid gap-4 w-full'],
    ['modal', 'Modal', 'Content', 'flex flex-col gap-2'],
    ['table', 'Table', 'Cell', 'text-center whitespace-normal'],
    ['alert', 'Alert', 'Actions', 'justify-end flex-wrap'],
  ]) {
    const preamble = `import {${rootName} as Surface} from '@veli-design/react/${module}';`;
    assert.deepEqual(messages(`<Surface.${part} className="${valid}" />`, preamble), []);
    assert.ok(
      messages(`<Surface.${part} className="p-8" />`, preamble).some(
        (message) => message.ruleId === 'shadcn/no-restyle',
      ),
    );
  }
  assert.deepEqual(
    messages(
      '<C.CardContent className="grid gap-4" />',
      "import * as C from '@veli-design/react/card';",
    ),
    [],
  );
  assert.ok(
    messages(
      '<Surface.Content style={styles} />',
      "import {Card as Surface} from '@veli-design/react/card';",
    ).some((message) => message.messageId === 'style'),
  );
});

test('portal sizing and orientation-dependent Divider lengths remain review decisions', () => {
  for (const [module, name, classes] of [
    ['popover', 'Popover', 'max-w-[90vw] max-h-80 overflow-y-auto'],
    ['divider', 'Divider', 'h-8'],
  ]) {
    const result = messages(
      `<${name} className="${classes}" />`,
      `import {${name}} from '@veli-design/react/${module}';`,
    );
    assert.ok(result.length > 0 && result.every((message) => message.severity === 1));
  }
});

test('repository exceptions are closed, exact-file and Button-only', async () => {
  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: true,
    overrideConfig: repositoryConfig,
  });
  for (const exception of compositionExceptions) {
    assert.ok(
      exception.reason.includes('PD-809') && exception.status && !exception.file.includes('*'),
    );
    const [allowed] = await eslint.lintText(
      `${imports}\n<Button className="${exception.classes.join(' ')}" />`,
      { filePath: exception.file },
    );
    assert.equal(allowed.errorCount, 0, JSON.stringify(allowed.messages));
    assert.equal(allowed.warningCount, 0, JSON.stringify(allowed.messages));
    const [stillReported] = await eslint.lintText(
      `${imports}\n<><Button className="p-8" /><Input className="p-8" /><Button className="m-[13px]" /><Button className="mt-(--gap)" /></>`,
      { filePath: exception.file },
    );
    assert.equal(stillReported.errorCount, 0, JSON.stringify(stillReported.messages));
    assert.equal(stillReported.warningCount, 4, JSON.stringify(stillReported.messages));
    const [outside] = await eslint.lintText(
      `${imports}\n<Button className="${exception.classes.join(' ')}" />`,
      { filePath: 'apps/unapproved-consumer.tsx' },
    );
    assert.equal(outside.errorCount, 0);
    assert.ok(outside.warningCount > 0);
  }
});

test('actual CLI verifies diagnostics, severity, shadowing, parse failures and exit status', () => {
  const args = [
    'node_modules/eslint/bin/eslint.js',
    '--config',
    'eslint.veli.config.mjs',
    '--stdin',
    '--stdin-filename',
    'apps/policy-cli.tsx',
    '--format',
    'json',
  ];
  for (const [source, expected, expectedRules] of [
    [
      'import {Button} from \'@veli-design/react/button\'; <Button className="p-8" />',
      0,
      ['shadcn/no-restyle'],
    ],
    [
      'import {Badge} from \'@veli-design/react/badge\'; <Badge className="p-8" />',
      0,
      ['shadcn/no-restyle'],
    ],
    [`${imports}function Local(Button) {return <Button className="p-8 m-[13px]" />;}`, 0, []],
    [
      `${imports}<Button iconOnly className="p-8" style={{padding:8}} />`,
      0,
      ['shadcn/no-restyle', 'veli/review-styling-boundaries', 'veli/review-styling-boundaries'],
    ],
    [`${imports}<Button className="mt-(--gap)" />`, 0, ['shadcn/no-restyle']],
    [`${imports}<Button className="m-[13px]" />`, 0, ['shadcn/no-arbitrary-values']],
    [
      'import * as UI from "@veli-design/react/card"; <UI.Card.Content style={{padding:8}} />',
      0,
      ['veli/review-styling-boundaries'],
    ],
    [
      `${imports}function Local(undefined) {return <Button style={undefined} />;}`,
      0,
      ['veli/review-styling-boundaries'],
    ],
    [`${imports}<Button className={`, 1, [null]],
  ]) {
    const result = spawnSync(process.execPath, args, {
      cwd: root,
      input: source,
      encoding: 'utf8',
      timeout: 15000,
    });
    assert.equal(result.status, expected, result.stderr || result.stdout);
    const [report] = JSON.parse(result.stdout);
    assert.deepEqual(report.messages.map((m) => m.ruleId).sort(), expectedRules.sort());
    assert.equal(report.fatalErrorCount, expectedRules.includes(null) ? 1 : 0);
    assert.equal(report.errorCount, expectedRules.includes(null) ? 1 : 0);
    assert.equal(report.warningCount, expectedRules.includes(null) ? 0 : expectedRules.length);
    assert.ok(report.messages.every((m) => m.severity === (m.fatal ? 2 : 1)));
  }
});

test('normal repository quality lint still fails real quality errors', () => {
  const result = spawnSync(
    process.execPath,
    [
      'node_modules/eslint/bin/eslint.js',
      '--stdin',
      '--stdin-filename',
      'apps/policy-quality.tsx',
      '--format',
      'json',
    ],
    { cwd: root, input: 'debugger;', encoding: 'utf8', timeout: 15000 },
  );
  assert.equal(result.status, 1, result.stderr || result.stdout);
  const [report] = JSON.parse(result.stdout);
  assert.ok(report.messages.some((m) => m.ruleId === 'no-debugger' && m.severity === 2));
});

test('actual CLI still fails malformed contracts, invalid rule options, missing plugins and config loads', async () => {
  const directory = await mkdtemp(path.join(root, '.cache/veli-config-'));
  try {
    const file = path.join(directory, 'eslint.config.mjs');
    for (const [rules, expected] of [
      [
        { 'shadcn/no-restyle': ['warn', { contracts: [{ pattern: '[' }] }] },
        /not a valid regular expression/,
      ],
      [
        { 'shadcn/no-arbitrary-values': ['warn', { contracts: [{ pattern: '[' }] }] },
        /not a valid regular expression/,
      ],
      [{ 'shadcn/no-arbitrary-values': ['warn', { allow: 42 }] }, /should be array/],
      [{ 'missing-plugin/no-restyle': 'warn' }, /could not find plugin/i],
      [null, /PD-809 configuration load failure/],
    ]) {
      await writeFile(
        file,
        rules
          ? `import base from '../../eslint.veli.config.mjs'; export default [...base, {rules:${JSON.stringify(rules)}}];`
          : 'throw new Error("PD-809 configuration load failure");',
      );
      const result = spawnSync(
        process.execPath,
        [
          'node_modules/eslint/bin/eslint.js',
          '--config',
          file,
          '--stdin',
          '--stdin-filename',
          'apps/policy-cli.tsx',
        ],
        {
          cwd: root,
          input: `${imports}<Button className="w-full" />`,
          encoding: 'utf8',
          timeout: 15000,
        },
      );
      assert.equal(result.status, 2, result.stderr || result.stdout);
      assert.match(result.stderr, expected);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('documented consumer config works outside the workspace with copied policy and built public entries', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'veli-contract-consumer-'));
  try {
    await writeFile(path.join(directory, 'package.json'), '{"private":true,"type":"module"}');
    const policyDirectory = path.join(directory, 'scripts/lint');
    await mkdir(policyDirectory, { recursive: true });
    for (const file of ['veli-contracts.mjs', 'veli-styling.mjs']) {
      await cp(path.join(root, 'scripts/lint', file), path.join(policyDirectory, file));
    }
    // Reuse the installed linter runtime, but copy the actual UI public package
    // files: component resolution must work without workspace links or exceptions.
    const modules = path.join(directory, 'node_modules');
    await mkdir(path.join(modules, '@shadcn'), { recursive: true });
    for (const name of ['eslint', 'typescript-eslint', '@shadcn/lint']) {
      await symlink(path.join(root, 'node_modules', name), path.join(modules, name), 'dir');
    }
    const ui = path.join(modules, '@veli-design/react');
    await mkdir(ui, { recursive: true });
    await cp(path.join(root, 'packages/react/package.json'), path.join(ui, 'package.json'));
    await cp(path.join(root, 'packages/react/dist'), path.join(ui, 'dist'), { recursive: true });
    const docs = await readFile(path.join(root, 'docs/VELI_STYLING.md'), 'utf8');
    const example = docs.match(/3\. Reuse[\s\S]*?```js\n([\s\S]*?)\n {3}```/);
    assert.ok(example, 'consumer config must remain executable documentation');
    await writeFile(path.join(directory, 'eslint.veli.config.mjs'), example[1]);
    const eslint = new ESLint({
      cwd: directory,
      overrideConfigFile: path.join(directory, 'eslint.veli.config.mjs'),
    });
    const wrapper = path.join(directory, 'wrapper.tsx');
    await writeFile(
      wrapper,
      `${imports}function Action({className}) {return <Button className={className} />;} <Action className="p-8" />`,
    );
    const [wrapperResult] = await eslint.lintFiles([wrapper]);
    assert.equal(wrapperResult.errorCount, 0, JSON.stringify(wrapperResult.messages));
    assert.equal(wrapperResult.warningCount, 1, JSON.stringify(wrapperResult.messages));
    assert.equal(wrapperResult.messages[0].ruleId, 'shadcn/no-restyle');

    for (const [source, errors, warnings] of [
      [`${imports}<><Button className="mt-4 w-full" /><Input className="w-full" /></>`, 0, 0],
      [`${imports}<><Button className="p-8" /><Input className="mt-4" /></>`, 0, 2],
      [
        'import {Card} from \'@veli-design/react/card\'; <Card.Content className="grid gap-4" />',
        0,
        0,
      ],
      ['import {Card} from \'@veli-design/react/card\'; <Card.Content className="p-8" />', 0, 1],
      [`${imports}<Button className="ring-2" />`, 0, 1],
      [`${imports}<Button className="mt-(--custom-gap)" />`, 0, 1],
      [`${imports}function Local(Button) {return <Button className="p-8 m-[13px]" />;}`, 0, 0],
      [
        'import * as UI from "@veli-design/react/card"; <UI.Card.Content style={{padding:8}} />',
        0,
        1,
      ],
    ]) {
      const [result] = await eslint.lintText(source, { filePath: 'example.tsx' });
      assert.equal(result.errorCount, errors, JSON.stringify(result.messages));
      assert.equal(result.warningCount, warnings, JSON.stringify(result.messages));
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
