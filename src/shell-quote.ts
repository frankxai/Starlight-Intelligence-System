/**
 * Quote arguments for a shell-spawned child process.
 *
 * Lives in its own module because `cli.ts` runs its main on import — anything that
 * needs this from a test or another module would otherwise print the CLI banner and
 * take the entrypoint's exit path as a side effect of importing a helper.
 *
 * Built on SIP — operational tier (process boundary).
 */

/**
 * Quote one argument so the platform shell passes it through as a single literal.
 *
 * Windows follows the CommandLineToArgvW rules the receiving program will apply:
 * backslashes are only special immediately before a quote, so they are doubled there
 * and before the closing quote, and left alone everywhere else.
 *
 * Residual caveat, deliberately not papered over: cmd.exe still expands `%VAR%` inside
 * double quotes, and there is no in-band escape for it. That is disclosure, not
 * execution. Pass secrets through the environment, never as an argument.
 */
export function quoteShellArg(value: string): string {
  if (process.platform === 'win32') {
    const escaped = value
      .replace(/(\\*)"/g, '$1$1\\"')
      .replace(/(\\+)$/, '$1$1');
    return `"${escaped}"`;
  }
  return `'${value.replace(/'/g, `'\\''`)}'`;
}
