import manifesto from "../../content/narrative-artifacts/01-intelligence-should-compound.json";
import origin from "../../content/narrative-artifacts/02-why-starlight.json";
import constellation from "../../content/narrative-artifacts/03-the-constellation.json";
import loop from "../../content/narrative-artifacts/04-the-compounding-loop.json";
import product from "../../content/narrative-artifacts/05-what-we-build.json";
import horizons from "../../content/narrative-artifacts/06-three-horizons.json";
import invitation from "../../content/narrative-artifacts/07-build-with-us.json";

export const narrativeArtifacts = [manifesto, origin, constellation, loop, product, horizons, invitation] as const;
export const productPrimitives = product.primitives;

export function artifactExport(slug: string, format: "landscape" | "portrait" | "square") {
  return `/next-era/${slug}-${format}.svg`;
}
