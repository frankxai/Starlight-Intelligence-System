/**
 * Starlight Cloudflare Edge Sandbox — Zero-Egress Container Execution
 * Implements @cloudflare/sandbox@next (Sandbox SDK 1.0) architecture.
 *
 * Built on SIP v1.1.1
 */

export interface SandboxExecutionRequest {
  command: string[]
  cwd?: string
  env?: Record<string, string>
  timeoutMs?: number
}

export interface SandboxExecutionResponse {
  exitCode: number
  stdout: string
  stderr: string
  durationMs: number
  zeroEgress: boolean
  containerImage: string
}

export class StarlightEdgeSandbox {
  private static readonly CONTAINER_IMAGE = 'cloudflare/sandbox:next'

  /**
   * Executes a command inside an isolated Cloudflare edge container
   * using the Sandbox SDK 1.0 handle pattern (argv, wait, output).
   */
  public static async execute(
    request: SandboxExecutionRequest,
    sandboxBinding?: unknown
  ): Promise<SandboxExecutionResponse> {
    const startTime = Date.now()
    const { command, cwd = '/workspace', env = {}, timeoutMs = 30000 } = request

    // If native sandbox binding or instance is available at runtime
    if (sandboxBinding) {
      const bindingAny = sandboxBinding as Record<string, unknown>
      try {
        let handle: {
          output: (opts?: { encoding?: string }) => Promise<{
            stdout: string
            stderr?: string
            exitCode: number
          }>
        } | null = null

        if (typeof bindingAny.get === 'function') {
          const binding = sandboxBinding as {
            get: (id: string) => {
              exec: (cmd: string[], opts?: unknown) => Promise<{
                output: (opts?: { encoding?: string }) => Promise<{
                  stdout: string
                  stderr?: string
                  exitCode: number
                }>
              }>
            }
          }
          const sandboxInstance = binding.get('starlight-default-sandbox')
          handle = await sandboxInstance.exec(command, {
            cwd,
            env: {
              ...env,
              STARLIGHT_SUBSTRATE: 'sip-1.1.1',
              ZERO_EGRESS_ENFORCED: 'true',
            },
            timeout: timeoutMs,
          })
        } else if (typeof bindingAny.exec === 'function') {
          const instance = sandboxBinding as {
            exec: (cmd: string[], opts?: unknown) => Promise<{
              output: (opts?: { encoding?: string }) => Promise<{
                stdout: string
                stderr?: string
                exitCode: number
              }>
            }>
          }
          handle = await instance.exec(command, {
            cwd,
            env: {
              ...env,
              STARLIGHT_SUBSTRATE: 'sip-1.1.1',
              ZERO_EGRESS_ENFORCED: 'true',
            },
            timeout: timeoutMs,
          })
        }

        if (handle) {
          const result = await handle.output({ encoding: 'utf8' })
          return {
            exitCode: result.exitCode ?? 0,
            stdout: result.stdout ?? '',
            stderr: result.stderr ?? '',
            durationMs: Date.now() - startTime,
            zeroEgress: true,
            containerImage: this.CONTAINER_IMAGE,
          }
        }
      } catch (err) {
        return {
          exitCode: 1,
          stdout: '',
          stderr: `Cloudflare container execution error: ${(err as Error).message}`,
          durationMs: Date.now() - startTime,
          zeroEgress: false,
          containerImage: this.CONTAINER_IMAGE,
        }
      }
    }

    // In environments without container binding, fail closed truthfully
    return {
      exitCode: 1,
      stdout: '',
      stderr: 'SANDBOX binding unavailable: execution requires an active @cloudflare/sandbox container runtime.',
      durationMs: Date.now() - startTime,
      zeroEgress: false,
      containerImage: this.CONTAINER_IMAGE,
    }
  }
}
