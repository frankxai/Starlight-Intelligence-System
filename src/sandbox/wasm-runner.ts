import * as vm from 'node:vm';

export interface SandboxResult {
  success: boolean;
  result?: any;
  error?: string;
  durationMs: number;
}

/**
 * Safely executes LLM-generated Javascript code using Node's vm module.
 * Provides strict isolation without access to host objects, preventing prompt injection RCEs.
 * Note: While Node's `vm` is not a perfect security sandbox, this setup creates a new V8 context
 * without injecting host objects, making standard prototype-chain escapes significantly harder.
 */
export function runUntrustedCode(codeString: string): SandboxResult {
  const start = Date.now();
  try {
    // We create a strictly empty sandbox with no prototype and no host objects.
    const sandbox = Object.create(null);
    
    const context = vm.createContext(sandbox, {
      codeGeneration: {
        strings: false, // Prevent eval() or new Function() inside the sandbox
        wasm: false,    // Prevent WASM execution inside the sandbox
      }
    });

    const script = new vm.Script(codeString);
    
    // Execute with resource constraints
    const result = script.runInContext(context, {
      timeout: 1000, // 1 second timeout to prevent infinite loops
      displayErrors: true,
    });

    return {
      success: true,
      result,
      durationMs: Date.now() - start
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || String(err),
      durationMs: Date.now() - start
    };
  }
}
