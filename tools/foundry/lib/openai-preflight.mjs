import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import semver from "semver";
import { parse as parseYaml } from "yaml";
import {
  assertNoSymlinkPath,
  hashFile,
  readJson,
  verifyFileDigestClosure,
} from "./io.mjs";
import { openAIPluginPayload } from "./package-payload.mjs";
import { getContract, loadContractRegistry, validateValue } from "./schema.mjs";

export { openAIPluginPayload } from "./package-payload.mjs";

const DEFAULT_RULES = fileURLToPath(
  new URL("../../../foundry/validators/openai/plugin-rules.v2026-09-01.json", import.meta.url),
);
const DEFAULT_TOOLCHAIN_LOCK = fileURLToPath(
  new URL("../../../foundry/validators/toolchain.lock.v1.json", import.meta.url),
);
const DEFAULT_NPM_LOCK = fileURLToPath(new URL("../../../package-lock.json", import.meta.url));
const DEFAULT_CONTRACTS = fileURLToPath(new URL("../../../foundry/contracts", import.meta.url));
const IMPLEMENTATION_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(IMPLEMENTATION_PATH), "..", "..", "..");
const FORBIDDEN_TEXT = /[\u0000-\u001f\u007f-\u009f\u061c\u200b-\u200f\u2028-\u202e\u2060\u2066-\u2069\ufeff]/u;
const IMPLEMENTATION_PACKAGES = ["fast-xml-parser", "semver", "yaml"];
const SOURCE_CLOSURE_PATHS = [
  "foundry/contracts/openai-submission-profile.schema.json",
  "package-lock.json",
  "package.json",
  "tools/foundry/lib/io.mjs",
  "tools/foundry/lib/openai-preflight.mjs",
  "tools/foundry/lib/package-payload.mjs",
  "tools/foundry/lib/schema.mjs",
];
const SVG_NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/u;
const SVG_PARSER = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseAttributeValue: false,
  parseTagValue: false,
  processEntities: false,
  trimValues: true,
});

function supportedText(value, { maximum, allowLineBreaks = false, singleLine = false } = {}) {
  const textForCharacterCheck =
    typeof value === "string" && allowLineBreaks ? value.replace(/[\r\n]/gu, "") : value;
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    (maximum === undefined || value.length <= maximum) &&
    !FORBIDDEN_TEXT.test(textForCharacterCheck) &&
    (!singleLine || !/[\r\n]/u.test(value))
  );
}

