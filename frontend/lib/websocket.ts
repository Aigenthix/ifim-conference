type WSMessage = {
  type: string;
  poll_id?: string;
  votes?: Record<string, number>;
  [key: string]: unknown;
};

type WSHandler = (msg: WSMessage) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers = new Map<string, Set<WSHandler>>();
  private reconnectAttempts = 0;
  private maxReconnects = 10;
  private reconnectDelay = 1000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private isManualClose = false;

  constructor(url: string) {
    this.url = url;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    this.isManualClose = false;

    try {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = this.onOpen.bind(this);
      this.ws.onmessage = this.onMessage.bind(this);
      this.ws.onclose = this.onClose.bind(this);
      this.ws.onerror = this.onError.bind(this);
    } catch {
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.isManualClose = true;
    this.clearTimers();
    if (this.ws) {
      this.ws.close(1000, "Manual disconnect");
      this.ws = null;
    }
  }

  on(type: string, handler: WSHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  private onOpen(): void {
    this.reconnectAttempts = 0;
    this.startPing();
  }

  private onMessage(event: MessageEvent): void {
    try {
      const data: WSMessage = JSON.parse(event.data);
      const typeHandlers = this.handlers.get(data.type);
      if (typeHandlers) {
        typeHandlers.forEach((handler) => handler(data));
      }

      const wildcardHandlers = this.handlers.get("*");
      if (wildcardHandlers) {
        wildcardHandlers.forEach((handler) => handler(data));
      }
    } catch {
      // Ignore non-JSON messages (e.g., "pong")
    }
  }

  private onClose(): void {
    this.clearTimers();
    if (!this.isManualClose) {
      this.scheduleReconnect();
    }
  }

  private onError(): void {
    this.ws?.close();
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnects) return;

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000
    );
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startPing(): void {
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send("ping");
      }
    }, 25000);
  }

  private clearTimers(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.pingTimer) clearInterval(this.pingTimer);
  }
}

export function createPollSocket(eventId: string, token: string): WebSocketClient {
  const wsBase = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
  return new WebSocketClient(`${wsBase}/ws/polls/${eventId}?token=${token}`);
}

export { WebSocketClient };
export type { WSMessage, WSHandler };
