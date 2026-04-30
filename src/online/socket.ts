export class RoomSocket {
  private ws: WebSocket | null = null;
  connect(url: string, onMessage: (event: MessageEvent) => void): void {
    this.dispose();
    this.ws = new WebSocket(url);
    this.ws.onmessage = onMessage;
  }
  send(payload: unknown): void { if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(payload)); }
  dispose(): void { if (this.ws) { this.ws.onmessage = null; this.ws.close(); this.ws = null; } }
}
