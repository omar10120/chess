import { PieceType } from './chessEngine';

type GameEvent = {
  type: 'move' | 'join' | 'leave' | 'gameStart' | 'gameEnd';
  data: any;
};

export class WebSocketService {
  private ws: WebSocket | null = null;
  private gameId: string | null = null;
  private callbacks: { [key: string]: (data: any) => void } = {};

  constructor(private url: string = 'ws://localhost:3001') {}

  connect(gameId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.gameId = gameId;
      this.ws = new WebSocket(`${this.url}?gameId=${gameId}`);

      this.ws.onopen = () => {
        console.log('Connected to game server');
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        const gameEvent: GameEvent = JSON.parse(event.data);
        const callback = this.callbacks[gameEvent.type];
        if (callback) {
          callback(gameEvent.data);
        }
      };

      this.ws.onclose = () => {
        console.log('Disconnected from game server');
      };
    });
  }

  on(eventType: GameEvent['type'], callback: (data: any) => void): void {
    this.callbacks[eventType] = callback;
  }

  sendMove(from: string, to: string, piece: PieceType): void {
    if (!this.ws) return;

    const moveEvent: GameEvent = {
      type: 'move',
      data: { from, to, piece, gameId: this.gameId }
    };

    this.ws.send(JSON.stringify(moveEvent));
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.gameId = null;
      this.callbacks = {};
    }
  }
}

export const websocketService = new WebSocketService();