import { createHash } from "node:crypto";
import { hashTree } from "./io.mjs";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function openAIPluginPayload(directory) {
  const files = hashTree(directory).filter((entry) => !entry.path.startsWith("submission/"));
  return { files, sha256: sha256(JSON.stringify(files)) };
}
