import React from 'react';

interface SquareProps {
  color: string;
  piece: string;
  position: string;
  onClick?: () => void;
  isValidMove?: boolean;
  hasCapturablePiece?: boolean;
  isSelected?: boolean;
}

export const Square: React.FC<SquareProps> = ({ color, piece, position, onClick, isValidMove, hasCapturablePiece, isSelected }) => {
  const getPieceImage = (piece: string): string => {
    if (!piece) return '';
    const pieceColor = piece === piece.toUpperCase() ? 'w' : 'b';
    const pieceName = piece.toLowerCase();
    // Use custom PNG images for pawns, SVG for other pieces
    if (pieceName === 'p') {
      return `/${pieceColor}p.png`;
    }
    return `/pieces/${pieceColor}${pieceName}.svg`;
  };

  const baseColor = color === 'bg-amber-100' ? 'from-amber-50 to-amber-200' : 'from-amber-700 to-amber-900';

  return (
    <div
      className={`w-16 h-16 flex items-center justify-center cursor-pointer relative bg-gradient-to-br ${baseColor} 
        ${isSelected ? 'ring-4 ring-blue-500/80 ring-inset shadow-lg shadow-blue-500/50' : ''} 
        transition-all duration-200 hover:shadow-inner`}
      onClick={onClick}
      data-position={position}
    >
      {isValidMove && (
        <div 
          className={`absolute ${hasCapturablePiece 
            ? 'w-14 h-14 border-4 border-green-500/60 rounded-full' 
            : 'w-6 h-6 bg-green-500/40 rounded-full hover:bg-green-500/60'} 
            transition-all duration-200`} 
        />
      )}
      {piece && (
        <img
          src={getPieceImage(piece)}
          alt={`${piece} piece`}
          className={`w-12 h-12 object-contain transition-transform hover:scale-110 relative z-10 
            ${isSelected ? 'scale-105' : ''}`}
          draggable={false}
        />
      )}
    </div>
  );
};