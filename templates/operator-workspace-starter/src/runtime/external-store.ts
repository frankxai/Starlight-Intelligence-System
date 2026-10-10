/**
 * Starlight ExternalStoreRuntime adapter for assistant-ui.
 * Preserves Starlight as the single authority of conversation and execution state.
 */

export interface OperatorMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  approvalRequired?: boolean;
  permissionId?: string;
  toolCalls?: Array<{
    name: string;
    args: Record<string, unknown>;
    result?: unknown;
  }>;
}

export interface OperatorStoreState {
  isRunning: boolean;
  messages: OperatorMessage[];
  pendingApprovals: string[];
}

export class StarlightExternalStore {
  private state: OperatorStoreState = {
    isRunning: false,
    messages: [],
    pendingApprovals: [],
  };

  private listeners: Set<() => void> = new Set();

  public getState(): OperatorStoreState {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public appendMessage(msg: OperatorMessage): void {
    this.state = {
      ...this.state,
      messages: [...this.state.messages, msg],
    };
    if (msg.approvalRequired && msg.permissionId) {
      this.state.pendingApprovals = [...this.state.pendingApprovals, msg.permissionId];
    }
    this.notify();
  }

  public setRunning(running: boolean): void {
    this.state = { ...this.state, isRunning: running };
    this.notify();
  }

  public resolveApproval(permissionId: string): void {
    this.state = {
      ...this.state,
      pendingApprovals: this.state.pendingApprovals.filter(id => id !== permissionId),
    };
    this.notify();
  }
}
