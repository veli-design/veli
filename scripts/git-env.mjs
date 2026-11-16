import { execFileSync } from 'node:child_process';
import process from 'node:process';

// Git exports repository-selection variables to hooks. Explicit cwd/--git-dir
// operations must not inherit the caller's repository or index. Preserve all
// non-repository variables such as GIT_SSH_COMMAND. Git-local configuration
// propagation (GIT_CONFIG*) is deliberately cleared as part of that context;
// the caller's environment and the outer push's credentials are never changed.
const repositoryVariables = new Set(
  execFileSync('git', ['rev-parse', '--local-env-vars'], { encoding: 'utf8' })
    .trim()
    .split(/\r?\n/),
);

export function localGitEnv(environment = process.env) {
  return Object.fromEntries(
    Object.entries(environment).filter(([name]) => !repositoryVariables.has(name)),
  );
}
