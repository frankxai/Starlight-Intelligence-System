// SIP graph v0.1.0 — projection masking. Zero dependencies, no I/O.
//
// One definition, two consumers: `protocol/lib/graph.mjs` (the canonical claim
// walk) and the site's /protocol/graph explorer, which imports a byte-identical
// copy written by `site/scripts/sync-protocol-graph.mjs`. A test asserts the two
// files are identical, so the published page can never mask less than the
// protocol does.

/**
 * Mask one element (node or edge) for an audience.
 *
 * A masked element keeps its id and type and loses everything else: the reader
 * sees that a link exists and was withheld, not what it held.
 *
 * @param {{id: string, type: string}} element
 * @param {Set<string>|null|undefined} visible ids this audience may see; a
 *   nullish set means no masking (the owner view).
 * @returns {Record<string, unknown>}
 */
export function maskElement(element, visible) {
  if (visible && !visible.has(element.id)) {
    return { id: element.id, type: element.type, withheld: true };
  }
  return { ...element, withheld: false };
}
