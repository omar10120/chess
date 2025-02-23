
"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChessBoard } from './ChessBoard';
import { GameOverDialog } from './GameOverDialog';
import { gameSounds } from '../types/sounds';
import { websocketService } from '../utils/websocketService';
import { aiService } from '../utils/aiService';
import { v4 as uuidv4 } from 'uuid';

type Player = 'white' | 'black';
type GameMode = 'ai' | 'multiplayer';

interface GameStateProps {
  onGameEnd?: (winner: Player) => void;
}

export const GameState: React.FC<GameStateProps> = ({ onGameEnd }) => {
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [playerColor, setPlayerColor] = useState<Player>('white');
  const [gameId] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedGameId = localStorage.getItem('chess_gameId');
      return savedGameId || uuidv4();
    }
    return uuidv4();
  });
  const [currentPlayer, setCurrentPlayer] = useState<Player>('white');
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'check' | 'checkmate'>('playing');
  const [showGameOver, setShowGameOver] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chess_currentPlayer');
      const savedStatus = localStorage.getItem('chess_gameStatus') as 'playing' | 'check' | 'checkmate';
      const savedShowGameOver = localStorage.getItem('chess_showGameOver');

      if (saved) setCurrentPlayer(saved === 'white' ? 'black' : 'white');
      if (savedStatus) setGameStatus(savedStatus);
      if (savedShowGameOver) setShowGameOver(savedShowGameOver === 'true');
    }
  }, []);
  const boardRef = useRef<any>(null);
  const [validMoves, setValidMoves] = useState<{ [key: string]: boolean }>({});
  useEffect(() => {
    if (boardRef.current) {
      const isCurrentPlayerWhite = currentPlayer === 'white';
      if (boardRef.current.isCheckmate(isCurrentPlayerWhite)) {
        setGameStatus('checkmate');
        if (gameSounds.checkmate) {
          gameSounds.checkmate.currentTime = 0;
          gameSounds.checkmate.play()
            .catch(error => console.warn('Error playing checkmate sound:', error));
        }
        setShowGameOver(true);
        onGameEnd?.(currentPlayer === 'white' ? 'black' : 'white');
      } else if (boardRef.current.isKingInCheck(isCurrentPlayerWhite)) {
        setGameStatus('check');
        if (gameSounds.check) {
          gameSounds.check.currentTime = 0;
          gameSounds.check.play()
            .catch(error => console.warn('Error playing check sound:', error));
        }
      } else if (boardRef.current.isStalemate(isCurrentPlayerWhite) || 
                boardRef.current.hasInsufficientMaterial()) {
        setGameStatus('playing');
        setShowGameOver(true);
        onGameEnd?.(currentPlayer === 'white' ? 'black' : 'white');
      } else {
        setGameStatus('playing');
      }
    }
  }, [currentPlayer, onGameEnd]);
  useEffect(() => {
    const connectToGame = async () => {
      try {
        await websocketService.connect(gameId);
        localStorage.setItem('chess_gameId', gameId);

        websocketService.on('gameStart', (data) => {
          console.log('Game started:', data);
          // Set player color based on server assignment
          const assignedColor = data.color;
          setPlayerColor(assignedColor);
        });

        websocketService.on('move', (data) => {
          if (boardRef.current) {
            boardRef.current.movePiece(data.from, data.to);
            setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
            if (gameSounds.move) {
              gameSounds.move.currentTime = 0;
              gameSounds.move.play()
                .catch(error => console.warn('Error playing move sound:', error));
            }
          }
        });

        websocketService.on('gameEnd', (data) => {
          console.log('Game ended:', data);
          setShowGameOver(true);
        });
      } catch (error) {
        console.error('Failed to connect to game server:', error);
      }
    };

    connectToGame();

    return () => {
      websocketService.disconnect();
    };
  }, [gameId]);

  const handleAIMove = async () => {
  if (gameMode === 'ai' && currentPlayer !== playerColor && boardRef.current && !showGameOver) {
    try {
      const boardState = boardRef.current.getBoardState();
      const aiMove = await aiService.getNextMove(boardState, 'black');
      
      if (boardRef.current.movePiece(aiMove.from, aiMove.to)) {
        if (gameSounds.movepiece) {
          gameSounds.movepiece.currentTime = 0;
          gameSounds.movepiece.play()
            .catch(error => console.warn('Error playing move piece sound:', error));
        }
        const isWhiteInCheck = boardRef.current.isKingInCheck(true);
        const isWhiteCheckmated = boardRef.current.isCheckmate(true);
        const isStalemate = boardRef.current.isStalemate(true);
        const hasInsufficientMaterial = boardRef.current.hasInsufficientMaterial();

        if (isWhiteCheckmated) {
          setGameStatus('checkmate');
          if (gameSounds.checkmate) {
            gameSounds.checkmate.currentTime = 0;
            gameSounds.checkmate.play()
              .catch(error => console.warn('Error playing checkmate sound:', error));
          }
          setShowGameOver(true);
          onGameEnd?.('black');
        } else if (isStalemate || hasInsufficientMaterial) {
          setGameStatus('playing');
          setShowGameOver(true);
          onGameEnd?.('black');
        } else if (isWhiteInCheck) {
          setGameStatus('check');
          if (gameSounds.check) {
            gameSounds.check.currentTime = 0;
            gameSounds.check.play()
              .catch(error => console.warn('Error playing check sound:', error));
          }
        } else {
          setGameStatus('playing');
        }
        
        setCurrentPlayer('white');
        // Save game state
        localStorage.setItem('chess_currentPlayer', 'white');
        localStorage.setItem('chess_gameStatus', gameStatus);
        localStorage.setItem('chess_showGameOver', String(showGameOver));
        localStorage.setItem('chess_boardState', JSON.stringify(boardRef.current.getBoardState()));
      }
    } catch (error) {
      console.error('Error getting AI move:', error);
    }
  }
};

