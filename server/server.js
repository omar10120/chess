const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocket.Server({ port: 3001 });

const games = new Map();
const clients = new Map();

class Game {
  constructor(id) {
    this.id = id;
    this.players = [];
    this.currentTurn = 'white';
    this.board = null;
  }

  addPlayer(ws) {
    if (this.players.length >= 2) return false;
    const color = this.players.length === 0 ? 'white' : 'black';
    this.players.push({ ws, color });
    return true;
  }

  removePlayer(ws) {
    this.players = this.players.filter(player => player.ws !== ws);
  }

  broadcast(message) {
    this.players.forEach(player => {
      if (player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(JSON.stringify(message));
      }
    });
  }

  getOpponent(ws) {
    return this.players.find(player => player.ws !== ws);
  }
}

wss.on('connection', (ws, req) => {
  const gameId = new URL(req.url, 'ws://localhost').searchParams.get('gameId');
  
  if (!gameId) {
    ws.close();
    return;
  }

  let game = games.get(gameId);
  if (!game) {
    game = new Game(gameId);
    games.set(gameId, game);
  }

  if (!game.addPlayer(ws)) {
    ws.close();
    return;
  }

  clients.set(ws, gameId);

  if (game.players.length === 2) {
    game.broadcast({
      type: 'gameStart',
      data: { message: 'Game started!' }
    });
  }

  ws.on('message', (message) => {
    const gameId = clients.get(ws);
    const game = games.get(gameId);
    if (!game) return;

    try {
      const event = JSON.parse(message);
      switch (event.type) {
        case 'move':
          const opponent = game.getOpponent(ws);
          if (opponent) {
            opponent.ws.send(JSON.stringify({
              type: 'move',
              data: event.data
            }));
          }
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    const gameId = clients.get(ws);
    const game = games.get(gameId);
    
    if (game) {
      game.removePlayer(ws);
      game.broadcast({
        type: 'gameEnd',
        data: { message: 'Opponent disconnected' }
      });
      
      if (game.players.length === 0) {
        games.delete(gameId);
      }
    }
    
    clients.delete(ws);
  });
}));

console.log('WebSocket server is running on port 3001');