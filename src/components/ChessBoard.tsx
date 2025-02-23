"use client";

import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Square } from './Square';
import { isValidMove, PieceType, isCheckmate, isKingInCheck, isStalemate } from '../utils/chessEngine';

interface ChessBoardProps {
  onSquareClick?: (position: string) => void;
  selectedSquare?: string | null;
  validMoves?: { [key: string]: boolean };
}

const initialBoard = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  Array(8).fill(''),
  Array(8).fill(''),
  Array(8).fill(''),
  Array(8).fill(''),
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

interface ChessBoardRef {
  getPieceAt: (position: string) => string | null;
  movePiece: (from: string, to: string) => boolean;
  getValidMoves: (position: string) => { [key: string]: boolean };
  isCheckmate: (isWhiteKing: boolean) => boolean;
  isKingInCheck: (isWhiteKing: boolean) => boolean;
  isStalemate: (isWhiteKing: boolean) => boolean;
  getBoardState: () => string[][];
  resetBoard: () => void;
  hasInsufficientMaterial: () => boolean;
}

export const ChessBoard = forwardRef<ChessBoardRef, ChessBoardProps>(({ onSquareClick, selectedSquare, validMoves }, ref) => {
  const [board, setBoard] = useState(initialBoard);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBoard = localStorage.getItem('chess_boardState');
      if (savedBoard) {
        setBoard(JSON.parse(savedBoard));
      }
    }
  }, []);

  const [promotionDialog, setPromotionDialog] = useState<{
    visible: boolean;
    position: string;
    isWhite: boolean;
  }>({ visible: false, position: '', isWhite: false });
  const getSquareColor = (row: number, col: number): string => {
    return (row + col) % 2 === 0 ? 'bg-amber-100' : 'bg-amber-800';
  };
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
  const getPieceAt = (position: string) => {
    const file = files.indexOf(position[0]);
    const rank = ranks.indexOf(position[1]);
    if (file === -1 || rank === -1) return null;
    return board[rank][file];
  };
  const movePiece = (from: string, to: string) => {
    const fromFile = files.indexOf(from[0]);
    const fromRank = ranks.indexOf(from[1]);
    const toFile = files.indexOf(to[0]);
    const toRank = ranks.indexOf(to[1]);
    if (fromFile === -1 || fromRank === -1 || toFile === -1 || toRank === -1) return false;
    const piece = board[fromRank][fromFile];
    if (!piece) return false;
    if (!isValidMove(piece, from, to, board)) return false;
    const newBoard = board.map(row => [...row]);
    newBoard[toRank][toFile] = piece;
    newBoard[fromRank][fromFile] = '';

    // Check for pawn promotion
    if ((piece === 'P' && toRank === 0) || (piece === 'p' && toRank === 7)) {
      setPromotionDialog({
        visible: true,
        position: to,
        isWhite: piece === 'P'
      });
    }

    setBoard(newBoard);
    localStorage.setItem('chess_boardState', JSON.stringify(newBoard));
    return true;
  };
  const getValidMoves = (position: string): { [key: string]: boolean } => {
    const file = files.indexOf(position[0]);
    const rank = ranks.indexOf(position[1]);
    if (file === -1 || rank === -1) return {};
  const piece = board[rank][file];
    if (!piece) return {};
  const validMoves: { [key: string]: boolean } = {};
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const targetPos = `${files[f]}${ranks[r]}`;
        if (isValidMove(piece, position, targetPos, board)) {
          const targetPiece = board[r][f];
          validMoves[targetPos] = targetPiece !== '';
        }
      }
    }
  return validMoves;
  };
  useImperativeHandle(ref, () => ({
    getPieceAt,
    movePiece,
    getValidMoves,
    isCheckmate: (isWhiteKing: boolean) => isCheckmate(board, isWhiteKing),
    isKingInCheck: (isWhiteKing: boolean) => isKingInCheck(board, isWhiteKing),
    isStalemate: (isWhiteKing: boolean) => isStalemate(board, isWhiteKing),
    getBoardState: () => board,
    setBoardState: (newState: string[][]) => {
      setBoard(newState);
      localStorage.setItem('chess_boardState', JSON.stringify(newState));
    },
    resetBoard: () => {
      setBoard(initialBoard);
      localStorage.setItem('chess_boardState', JSON.stringify(initialBoard));
    },
    hasInsufficientMaterial: () => {
      const pieces = board.flat().filter((piece: string) => piece !== '');
      if (pieces.length === 2) return true; // Only kings left
      
      if (pieces.length === 3) {
        // King and bishop vs king or king and knight vs king
        const nonKings = pieces.filter((p: string) => p.toLowerCase() !== 'k');
        if (nonKings.length === 1) {
          const piece = nonKings[0].toLowerCase();
          return piece === 'b' || piece === 'n';
        }
      }
      
      if (pieces.length === 4) {
        // Two kings and two bishops of the same color squares
        const bishops = pieces.filter((p: string) => p.toLowerCase() === 'b');
        if (bishops.length === 2) {
          // Check if bishops are on the same colored squares
          let bishopSquareColor = -1;
          board.forEach((row: string[], rowIndex: number) => {
            row.forEach((piece: string, colIndex: number) => {
              if (piece.toLowerCase() === 'b') {
                const squareColor = (rowIndex + colIndex) % 2;
                if (bishopSquareColor === -1) {
                  bishopSquareColor = squareColor;
                } else if (bishopSquareColor !== squareColor) {
                  return false;
                }
              }
            });
          });
          return true;
        }
      }
      
      return false;
    }
  }));
  const handlePromotion = (promotedPiece: string) => {
    if (!promotionDialog.visible) return;
  const toFile = files.indexOf(promotionDialog.position[0]);
    const toRank = ranks.indexOf(promotionDialog.position[1]);
    const newBoard = board.map((row: string[]) => [...row]);
    newBoard[toRank][toFile] = promotionDialog.isWhite ? promotedPiece.toUpperCase() : promotedPiece.toLowerCase();
    setBoard(newBoard);
    localStorage.setItem('chess_boardState', JSON.stringify(newBoard));
    setPromotionDialog({ visible: false, position: '', isWhite: false });
  };
  return (
    <div className="relative inline-block border-4 border-amber-900 rounded-lg shadow-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-900 transform transition-all duration-300 hover:scale-[1.02]">
      {promotionDialog.visible && (
        <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-2xl border-2 border-amber-500 transform transition-all duration-300">
            <h3 className="text-2xl font-bold mb-8 text-amber-900 dark:text-amber-100 text-center">Choose promotion piece</h3>
            <div className="flex gap-8 justify-center">
              {['q', 'r', 'b', 'n'].map((piece) => (
                <button
                  key={piece}
                  onClick={() => handlePromotion(piece)}
                  className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-200 border-2 border-amber-400 dark:border-amber-600"
                >
                  <img
                    src={`/pieces/${promotionDialog.isWhite ? 'w'+piece : 'b'+piece}.svg`}
                    alt={`${promotionDialog.isWhite ? 'White' : 'Black'} ${piece.toUpperCase()}`}
                    className="w-14 h-14 transform transition-transform duration-200"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="flex">
        <div className="w-8"></div>
        <div className="flex-1">
          <div className="grid grid-cols-8 h-8">
            {files.map((file) => (
              <div key={file} className="flex items-center justify-center text-sm font-semibold">
                {file.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
        <div className="w-8"></div>
      </div>
      <div className="flex">
        <div className="w-8 flex flex-col justify-around">
          {ranks.map((rank) => (
            <div key={rank} className="h-[50px] flex items-center justify-center text-sm font-semibold">
              {rank}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-8 gap-0">
          {board.map((row: string[], rowIndex: number) => (
            row.map((piece: string, colIndex: number) => {
              const position = `${files[colIndex]}${ranks[rowIndex]}`;
              return (
                <Square
                  key={position}
                  position={position}
                  piece={piece}
                  color={getSquareColor(rowIndex, colIndex)}
                  onClick={() => onSquareClick?.(position)}
                  isSelected={position === selectedSquare}
                  isValidMove={validMoves?.[position]}
                />
              );
            })
          ))}
        </div>
        <div className="w-8 flex flex-col justify-around">
          {ranks.map((rank) => (
            <div key={rank} className="h-[50px] flex items-center justify-center text-sm font-semibold">
              {rank}
            </div>
          ))}
        </div>
      </div>
      <div className="flex">
        <div className="w-8"></div>
        <div className="flex-1">
          <div className="grid grid-cols-8 h-8">
            {files.map((file: string) => (
              <div key={file} className="flex items-center justify-center text-sm font-semibold">
                {file.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
        <div className="w-8"></div>
      </div>
    </div>
  );
});

ChessBoard.displayName = 'ChessBoard';