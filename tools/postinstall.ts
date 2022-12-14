import * as execa from 'execa';

/**
 * In certain circumstances we might want to skip the below the steps when another
 * tool is invoking the install command (such as when nx migrate runs).
 * We therefore use an env var for this.
 */

if (process.env.SKIP_POSTINSTALL) {
  console.log(
    '\nSkipping postinstall script because $SKIP_POSTINSTALL is set...\n',
  );
  // eslint-disable-next-line no-process-exit
  process.exit(0);
}

void (async function (): Promise<void> {
  // Apply patches to installed node_modules
  await $`yarn patch-package`;

  // Install git hooks
  await $`yarn husky install`;

  // Clean any caches that may be invalid now
  await $`yarn clean`;

  // Build all the packages ready for use
  await $`yarn build`;
})();

async function $(cmd: TemplateStringsArray): Promise<execa.ExecaChildProcess> {
  const command = cmd.join();
  console.log(`\n$ ${command}`);
  return execa.command(command, {
    stdio: 'inherit',
  });
}
