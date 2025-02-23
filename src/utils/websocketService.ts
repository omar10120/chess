import { PieceType } from './chessEngine';

type GameEvent = {
  type: 'move' | 'join' | 'leave' | 'gameStart' | 'gameEnd';
  data: any;
};

export class WebSocketService {
  private ws: WebSocket | null = null;
  private gameId: string | null = null;
  private callbacks: { [key: string]: (data: any) => void } = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  constructor(private url: string = 'ws://localhost:3001') {}

  connect(gameId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      if (!gameId) {
        reject(new Error('Game ID is required'));
        return;
      }

      this.isConnecting = true;
      this.gameId = gameId;

      try {
        const wsUrl = new URL(this.url);
        wsUrl.searchParams.set('gameId', gameId);
        this.ws = new WebSocket(wsUrl.toString());
      } catch (error) {
        this.isConnecting = false;
        reject(new Error(`Invalid WebSocket URL: ${error.message}`));
        return;
      }

      this.ws.onopen = () => {
        console.log('Connected to game server');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onerror = (error: Event) => {
        const wsError = error as ErrorEvent;
        const errorDetails = {
          message: wsError.message || 'Unknown WebSocket error',
          type: wsError.type || 'error',
          error: wsError.error?.toString() || null,
          url: this.url,
          gameId: this.gameId,
          connectionState: this.ws?.readyState !== undefined ? 
            ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][this.ws.readyState] : 'UNKNOWN',
          reconnectAttempts: this.reconnectAttempts,
          timestamp: new Date().toISOString()
        };
        console.error('WebSocket error:', errorDetails);
        this.isConnecting = false;
        this.handleConnectionError(reject);
      };

      this.ws.onmessage = (event) => {
        try {
          const gameEvent: GameEvent = JSON.parse(event.data);
          const callback = this.callbacks[gameEvent.type];
          if (callback) {
            callback(gameEvent.data);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log(`Disconnected from game server: ${event.code} - ${event.reason}`);
        this.isConnecting = false;
        if (!event.wasClean) {
          this.handleConnectionError();
        }
      };
    });
  }

  private async handleConnectionError(reject?: (reason?: any) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.gameId) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
      try {
        await this.connect(this.gameId);
      } catch (error) {
        if (reject) {
          reject(error);
        }
      }
    } else if (reject) {
      reject(new Error('Failed to establish WebSocket connection'));
    }
  }

  on(eventType: GameEvent['type'], callback: (data: any) => void): void {
    this.callbacks[eventType] = callback;
  }

  sendMove(from: string, to: string, piece: PieceType): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('Cannot send move: WebSocket is not connected');
      return;
    }

    const moveEvent: GameEvent = {
      type: 'move',
      data: { from, to, piece }
    };

    try {
      this.ws.send(JSON.stringify(moveEvent));
    } catch (error) {
      console.error('Error sending move:', error);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.gameId = null;
      this.reconnectAttempts = 0;
    }
  }
}

export const websocketService = new WebSocketService();