useEffect(() => {
  if (gameMode === 'ai' && currentPlayer === 'black' && !showGameOver) {
    handleAIMove();
  }
}, [currentPlayer, gameMode, showGameOver]);
  const handleSquareClick = useCallback((position: string) => {
    if (!selectedSquare) {
      const piece = boardRef.current?.getPieceAt(position);
      const isPieceCurrentPlayer = 
        currentPlayer === 'white' ? piece === piece?.toUpperCase() : piece === piece?.toLowerCase();
      
      if (piece && isPieceCurrentPlayer) {
        setSelectedSquare(position);
        setValidMoves(boardRef.current?.getValidMoves(position) || {});
      }
      return;
    }

    const targetPiece = boardRef.current?.getPieceAt(position);
    const isCapture = targetPiece !== '';

    if (boardRef.current?.movePiece(selectedSquare, position)) {
      if (isCapture && gameSounds.capture) {
        gameSounds.capture.currentTime = 0;
        gameSounds.capture.play()
          .catch(error => console.warn('Error playing capture sound:', error));
      } else if (gameSounds.movepiece) {
        gameSounds.movepiece.currentTime = 0;
        gameSounds.movepiece.play()
          .catch(error => console.warn('Error playing move piece sound:', error));
      }
      const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
      const isNextPlayerWhite = nextPlayer === 'white';
      
      if (boardRef.current?.isCheckmate(isNextPlayerWhite)) {
        setGameStatus('checkmate');
        if (gameSounds.checkmate) {
          gameSounds.checkmate.currentTime = 0;
          gameSounds.checkmate.play()
            .catch(error => console.warn('Error playing checkmate sound:', error));
        }
        setShowGameOver(true);
        onGameEnd?.(currentPlayer);
      } else if (boardRef.current?.isStalemate(isNextPlayerWhite) || 
                boardRef.current?.hasInsufficientMaterial()) {
        setGameStatus('playing');
        setShowGameOver(true);
        onGameEnd?.(currentPlayer);
      } else if (boardRef.current?.isKingInCheck(isNextPlayerWhite)) {
        setGameStatus('check');
        if (gameSounds.check) {
          gameSounds.check.currentTime = 0;
          gameSounds.check.play()
            .catch(error => console.warn('Error playing check sound:', error));
        }
      } else {
        setGameStatus('playing');
      }
      
      setCurrentPlayer(nextPlayer);
      // Save game state
      localStorage.setItem('chess_currentPlayer', nextPlayer);
      localStorage.setItem('chess_gameStatus', gameStatus);
      localStorage.setItem('chess_showGameOver', String(showGameOver));
      localStorage.setItem('chess_boardState', JSON.stringify(boardRef.current?.getBoardState()));
    }
    setSelectedSquare(null);
    setValidMoves({});

    const isCurrentPlayerWhite = currentPlayer === 'white';
    if (boardRef.current?.isCheckmate(isCurrentPlayerWhite) ||
        boardRef.current?.isStalemate(isCurrentPlayerWhite) ||
        boardRef.current?.hasInsufficientMaterial()) {
      setGameStatus(boardRef.current?.isCheckmate(isCurrentPlayerWhite) ? 'checkmate' : 'playing');
      if (gameSounds.checkmate) {
        gameSounds.checkmate.currentTime = 0;
        gameSounds.checkmate.play()
          .catch(error => console.warn('Error playing checkmate sound:', error));
      }
      setShowGameOver(true);
      onGameEnd?.(currentPlayer === 'white' ? 'black' : 'white');
    }
  }, [selectedSquare, currentPlayer, onGameEnd]);
  const toggleGameMode = () => {
    const newMode = gameMode === 'ai' ? 'multiplayer' : 'ai';
    setGameMode(newMode);
    if (newMode === 'ai') {
      const randomColor = Math.random() < 0.5 ? 'white' : 'black';
      setPlayerColor(randomColor);
      if (randomColor === 'black') {
        handleAIMove();
      }
    }
    handleRestart();
  };

  const handleRestart = () => {
    setShowGameOver(false);
    setGameStatus('playing');
    setCurrentPlayer('white');
    boardRef.current?.resetBoard();
    // Clear saved game state
    localStorage.removeItem('chess_currentPlayer');
    localStorage.removeItem('chess_gameStatus');
    localStorage.removeItem('chess_showGameOver');
    localStorage.removeItem('chess_boardState');
  };
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4 mb-4">
        <button
          onClick={toggleGameMode}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          {gameMode === 'ai' ? 'Switch to Multiplayer' : 'Switch to AI Mode'}
        </button>
      </div>
      <div className="text-xl font-semibold mb-4 text-white">
        {gameStatus === 'check' && (
          <div className="text-red-600 animate-pulse">
            {currentPlayer === 'white' ? 'White' : 'Black'}'s King is in Check!
          </div>
        )}
        {gameStatus === 'checkmate' && (
          <div className="text-red-600">
            Checkmate! {currentPlayer === 'black' ? 'White' : 'Black'} wins!
          </div>
        )}
        {gameStatus === 'playing' && (
          <span>{currentPlayer === 'white' ? 'White' : 'Black'}'s turn</span>
        )}
      </div>
      <button
        onClick={handleRestart}
        className="mb-4 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg"
      >
        Restart Game
      </button>
      <ChessBoard 
        onSquareClick={handleSquareClick}
        ref={boardRef}
        selectedSquare={selectedSquare}
        validMoves={validMoves}
      />
      <GameOverDialog
        isOpen={showGameOver}
        winner={currentPlayer === 'white' ? 'Black' : 'White'}
        onRestart={() => {
          setShowGameOver(false);
          setGameStatus('playing');
          setCurrentPlayer('white');
          boardRef.current?.resetBoard();
        }}
      />
    </div>
  );
};