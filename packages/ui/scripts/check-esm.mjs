import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import ts from 'typescript';

export function checkEsm(directory) {
  const errors = [];
  let files = 0;
  function visitDirectory(path) {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const filename = resolve(path, entry.name);
      if (entry.isDirectory()) visitDirectory(filename);
      else if (entry.name.endsWith('.js')) {
        files++;
        const source = ts.createSourceFile(
          filename,
          readFileSync(filename, 'utf8'),
          ts.ScriptTarget.Latest,
          true,
          ts.ScriptKind.JS,
        );
        function visit(node) {
          const specifier =
            ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
              ? node.moduleSpecifier
              : ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword
                ? node.arguments[0]
                : undefined;
          if (specifier && ts.isStringLiteralLike(specifier) && /^\.\.?\//.test(specifier.text)) {
            const location = source.getLineAndCharacterOfPosition(specifier.getStart(source));
            const label = `${filename}:${location.line + 1}: ${specifier.text}`;
            if (!specifier.text.endsWith('.js'))
              errors.push(`${label}: relative ESM imports must end in .js`);
            else {
              try {
                if (!statSync(resolve(dirname(filename), specifier.text)).isFile())
                  throw new Error('not a file');
              } catch {
                errors.push(`${label}: target file does not exist`);
              }
            }
          }
          ts.forEachChild(node, visit);
        }
        visit(source);
      }
    }
  }
  visitDirectory(directory);
  if (!files) errors.push(`${directory}: no JavaScript files found`);
  if (errors.length) throw new Error(errors.join('\n'));
  return files;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const count = checkEsm(fileURLToPath(new URL('../dist/', import.meta.url)));
  console.log(`Verified relative ESM imports in all ${count} published JavaScript files.`);
}
