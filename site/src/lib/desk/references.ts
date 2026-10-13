/**
 * The brief's reference list, in the brief's own numbering.
 *
 * A `[n]` marker in the brief is a claim index: checkClaims numbers verified
 * claims 1, 2, 3 in the order they survive, and two claims can quote the same
 * source. A source's own retrieval index is a different number, so a list
 * labelled by source index can send `[2]` to the wrong page. This list has one
 * entry per claim, labelled with the claim's index, carrying that claim's
 * quote and the title and URL of the source it quotes. Entry n is what `[n]`
 * means.
 *
 * Pure and dependency-free, so the page can use it and a test can prove it.
 *
 * Built on SIP — operational tier.
 */

export interface ReferenceClaim {
  index: number;
  quote: string;
  url: string;
}

export interface ReferenceSource {
  url: string;
  title: string;
}

export interface Reference {
  /** The `[n]` marker this entry resolves. */
  index: number;
  quote: string;
  url: string;
  /** The quoted source's title, or its URL when it has none. */
  title: string;
}

export function referenceList(claims: readonly ReferenceClaim[], sources: readonly ReferenceSource[]): Reference[] {
  const titles = new Map(sources.map((source) => [source.url, source.title.trim()]));
  return [...claims]
    .sort((left, right) => left.index - right.index)
    .map((claim) => ({
      index: claim.index,
      quote: claim.quote,
      url: claim.url,
      title: titles.get(claim.url) || claim.url,
    }));
}
