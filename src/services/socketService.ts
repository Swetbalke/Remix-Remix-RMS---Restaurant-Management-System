import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();
  private isIntentionalDisconnect = false;

  connect() {
    if (this.socket?.connected) return;

    this.isIntentionalDisconnect = false;

    try {
      this.socket = io({
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        transports: ['websocket', 'polling']
      });

      this.socket.on("connect", () => {
        console.log("[Socket] Connected to Real-time Server");
        this.reconnectAttempts = 0;
      });

      this.socket.on("disconnect", (reason) => {
        console.log("[Socket] Disconnected:", reason);
        if (!this.isIntentionalDisconnect && reason !== 'io server disconnect') {
          console.log("[Socket] Attempting to reconnect...");
        }
      });

      this.socket.on("connect_error", (error) => {
        this.reconnectAttempts++;
        console.error(`[Socket] Connection error (attempt ${this.reconnectAttempts}):`, error.message);
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error("[Socket] Max reconnection attempts reached. Please refresh the page.");
        }
      });

      this.socket.on("reconnect", (attemptNumber) => {
        console.log(`[Socket] Reconnected after ${attemptNumber} attempts`);
        this.reregisterListeners();
      });

      this.socket.on("reconnect_failed", () => {
        console.error("[Socket] Failed to reconnect after all attempts");
      });

    } catch (error) {
      console.error("[Socket] Connection setup failed:", error);
    }
  }

  private reregisterListeners() {
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, callback);
      });
    });
  }

  joinRoom(room: string) {
    this.socket?.emit("join-room", room);
  }

  leaveRoom(room: string) {
    this.socket?.emit("leave-room", room);
  }

  onNewOrder(callback: (order: any) => void) {
    this.on("new-order", callback);
  }

  onOrderUpdated(callback: (order: any) => void) {
    this.on("order-updated", callback);
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
      this.socket?.off(event, callback);
    } else {
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }

  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("[Socket] Cannot emit - not connected");
    }
  }

  getConnectionState(): 'connected' | 'disconnected' | 'reconnecting' {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    return 'reconnecting';
  }

  disconnect() {
    this.isIntentionalDisconnect = true;
    this.listeners.clear();
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();