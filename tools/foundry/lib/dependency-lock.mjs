import { readUtf8 } from "./io.mjs";

/** Resolve only the root importer's exact registry dependencies, never a transitive match. */
export function readPnpmDependencyLock(path) {

const parseLock = (text) => {
    const lines = text.split('\n');
    let lockfileVersion = null;
    let importers = null;
    let packages = null;

    let section = null;
    let currentImporter = null;
    let currentPackage = null;
    let currentDeptype = null;

    for (let line of lines) {
      if (!line.trim() || line.startsWith('#')) continue;

      const indent = line.search(/\S/);
      const content = line.trim();

      if (indent === 0) {
        if (content.startsWith('lockfileVersion:')) {
          lockfileVersion = content.split(':')[1].trim().replace(/['"]/g, '');
        } else if (content === 'importers:') {
          section = 'importers';
          importers = {};
        } else if (content === 'packages:' || content === 'snapshots:') {
          section = 'packages'; // Handle both packages and snapshots section for integrity
          if (!packages) packages = {};
        } else {
          section = null;
        }
        continue;
      }

      if (section === 'importers') {
        if (indent === 2) {
          const match = content.match(/^'?([^']+)'?:/);
          if (match) {
             currentImporter = match[1];
             if (currentImporter === '.') {
                 importers['.'] = { dependencies: {}, devDependencies: {} };
             }
          }
        } else if (indent === 4 && currentImporter === '.') {
          if (content === 'dependencies:') currentDeptype = 'dependencies';
          else if (content === 'devDependencies:') currentDeptype = 'devDependencies';
          else currentDeptype = null;
        } else if (indent === 6 && currentImporter === '.' && currentDeptype) {
           const match = content.match(/^'?([^']+)'?:\s*(.*)/);
           if (match) {
               const pkg = match[1];
               const rest = match[2];
               if (rest && rest !== '{' && rest !== '') {
                    const objMatch = rest.match(/specifier:\s*['"]?([^'",]+)['"]?,\s*version:\s*['"]?([^'",}]+)['"]?/);
                    if (objMatch) importers['.'][currentDeptype][pkg] = { version: objMatch[2] };
                    else if (rest.startsWith('{')) {
                        // handled on next lines if multiline
                    } else importers['.'][currentDeptype][pkg] = { version: rest.replace(/['"]/g, '') };
               } else if (!rest || rest === '{') {
                   // next line
                   importers['.'][currentDeptype][pkg] = {};
               }
           }
        } else if (indent === 8 && currentImporter === '.' && currentDeptype) {
            const match = content.match(/^version:\s*(.*)/);
            if (match) {
               const val = match[1].replace(/['"]/g, '');
               const pkgs = Object.keys(importers['.'][currentDeptype]);
               const lastPkg = pkgs[pkgs.length - 1];
               importers['.'][currentDeptype][lastPkg].version = val;
            }
        }
      }

      if (section === 'packages') {
        if (indent === 2) {
           const match = content.match(/^'?([^']+)'?:/);
           if (match) {
              currentPackage = match[1];
              if (!packages[currentPackage]) packages[currentPackage] = { resolution: {} };
           }
        } else if (indent === 4 && currentPackage) {
           if (content.startsWith('resolution:')) {
               const match = content.match(/integrity:\s*([^,}]+)/);
               if (match) {
                   packages[currentPackage].resolution.integrity = match[1].replace(/['"]/g, '').trim();
               }
           } else if (content.startsWith('integrity:')) { // sometimes at indent 4 inside snapshots
               const match = content.match(/integrity:\s*(.*)/);
               if (match) {
                   packages[currentPackage].resolution.integrity = match[1].replace(/['"]/g, '').trim();
               }
           }
        } else if (indent === 6 && currentPackage) {
            const match = content.match(/^integrity:\s*(.*)/);
            if (match) {
               packages[currentPackage].resolution.integrity = match[1].replace(/['"]/g, '');
            }
        } else if (indent === 8 && currentPackage) {
             const match = content.match(/^integrity:\s*(.*)/);
             if (match) {
                 packages[currentPackage].resolution.integrity = match[1].replace(/['"]/g, '');
             }
        }
      }

    }
    return { lockfileVersion, importers, packages };
  };

const lock = parseLock(readUtf8(path));
  if (lock?.lockfileVersion !== "9.0" || !lock.importers?.["."] || !lock.packages) {
    throw new Error("Unsupported or incomplete pnpm dependency lock");
  }
  const importer = lock.importers["."];
  const packages = {};
  for (const [name, reference] of Object.entries({ ...importer.dependencies, ...importer.devDependencies })) {
    if (typeof reference?.version !== "string") throw new Error(`Missing root dependency version: ${name}`);
    // Local packages cannot establish registry validator provenance.
    if (reference.version.startsWith("link:")) continue;
    const version = reference.version.split("(")[0];
    if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
      throw new Error(`Non-registry root dependency: ${name}`);
    }
    const integrity = lock.packages[`${name}@${version}`]?.resolution?.integrity;
    if (typeof integrity !== "string" || !/^sha512-[A-Za-z0-9+/]+={0,2}$/.test(integrity)) {
      throw new Error(`Missing root dependency integrity: ${name}`);
    }
    packages[`node_modules/${name}`] = { version, integrity };
  }
  return { packages };
}