function svgDimensions(document) {
  const rootNames = Object.keys(document).filter((name) => name !== "?xml");
  if (rootNames.length !== 1 || rootNames[0] !== "svg") return null;
  const root = document.svg;
  if (!root || typeof root !== "object" || Array.isArray(root)) return null;

  const parseNumber = (value) => {
    const source = typeof value === "number" ? String(value) : value;
    if (typeof source !== "string" || !SVG_NUMBER.test(source.trim())) return null;
    const parsed = Number(source);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const viewBox = root["@_viewBox"];
  if (typeof viewBox === "string") {
    const values = viewBox.trim().split(/[\s,]+/u);
    if (values.length === 4) {
      const numbers = values.map(parseNumber);
      if (numbers.every((value) => value !== null) && numbers[2] > 0 && numbers[3] > 0) {
        return { width: numbers[2], height: numbers[3] };
      }
    }
    return null;
  }

  const width = parseNumber(root["@_width"]);
  const height = parseNumber(root["@_height"]);
  return width !== null && height !== null && width > 0 && height > 0
    ? { width, height }
    : null;
}

function normalizedPrompt(value) {
  return value.normalize("NFC").replace(/\s+/gu, " ").trim();
}

function validHttpsUrl(value, maximum) {
  if (!supportedText(value, { maximum, singleLine: true })) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function validMcpDependencyUrl(value, maximum) {
  if (!validHttpsUrl(value, maximum)) return false;
  const url = new URL(value);
  return !url.search && !url.hash;
}

function validOpenAIToolDependency(tool, rules) {
  if (!tool || typeof tool !== "object" || Array.isArray(tool)) return false;
  const keys = Object.keys(tool).sort();
  if (keys.join("|") !== "description|transport|type|url|value") return false;
  return (
    tool.type === "mcp" &&
    supportedText(tool.value, {
      maximum: rules.skillPayload.openaiMcpDependencyValueMaxLength,
      singleLine: true,
    }) &&
    /^[A-Za-z0-9][A-Za-z0-9._/-]*$/u.test(tool.value) &&
    supportedText(tool.description, {
      maximum: rules.skillPayload.openaiMcpDependencyDescriptionMaxLength,
      singleLine: true,
    }) &&
    rules.skillPayload.openaiMcpDependencyTransports.includes(tool.transport) &&
    validMcpDependencyUrl(tool.url, rules.listing.urlMaxLength)
  );
}

function relativeLuminance(hex) {
  const channels = hex.match(/[a-f\d]{2}/gi).map((value) => Number.parseInt(value, 16) / 255);
  return channels
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
    .reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrastRatio(left, right) {
  const brightest = Math.max(left, right);
  const darkest = Math.min(left, right);
  return (brightest + 0.05) / (darkest + 0.05);
}

function decodeUtf8(path) {
  return new TextDecoder("utf-8", { fatal: true }).decode(readFileSync(path));
}

function parseSkillMarkdown(source) {
  if (!source.startsWith("---\n")) throw new Error("missing YAML frontmatter delimiter");
  const end = source.indexOf("\n---\n", 4);
  if (end === -1) throw new Error("missing closing YAML frontmatter delimiter");
  const fields = parseYaml(source.slice(4, end), { uniqueKeys: true });
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
    throw new Error("frontmatter must be a YAML mapping");
  }
  return { fields, body: source.slice(end + 5) };
}

function addCheck(checks, id, passed, message, details = {}) {
  checks.push({ id, status: passed ? "pass" : "fail", message, ...details });
}

function markdownFiles(root) {
  const files = [];
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Refusing symbolic link in OpenAI plugin skills: ${path}`);
      if (entry.isDirectory()) walk(path);
      if (entry.isFile() && entry.name.endsWith(".md")) files.push(path);
    }
  }
  walk(root);
  return files.sort();
}

function validateAsset({ packageDirectory, path: configuredPath, rules, id, checks }) {
  const validPath =
    supportedText(configuredPath, { maximum: 1000, singleLine: true }) &&
    configuredPath.startsWith("./") &&
    !configuredPath.split(/[\\/]/u).includes("..");
  if (!validPath) {
    addCheck(
      checks,
      id,
      false,
      `${id} must be a clean package-relative path beginning with ./ and containing no traversal`,
    );
    return;
  }
  const path = assertNoSymlinkPath(packageDirectory, configuredPath);
  if (!existsSync(path) || !lstatSync(path).isFile()) {
    addCheck(checks, id, false, `${id} asset is missing`, { path: configuredPath });
    return;
  }
  const extension = extname(path).toLowerCase();
  const allowedExtension = rules.listing.assetExtensions.includes(extension);
  const digest = hashFile(path);
  let dimensions = null;
  let decoded = false;
  let typeMatches = false;
  try {
    if (extension === ".svg") {
      const source = decodeUtf8(path);
      if (!/<!DOCTYPE|<!ENTITY/iu.test(source) && XMLValidator.validate(source) === true) {
        dimensions = svgDimensions(SVG_PARSER.parse(source));
        decoded = Boolean(dimensions && dimensions.width > 0 && dimensions.height > 0);
        typeMatches = Boolean(dimensions);
      }
    } else {
      // Fail closed until a bounded, vulnerability-reviewed raster decoder is pinned.
      decoded = false;
      typeMatches = false;
    }
  } catch {
    decoded = false;
  }
  const square = Boolean(
    decoded &&
      dimensions.width === dimensions.height &&
      dimensions.width >= 48 &&
      (extension === ".svg" || dimensions.width <= rules.listing.rasterAssetMaxDimension) &&
      Number.isFinite(dimensions.width),
  );
  const passed =
    allowedExtension && typeMatches && digest.bytes <= rules.listing.assetMaxBytes && square;
  addCheck(
    checks,
    id,
    passed,
    passed
      ? `${id} is present, valid UTF-8 XML, type-matched, square, and within the configured size limit`
      : `${id} violates the configured path, safe-decode, type, dimension, or size rule; this local validator currently accepts SVG assets only`,
    { path: configuredPath, sha256: digest.sha256, bytes: digest.bytes, dimensions },
  );
}

function validateSkillPayload({ manifestName, skillsPath, rules, checks }) {
  const entries = readdirSync(skillsPath, { withFileTypes: true });
  const skillDirectories = entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith("."));
  const structureErrors = [];
  const nonImmediateSkillManifests = markdownFiles(skillsPath)
    .filter((path) => basename(path) === "SKILL.md")
    .map((path) => relative(skillsPath, path).split(sep).join("/"))
    .filter((path) => path.split("/").length !== 2);
  if (skillDirectories.length === 0) structureErrors.push("at least one immediate skill directory is required");
  for (const path of nonImmediateSkillManifests) {
    structureErrors.push(`${path} is not an immediate skills/<skill>/SKILL.md manifest`);
  }
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith(".")) structureErrors.push(`${entry.name} is hidden`);
  }

  const identityErrors = [];
  const metadataErrors = [];
  const skillNames = [];
  for (const entry of skillDirectories) {
    const directory = assertNoSymlinkPath(skillsPath, entry.name);
    const skillPath = assertNoSymlinkPath(directory, "SKILL.md");
    if (!existsSync(skillPath) || !lstatSync(skillPath).isFile()) {
      structureErrors.push(`${entry.name}/SKILL.md is missing or not a regular file`);
      continue;
    }
    let skillName = null;
    try {
      const source = decodeUtf8(skillPath).replaceAll("\r\n", "\n");
      const { fields, body } = parseSkillMarkdown(source);
      const normalizedName = typeof fields.name === "string" ? normalizedPrompt(fields.name) : "";
      const normalizedDescription =
        typeof fields.description === "string" ? fields.description.normalize("NFC").trim() : "";
      const nameValid = supportedText(normalizedName, { singleLine: true });
      const descriptionValid = supportedText(normalizedDescription, {
        maximum: rules.skillPayload.descriptionMaxLength,
        singleLine: true,
      });
      if (!nameValid) identityErrors.push(`${entry.name} has an invalid or missing frontmatter name`);
      if (!descriptionValid) identityErrors.push(`${entry.name} has an invalid or missing frontmatter description`);
      if (!body.trim()) identityErrors.push(`${entry.name} has an empty skill body`);
      if (nameValid && `${manifestName}:${normalizedName}`.length > rules.skillPayload.combinedIdentityMaxLength) {
        identityErrors.push(`${manifestName}:${normalizedName} exceeds the combined identity limit`);
      }
      if (nameValid) {
        skillName = normalizedName;
        skillNames.push(normalizedName);
      }
    } catch (error) {
      identityErrors.push(`${entry.name}/SKILL.md is not valid UTF-8 frontmatter content: ${error.message}`);
    }

    const metadataPath = assertNoSymlinkPath(directory, "agents/openai.yaml");
    if (existsSync(metadataPath)) {
      if (!lstatSync(metadataPath).isFile()) {
        metadataErrors.push(`${entry.name}/agents/openai.yaml is not a regular file`);
      } else {
        try {
          const metadata = parseYaml(decodeUtf8(metadataPath), { uniqueKeys: true });
          const interfaceMetadata = metadata?.interface;
          let valid =
            metadata &&
            typeof metadata === "object" &&
            !Array.isArray(metadata) &&
            interfaceMetadata &&
            typeof interfaceMetadata === "object" &&
            !Array.isArray(interfaceMetadata) &&
            supportedText(interfaceMetadata?.display_name, { singleLine: true }) &&
            supportedText(interfaceMetadata?.short_description, {
              maximum: rules.skillPayload.openaiShortDescriptionMaxLength,
              singleLine: true,
            }) &&
            interfaceMetadata.short_description.length >=
              rules.skillPayload.openaiShortDescriptionMinLength;
          for (const iconKey of ["icon_small", "icon_large"]) {
            if (interfaceMetadata?.[iconKey] !== undefined) {
              const icon = interfaceMetadata[iconKey];
              try {
                const iconPath = assertNoSymlinkPath(directory, icon);
                valid =
                  valid &&
                  supportedText(icon, { singleLine: true }) &&
                  !isAbsolute(icon) &&
                  !icon.split(/[\\/]/u).includes("..") &&
                  existsSync(iconPath) &&
                  lstatSync(iconPath).isFile();
              } catch {
                valid = false;
              }
            }
          }
          if (interfaceMetadata?.brand_color !== undefined) {
            valid = valid && /^#[A-Fa-f0-9]{6}$/u.test(interfaceMetadata.brand_color);
          }
          if (interfaceMetadata?.default_prompt !== undefined) {
            valid =
              valid &&
              supportedText(interfaceMetadata.default_prompt, { singleLine: true }) &&
              Boolean(skillName) &&
              interfaceMetadata.default_prompt.includes(`$${skillName}`);
          }
          if (metadata.policy !== undefined) {
            const allowedPolicyKeys = new Set(["products", "allow_implicit_invocation"]);
            valid =
              valid &&
              metadata.policy &&
              typeof metadata.policy === "object" &&
              !Array.isArray(metadata.policy) &&
              Object.keys(metadata.policy).every((key) => allowedPolicyKeys.has(key));
            if (metadata.policy?.products !== undefined) {
              const products = metadata.policy.products;
              valid =
                valid &&
                Array.isArray(products) &&
                products.length > 0 &&
                new Set(products).size === products.length &&
                products.every((product) => ["CHAT", "CODEX"].includes(product));
            }
            if (metadata.policy?.allow_implicit_invocation !== undefined) {
              valid = valid && typeof metadata.policy.allow_implicit_invocation === "boolean";
            }
          }
          if (metadata.dependencies !== undefined) {
            valid =
              valid &&
              metadata.dependencies &&
              typeof metadata.dependencies === "object" &&
              !Array.isArray(metadata.dependencies) &&
              Object.keys(metadata.dependencies).length === 1 &&
              Object.hasOwn(metadata.dependencies, "tools") &&
              Array.isArray(metadata.dependencies.tools) &&
              metadata.dependencies.tools.length > 0 &&
              metadata.dependencies.tools.every((tool) =>
                validOpenAIToolDependency(tool, rules),
              );
          }
          if (!valid) metadataErrors.push(`${entry.name}/agents/openai.yaml has invalid required metadata`);
        } catch (error) {
          metadataErrors.push(`${entry.name}/agents/openai.yaml is invalid YAML or UTF-8: ${error.message}`);
        }
      }
    }
  }
  if (new Set(skillNames).size !== skillNames.length) identityErrors.push("skill names must be unique");

  addCheck(
    checks,
    "skills-structure",
    structureErrors.length === 0,
    structureErrors.length === 0
      ? `Found ${skillDirectories.length} immediate skill packages with regular SKILL.md files`
      : "The skills root contains an invalid package shape",
    { errors: structureErrors },
  );
  addCheck(
    checks,
    "skill-identities",
    identityErrors.length === 0,
    identityErrors.length === 0
      ? "Skill frontmatter, bodies, and combined identities are valid"
      : "One or more skill identities or bodies are invalid",
    { errors: identityErrors },
  );
  addCheck(
    checks,
    "skill-openai-metadata",
    metadataErrors.length === 0,
    metadataErrors.length === 0
      ? "Present agents/openai.yaml files contain the required typed metadata"
      : "One or more agents/openai.yaml files are invalid",
    { errors: metadataErrors },
  );
}

export function validateOpenAIPluginPackage(
  packageDirectory,
  {
    rulesPath = DEFAULT_RULES,
    toolchainLockPath = DEFAULT_TOOLCHAIN_LOCK,
    evaluationDate = new Date().toISOString().slice(0, 10),
  } = {},
) {
  const directory = resolve(packageDirectory);
  if (!existsSync(directory) || !lstatSync(directory).isDirectory()) {
    throw new Error(`OpenAI plugin package directory does not exist: ${directory}`);
  }
  if (lstatSync(directory).isSymbolicLink()) {
    throw new Error(`Refusing symbolic link as OpenAI plugin package root: ${directory}`);
  }

  const rules = readJson(resolve(rulesPath));
  const toolchain = readJson(resolve(toolchainLockPath));
  const npmLock = readJson(DEFAULT_NPM_LOCK);
  const rulesDigest = hashFile(resolve(rulesPath)).sha256;
  const checks = [];
  const implementation = toolchain.openai?.rules?.implementation ?? {};
  const validatorImplementationSha256 = hashFile(IMPLEMENTATION_PATH).sha256;
  let sourceClosure = [];
  let sourceClosureError = null;
  try {
    sourceClosure = verifyFileDigestClosure(
      ROOT,
      toolchain.openai?.rules?.validator?.sourceClosure,
      SOURCE_CLOSURE_PATHS,
      "OpenAI preflight validator",
    );
  } catch (error) {
    sourceClosureError = error.message;
  }
  const implementationLocked =
    Object.keys(implementation).sort().join("|") === IMPLEMENTATION_PACKAGES.join("|") &&
    IMPLEMENTATION_PACKAGES.every((name) => {
      const expected = implementation[name];
      const locked = npmLock.packages?.[`node_modules/${name}`];
      try {
        const installed = readJson(
          join(dirname(DEFAULT_NPM_LOCK), "node_modules", name, "package.json"),
        );
        return (
          locked?.version === expected.version &&
          locked?.integrity === expected.integrity &&
          installed.version === expected.version
        );
      } catch {
        return false;
      }
    });
  addCheck(
    checks,
    "rules-lock",
    toolchain.openai?.rules?.id === rules.id &&
      toolchain.openai?.rules?.sha256 === rulesDigest &&
      toolchain.openai?.rules?.reviewBy === rules.reviewBy &&
      toolchain.openai?.rules?.authority === rules.authority &&
      toolchain.openai?.rules?.validator?.implementationPath ===
        "tools/foundry/lib/openai-preflight.mjs" &&
      toolchain.openai?.rules?.validator?.implementationSha256 ===
        validatorImplementationSha256 &&
      sourceClosureError === null &&
      implementationLocked,
    "The docs-derived OpenAI rules must match the independently reviewed toolchain lock",
    {
      toolchainLockSha256: hashFile(resolve(toolchainLockPath)).sha256,
      packageLockSha256: hashFile(DEFAULT_NPM_LOCK).sha256,
      sourceClosure,
      sourceClosureError,
    },
  );
  addCheck(
    checks,
    "rules-freshness",
    evaluationDate <= rules.reviewBy,
    evaluationDate <= rules.reviewBy
      ? `Docs-derived rules are reviewed through ${rules.reviewBy}`
      : `Docs-derived rules expired on ${rules.reviewBy}; review current official OpenAI documentation`,
    { evaluationDate, reviewBy: rules.reviewBy },
  );

  const manifestPath = assertNoSymlinkPath(directory, ".codex-plugin/plugin.json");
  if (!existsSync(manifestPath) || !lstatSync(manifestPath).isFile()) {
    throw new Error(`OpenAI plugin manifest is missing: ${manifestPath}`);
  }
  const manifest = readJson(manifestPath);
  const portablePath = assertNoSymlinkPath(directory, "plugin.json");
  const portable = existsSync(portablePath) ? readJson(portablePath) : null;
  addCheck(
    checks,
    "manifest-name-parity",
    typeof manifest.name === "string" && manifest.name === portable?.name,
    "OpenAI and portable manifests must use the same package name",
  );
  addCheck(
    checks,
    "manifest-version-parity",
    typeof manifest.version === "string" && manifest.version === portable?.version,
    "OpenAI and portable manifests must use the same package version",
  );
  addCheck(
    checks,
    "package-name",
    supportedText(manifest.name, {
      maximum: rules.listing.packageNameMaxLength,
      singleLine: true,
    }) && /^[A-Za-z0-9][A-Za-z0-9_-]*$/u.test(manifest.name),
    "Package name must use the documented ASCII identifier shape and length",
  );
  addCheck(
    checks,
    "package-version",
    supportedText(manifest.version, {
      maximum: rules.listing.packageVersionMaxLength,
      singleLine: true,
    }) && Boolean(semver.valid(manifest.version)),
    "Package version must be a documented-length semantic version",
  );
  addCheck(
    checks,
    "package-description",
    supportedText(manifest.description, { maximum: 1024, allowLineBreaks: true }),
    "Package description is required, supported text, and at most 1024 characters",
  );
  addCheck(
    checks,
    "author-name",
    supportedText(manifest.author?.name, { maximum: 120, singleLine: true }),
    "Author name is required, single-line supported text, and at most 120 characters",
  );
  for (const [id, value] of [
    ["author-url", manifest.author?.url],
    ["homepage", manifest.homepage],
  ]) {
    addCheck(
      checks,
      id,
      value === undefined || validHttpsUrl(value, rules.listing.packageUrlMaxLength),
      value === undefined ? `${id} is optional and is not declared` : `${id} must be a credential-free HTTPS URL`,
    );
  }
  const authorEmailValid =
    manifest.author?.email === undefined ||
    supportedText(manifest.author.email, { maximum: 320, singleLine: true });
  addCheck(
    checks,
    "author-email",
    authorEmailValid,
    "Optional author email must be a supported single-line email address",
  );

  const ui = manifest.interface ?? {};
  const stringLimitChecks = [
    ["display-name", ui.displayName, rules.listing.displayNameMaxLength],
    ["short-description", ui.shortDescription, rules.listing.shortDescriptionMaxLength],
    ["long-description", ui.longDescription, rules.listing.longDescriptionMaxLength],
  ];
  for (const [id, value, maximum] of stringLimitChecks) {
    const passed = supportedText(value, {
      maximum,
      allowLineBreaks: id === "long-description",
      singleLine: id !== "long-description",
    });
    addCheck(
      checks,
      id,
      passed,
      passed ? `${id} is within the documented limit` : `${id} must contain 1-${maximum} characters`,
      { length: typeof value === "string" ? value.length : null, maximum },
    );
  }
  addCheck(
    checks,
    "developer-name",
    supportedText(ui.developerName, {
      maximum: rules.listing.developerNameMaxLength,
      singleLine: true,
    }),
    "Developer name must be a supported single-line value within the documented limit",
  );
  addCheck(
    checks,
    "category",
    rules.listing.categories.includes(ui.category),
    "Category must be one of the documented directory categories",
  );
  const capabilitiesValid =
    ui.capabilities === undefined ||
    (Array.isArray(ui.capabilities) &&
      ui.capabilities.length <= rules.listing.capabilitiesMaxItems &&
      ui.capabilities.every((capability) =>
        supportedText(capability, {
          maximum: rules.listing.capabilityMaxLength,
          singleLine: true,
        }),
      ));
  addCheck(
    checks,
    "capabilities",
    capabilitiesValid,
    "Capabilities are optional and, when present, must stay within documented item and text limits",
  );

  const prompts = ui.defaultPrompt === undefined
    ? []
    : Array.isArray(ui.defaultPrompt)
      ? ui.defaultPrompt
      : [ui.defaultPrompt];
  const normalizedPrompts = Array.isArray(prompts)
    ? prompts.filter((prompt) => typeof prompt === "string").map(normalizedPrompt)
    : [];
  const promptListValid =
    Array.isArray(prompts) &&
    prompts.length <= rules.listing.defaultPromptMaxItems &&
    new Set(normalizedPrompts).size === prompts.length &&
    prompts.every(
      (prompt) =>
        supportedText(prompt, {
          maximum: rules.listing.defaultPromptMaxLength,
          singleLine: true,
        }) &&
        !prompt.includes("@"),
    );
  addCheck(
      checks,
      "starter-prompts",
      promptListValid,
      promptListValid
      ? "Optional starter prompts are natural, normalized-unique, and within documented limits"
      : "Starter prompts must be up to 3 normalized-unique natural prompts, no @mentions, each at most 128 characters",
  );

  for (const key of ["websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"]) {
    const value = ui[key];
    addCheck(
      checks,
      `url-${key}`,
      value === undefined || validHttpsUrl(value, rules.listing.urlMaxLength),
      value === undefined
        ? `${key} is optional for a skills-only package and is not declared`
        : `${key} must be a credential-free HTTPS URL with a host`,
    );
  }
  const brandColorValid = /^#[A-Fa-f0-9]{6}$/u.test(ui.brandColor ?? "");
  const brandColorDarkValid = /^#[A-Fa-f0-9]{6}$/u.test(ui.brandColorDark ?? "");
  const brandContrast = {
    light: brandColorValid ? contrastRatio(relativeLuminance(ui.brandColor), 1) : null,
    dark: brandColorDarkValid
      ? contrastRatio(relativeLuminance(ui.brandColorDark), relativeLuminance("#212121"))
      : null,
  };
  addCheck(
    checks,
    "brand-color",
    ui.brandColor === undefined ||
      (brandColorValid &&
        brandContrast.light >= rules.listing.brandColorMinimumContrast),
    ui.brandColor === undefined
      ? "Brand color is optional and is not declared"
      : "Brand color must be six-digit hex with documented light and dark contrast",
    { contrast: brandContrast },
  );
  addCheck(
    checks,
    "brand-color-dark",
    ui.brandColorDark === undefined ||
      (brandColorDarkValid && brandContrast.dark >= rules.listing.brandColorMinimumContrast),
    ui.brandColorDark === undefined
      ? "Dark brand color is optional and is not declared"
      : "Dark brand color must be six-digit hex with documented dark-surface contrast",
    { contrast: brandContrast.dark },
  );

  for (const key of rules.skillsOnly.forbiddenManifestKeys) {
    addCheck(
      checks,
      `skills-only-manifest-forbids-${key}`,
      !Object.hasOwn(manifest, key),
      `Skills-only manifest must not declare ${key}`,
    );
  }
  for (const key of rules.skillsOnly.forbiddenInterfaceKeys) {
    addCheck(
      checks,
      `skills-only-interface-forbids-${key}`,
      !Object.hasOwn(ui, key),
      `Skills-only interface must not declare ${key}`,
    );
  }

  validateAsset({ packageDirectory: directory, path: ui.logo, rules, id: "logo", checks });
  validateAsset({
    packageDirectory: directory,
    path: ui.composerIcon,
    rules,
    id: "composer-icon",
    checks,
  });

  const skillsDeclarationValid = ["skills", "skills/", "./skills", "./skills/"].includes(manifest.skills);
  addCheck(
    checks,
    "skills-declaration",
    skillsDeclarationValid,
    "Skills-only directory candidates must resolve the declared skills path to the root skills directory",
  );
  const skillsPath = skillsDeclarationValid ? assertNoSymlinkPath(directory, manifest.skills) : null;
  const skillsPresent = Boolean(skillsPath && existsSync(skillsPath) && lstatSync(skillsPath).isDirectory());
  addCheck(checks, "skills-path", skillsPresent, "The declared skills directory must exist inside the package");
  if (skillsPresent) {
    validateSkillPayload({ manifestName: manifest.name, skillsPath, rules, checks });
    const commandReferences = markdownFiles(skillsPath).filter((path) =>
      readFileSync(path, "utf8").includes("tools/foundry/cli.mjs"),
    );
    const guarded = commandReferences.every((path) => {
      const content = readFileSync(path, "utf8");
      return content.includes("Foundry runtime available") && content.includes("pending-runtime");
    });
    addCheck(
      checks,
      "runtime-handoff-boundary",
      guarded,
      guarded
        ? "Repository-local CLI commands are explicitly optional runtime handoffs"
        : "Repository-local CLI commands must be guarded and report pending-runtime when unavailable",
      { referencedSkillFiles: commandReferences.length },
    );
  }

  for (const forbidden of rules.skillsOnly.forbiddenPackagePaths) {
    const path = assertNoSymlinkPath(directory, forbidden);
    addCheck(
      checks,
      `skills-only-forbids-${forbidden}`,
      !existsSync(path),
      `Skills-only package must not contain ${forbidden}`,
    );
  }

  const payload = openAIPluginPayload(directory);
  const profilePath = assertNoSymlinkPath(directory, "submission/openai/profile.json");
  if (existsSync(profilePath) && lstatSync(profilePath).isFile()) {
    const profile = readJson(profilePath);
    const registry = loadContractRegistry(DEFAULT_CONTRACTS);
    const profileValidation = validateValue(
      profile,
      getContract(registry, "openai-submission-profile"),
      registry,
    );
    addCheck(
      checks,
      "submission-profile-contract",
      profileValidation.valid,
      "A present source-preflight profile must pass its structural and semantic claim gates",
      { errors: profileValidation.errors },
    );
    const profileBindings = {
      portableManifest: profile.package?.portableManifest === "plugin.json",
      openaiManifest: profile.package?.openaiManifest === ".codex-plugin/plugin.json",
      displayName: profile.listing?.displayName === ui.displayName,
      category: profile.listing?.category === ui.category,
      logo: profile.listing?.logo === String(ui.logo ?? "").replace(/^\.\//u, ""),
      composerIcon:
        profile.listing?.composerIcon === String(ui.composerIcon ?? "").replace(/^\.\//u, ""),
      privacyUrl: (profile.policy?.privacyUrl ?? null) === (ui.privacyPolicyURL ?? null),
      termsUrl: (profile.policy?.termsUrl ?? null) === (ui.termsOfServiceURL ?? null),
      supportUrl: (profile.policy?.supportUrl ?? null) === (ui.supportURL ?? null),
    };
    addCheck(
      checks,
      "submission-payload-binding",
      profile.package?.payloadSha256 === payload.sha256 &&
        profile.package?.name === manifest.name &&
        profile.package?.version === manifest.version &&
        Object.values(profileBindings).every(Boolean),
      "The source-controlled preflight profile must bind the exact payload, manifests, listing, policy URLs, name, and version",
      { payloadSha256: payload.sha256, bindings: profileBindings },
    );
  }

  const errors = checks
    .filter((check) => check.status === "fail")
    .map((check) => ({ code: check.id.toUpperCase().replaceAll(/[^A-Z0-9]+/g, "_"), message: check.message }));
  return {
    schemaVersion: "1.0.0",
    subject: {
      type: "openai-plugin-package",
      name: manifest.name,
      version: manifest.version,
      manifestSha256: hashFile(manifestPath).sha256,
      packagePayloadSha256: payload.sha256,
    },
    rules: {
      id: rules.id,
      authority: rules.authority,
      reviewedAt: rules.reviewedAt,
      reviewBy: rules.reviewBy,
      sha256: rulesDigest,
      sources: rules.sources,
    },
    validator: {
      name: "starlight-openai-docs-derived-preflight",
      authority: rules.authority,
      implementationSha256: validatorImplementationSha256,
      sourceClosure,
      packageLockSha256: hashFile(DEFAULT_NPM_LOCK).sha256,
      toolchainLockSha256: hashFile(resolve(toolchainLockPath)).sha256,
      packages: IMPLEMENTATION_PACKAGES.map((name) => ({ name, ...implementation[name] })),
    },
    invocation: {
      argv: [
        "node",
        "tools/foundry/cli.mjs",
        "preflight-openai",
        "<plugin-dir>",
        "--out",
        "<report.json>",
      ],
      output: {
        mediaType: "application/json",
        channels: ["stdout", "--out file"],
        content: "this report",
      },
    },
    evaluationDate,
    status: errors.length === 0 ? "pass" : "fail",
    checks,
    errors,
    externalGates: [
      "OpenAI Platform upload",
      "current OpenAI skill safety/security scan result",
      "developer-mode ChatGPT runtime",
      "Codex runtime",
      "directory review and publication",
    ],
    claimBoundary: rules.claimBoundary,
  };
}
