import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { WorkspaceAdapter } from "./store.js";
import type { WorkspaceState } from "./types.js";

export class JsonFileWorkspaceAdapter implements WorkspaceAdapter {
  private readonly dataFile: string;
  private initialized = false;

  constructor(
    private readonly options: {
      dataDir: string;
      seedFile: string;
    },
  ) {
    this.dataFile = join(options.dataDir, "workspace.json");
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    await mkdir(dirname(this.dataFile), { recursive: true });
    try {
      await readFile(this.dataFile, "utf8");
    } catch (error) {
      const maybe = error as NodeJS.ErrnoException;
      if (maybe.code !== "ENOENT") throw error;
      await this.atomicWrite(await readFile(this.options.seedFile, "utf8"));
    }
    this.initialized = true;
  }

  private async atomicWrite(contents: string): Promise<void> {
    const temporary = `${this.dataFile}.${process.pid}.${randomUUID()}.tmp`;
    await writeFile(temporary, contents, { encoding: "utf8", mode: 0o600 });
    await rename(temporary, this.dataFile);
  }

  async read(): Promise<WorkspaceState> {
    await this.ensureInitialized();
    return JSON.parse(await readFile(this.dataFile, "utf8")) as WorkspaceState;
  }

  async write(expectedRevision: number, state: WorkspaceState): Promise<boolean> {
    const current = await this.read();
    if (current.revision !== expectedRevision) return false;
    await this.atomicWrite(`${JSON.stringify(state, null, 2)}\n`);
    return true;
  }
}
