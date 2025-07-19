import { wait } from "../utils/wait";

export type WebSocketSettings<SocketMessageData> = {
  host: string;
  autoReconnect?: boolean;
  reconnectIntervalMs?: number;
  handleMessage: (data: SocketMessageData) => void;
  onConnect?: () => void;
  pingIntervalMs?: number;
  onError?: (err: unknown) => void;
};

export class WebSocketHandler<SocketMessageData> {
  settings: WebSocketSettings<SocketMessageData>;
  socket: WebSocket | undefined;

  constructor(settings: WebSocketSettings<SocketMessageData>) {
    this.settings = settings;
  }

  get host() {
    return this.settings.host;
  }

  get autoReconnect() {
    return this.settings.autoReconnect ?? true;
  }

  get reconnectInterval() {
    return this.settings.reconnectIntervalMs || 1000;
  }

  get pingInterval() {
    return this.settings.pingIntervalMs || 60000;
  }

  sendMessage(message: object) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }
    this.socket.send(JSON.stringify(message));
    return true;
  }

  connect() {
    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
      return;
    }
    console.log("trying connecting web socket on ", this.host);
    const socket = new WebSocket(this.host);
    socket.onopen = () => {
      this.socket = socket;
      console.log("Websocket connection opened");
      const pingIntervalTimeout = setInterval(() => {
        this.sendMessage({ type: "ping" });
      }, this.pingInterval);

      this.settings.onConnect?.();

      socket.onclose = async () => {
        clearInterval(pingIntervalTimeout);
        console.log("Websocket connection closed");
        if (!this.autoReconnect) return;
        while (this.socket?.readyState === WebSocket.CLOSED) {
          await wait(1000);
          this.connect();
        }
      };
      socket.onmessage = ({ data }) => {
        try {
          const jsonData = JSON.parse(data);
          this.settings.handleMessage(jsonData);
        } catch (err) {
          console.error("Failed to parse message data", err);
        }
      };
      socket.onerror = (error) => {
        console.error("Websocket error:", error);
        this.settings.onError?.(error);
      };
    };
  }
}
