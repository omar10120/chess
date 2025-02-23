
"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChessBoard } from './ChessBoard';
import { GameOverDialog } from './GameOverDialog';
import { gameSounds } from '../types/sounds';

type Player = 'white' | 'black';

interface GameStateProps {
  onGameEnd?: (winner: Player) => void;
}

export const GameState: React.FC<GameStateProps> = ({ onGameEnd }) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chess_currentPlayer');
      // Reverse the turn on reload
      return saved ? (saved === 'white' ? 'black' : 'white') : 'white';
    }
    return 'white';
  });
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'check' | 'checkmate'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chess_gameStatus');
      return saved ? saved as 'playing' | 'check' | 'checkmate' : 'playing';
    }
    return 'playing';
  });
  const [showGameOver, setShowGameOver] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chess_showGameOver') === 'true';
    }
    return false;
  });
  const boardRef = useRef<any>(null);

  const [validMoves, setValidMoves] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // Restore board state from localStorage when component mounts
    if (boardRef.current && typeof window !== 'undefined') {
      const savedBoardState = localStorage.getItem('chess_boardState');
      if (savedBoardState) {
        boardRef.current.setBoardState(JSON.parse(savedBoardState));
      }
    }
  }, []);

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