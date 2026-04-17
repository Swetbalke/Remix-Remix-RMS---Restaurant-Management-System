import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io();
    this.socket.on("connect", () => {
      console.log("Connected to Real-time Server");
    });
  }

  joinRoom(room: string) {
    this.socket?.emit("join-room", room);
  }

  onNewOrder(callback: (order: any) => void) {
    this.socket?.on("new-order", callback);
  }

  onOrderUpdated(callback: (order: any) => void) {
    this.socket?.on("order-updated", callback);
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export const socketService = new SocketService();
