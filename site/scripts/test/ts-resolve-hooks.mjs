/**
 * Lets node's test runner import the extensionless relative specifiers that
 * Next's bundler expects ("./provider"), by trying the TypeScript file next to
 * them. Test-only: the app itself is resolved by Turbopack.
 */
const SUFFIXES = [".ts", ".tsx", "/index.ts"];

export async function resolve(specifier, context, next) {
  if (!specifier.startsWith(".")) return next(specifier, context);
  try {
    return await next(specifier, context);
  } catch (error) {
    for (const suffix of SUFFIXES) {
      try {
        return await next(specifier + suffix, context);
      } catch {
        // try the next suffix
      }
    }
    throw error;
  }
}
