// A deliberately small JSON Schema 2020-12 checker. Zero dependencies.
//
// It exists for one job: prove in `node --test` that the published schema loads
// strictly and that every fixture validates against it, on a machine with
// nothing installed. It supports exactly the keywords the SIP graph schema uses
// and REFUSES anything else — which is the point. A non-keyword smuggled into
// the schema (v0.1.0 shipped `endpointMatrix` inside `$defs/edge`) fails here the
// same way it fails in ajv's strict mode.
//
// If ajv is present in the tree, prefer it; see the test's validator loader.

const KNOWN_KEYWORDS = new Set([
  "$schema",
  "$id",
  "$defs",
  "$ref",
  "$comment",
  "title",
  "description",
  "default",
  "examples",
  "type",
  "enum",
  "const",
  "properties",
  "required",
  "additionalProperties",
  "items",
  "pattern",
  "format",
  "minItems",
  "uniqueItems",
  "allOf",
  "anyOf",
  "oneOf",
]);

// Keywords whose value is a map of name -> schema.
const SCHEMA_MAPS = new Set(["properties", "$defs"]);
// Keywords whose value is a single schema.
const SCHEMA_VALUES = new Set(["items", "additionalProperties"]);
// Keywords whose value is a list of schemas.
const SCHEMA_LISTS = new Set(["allOf", "anyOf", "oneOf"]);

const DATE_TIME =
  /^\d{4}-\d{2}-\d{2}[Tt]\d{2}:\d{2}:\d{2}(\.\d+)?([Zz]|[+-]\d{2}:\d{2})$/;

function isPlainObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Throw if the schema uses a keyword this checker (and a strict ajv) does not
 * know. Walks every subschema.
 * @param {object} schema
 * @param {string} [path]
 */
export function assertStrict(schema, path = "#") {
  if (!isPlainObject(schema)) return;
  for (const [key, value] of Object.entries(schema)) {
    if (!KNOWN_KEYWORDS.has(key)) {
      throw new Error(`strict schema: unknown keyword "${key}" at ${path}`);
    }
    if (SCHEMA_MAPS.has(key) && isPlainObject(value)) {
      for (const [name, sub] of Object.entries(value)) {
        assertStrict(sub, `${path}/${key}/${name}`);
      }
    } else if (SCHEMA_LISTS.has(key) && Array.isArray(value)) {
      value.forEach((sub, i) => assertStrict(sub, `${path}/${key}/${i}`));
    } else if (SCHEMA_VALUES.has(key) && isPlainObject(value)) {
      assertStrict(value, `${path}/${key}`);
    }
  }
}

function resolveRef(root, ref) {
  if (!ref.startsWith("#/")) throw new Error(`only local $ref is supported: ${ref}`);
  let cur = root;
  for (const rawSeg of ref.slice(2).split("/")) {
    const seg = rawSeg.replace(/~1/g, "/").replace(/~0/g, "~");
    cur = cur?.[seg];
    if (cur === undefined) throw new Error(`unresolvable $ref: ${ref}`);
  }
  return cur;
}

function typeOk(type, data) {
  switch (type) {
    case "object":
      return isPlainObject(data);
    case "array":
      return Array.isArray(data);
    case "string":
      return typeof data === "string";
    case "number":
      return typeof data === "number";
    case "integer":
      return Number.isInteger(data);
    case "boolean":
      return typeof data === "boolean";
    case "null":
      return data === null;
    default:
      throw new Error(`unsupported type "${type}"`);
  }
}

/**
 * Validate `data` against `schema`. Returns a list of human-readable errors;
 * empty means valid.
 * @param {object|boolean} schema
 * @param {unknown} data
 * @param {{root?: object, path?: string}} [opts]
 * @returns {string[]}
 */
export function validate(schema, data, opts = {}) {
  const root = opts.root ?? schema;
  const path = opts.path ?? "$";
  const errors = [];

  if (schema === true || schema === undefined) return errors;
  if (schema === false) return [`${path}: schema forbids any value`];

  if (schema.$ref) {
    errors.push(...validate(resolveRef(root, schema.$ref), data, { root, path }));
  }

  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((t) => typeOk(t, data))) {
      errors.push(`${path}: expected ${types.join(" or ")}`);
      return errors; // further keywords would only echo the same mistake
    }
  }

  if (schema.enum !== undefined && !schema.enum.some((v) => deepEqual(v, data))) {
    errors.push(`${path}: ${JSON.stringify(data)} is not one of ${JSON.stringify(schema.enum)}`);
  }
  if (schema.const !== undefined && !deepEqual(schema.const, data)) {
    errors.push(`${path}: expected const ${JSON.stringify(schema.const)}`);
  }

  if (typeof data === "string") {
    if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
      errors.push(`${path}: "${data}" does not match /${schema.pattern}/`);
    }
    if (schema.format === "date-time" && !DATE_TIME.test(data)) {
      errors.push(`${path}: "${data}" is not an RFC3339 date-time`);
    }
  }

  if (isPlainObject(data)) {
    for (const key of schema.required ?? []) {
      if (data[key] === undefined) errors.push(`${path}: missing required "${key}"`);
    }
    const props = schema.properties ?? {};
    for (const [key, sub] of Object.entries(props)) {
      if (data[key] !== undefined) {
        errors.push(...validate(sub, data[key], { root, path: `${path}.${key}` }));
      }
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(data)) {
        if (!(key in props)) errors.push(`${path}: additional property "${key}" is not allowed`);
      }
    } else if (isPlainObject(schema.additionalProperties)) {
      for (const [key, value] of Object.entries(data)) {
        if (key in props) continue;
        errors.push(
          ...validate(schema.additionalProperties, value, { root, path: `${path}.${key}` })
        );
      }
    }
  }

  if (Array.isArray(data)) {
    if (schema.items !== undefined) {
      data.forEach((item, i) => {
        errors.push(...validate(schema.items, item, { root, path: `${path}[${i}]` }));
      });
    }
    if (typeof schema.minItems === "number" && data.length < schema.minItems) {
      errors.push(`${path}: needs at least ${schema.minItems} items`);
    }
    if (schema.uniqueItems === true) {
      const seen = new Set(data.map((d) => JSON.stringify(d)));
      if (seen.size !== data.length) errors.push(`${path}: items are not unique`);
    }
  }

  for (const sub of schema.allOf ?? []) {
    errors.push(...validate(sub, data, { root, path }));
  }
  if (Array.isArray(schema.anyOf)) {
    const branches = schema.anyOf.map((sub) => validate(sub, data, { root, path }));
    if (!branches.some((b) => b.length === 0)) {
      errors.push(`${path}: matches no anyOf branch (${branches.flat().slice(0, 3).join("; ")})`);
    }
  }
  if (Array.isArray(schema.oneOf)) {
    const passing = schema.oneOf.filter((sub) => validate(sub, data, { root, path }).length === 0);
    if (passing.length !== 1) {
      errors.push(`${path}: matches ${passing.length} oneOf branches, expected exactly 1`);
    }
  }

  return errors;
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
