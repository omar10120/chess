export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k' | 'P' | 'R' | 'N' | 'B' | 'Q' | 'K' | '';

interface Position {
  file: number;
  rank: number;
}

export const isKingInCheck = (board: PieceType[][], isWhiteKing: boolean): boolean => {
  // Find the king's position
  const kingPiece = isWhiteKing ? 'K' : 'k';
  let kingPos: Position | null = null;

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      if (board[rank][file] === kingPiece) {
        kingPos = { rank, file };
        break;
      }
    }
    if (kingPos) break;
  }

  if (!kingPos) return false;

  // Check if any opponent's piece can capture the king
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece && (isWhiteKing ? piece === piece.toLowerCase() : piece === piece.toUpperCase())) {
        const from = String.fromCharCode(97 + file) + (8 - rank);
        const to = String.fromCharCode(97 + kingPos.file) + (8 - kingPos.rank);
        if (isValidMove(piece, from, to, board)) {
          return true;
        }
      }
    }
  }
  return false;
};

export const hasLegalMoves = (board: PieceType[][], isWhiteKing: boolean): boolean => {
  // Try all possible moves for all pieces of the current player
  for (let fromRank = 0; fromRank < 8; fromRank++) {
    for (let fromFile = 0; fromFile < 8; fromFile++) {
      const piece = board[fromRank][fromFile];
      // Skip empty squares and opponent's pieces
      if (!piece || (isWhiteKing ? piece !== piece.toUpperCase() : piece !== piece.toLowerCase())) continue;

      for (let toRank = 0; toRank < 8; toRank++) {
        for (let toFile = 0; toFile < 8; toFile++) {
          const from = String.fromCharCode(97 + fromFile) + (8 - fromRank);
          const to = String.fromCharCode(97 + toFile) + (8 - toRank);

          // Check if the move is valid according to piece movement rules
          if (isValidMove(piece, from, to, board)) {
            // Create a copy of the board to test the move
            const newBoard = board.map(row => [...row]);
            newBoard[toRank][toFile] = piece;
            newBoard[fromRank][fromFile] = '';

            // If this move doesn't leave/put our king in check, it's a legal move
            if (!isKingInCheck(newBoard, isWhiteKing)) {
              return true;
            }
          }
        }
      }
    }
  }
  return false;
};

export const isStalemate = (board: PieceType[][], isWhiteKing: boolean): boolean => {
  // If the king is in check, it's not a stalemate
  if (isKingInCheck(board, isWhiteKing)) return false;
  
  // If there are no legal moves and the king is not in check, it's a stalemate
  return !hasLegalMoves(board, isWhiteKing);
};

export const isCheckmate = (board: PieceType[][], isWhiteKing: boolean): boolean => {
  // First check if the king is in check
  if (!isKingInCheck(board, isWhiteKing)) return false;

  // Try all possible moves for all pieces of the current player
  for (let fromRank = 0; fromRank < 8; fromRank++) {
    for (let fromFile = 0; fromFile < 8; fromFile++) {
      const piece = board[fromRank][fromFile];
      // Skip empty squares and opponent's pieces
      if (!piece || (isWhiteKing ? piece !== piece.toUpperCase() : piece !== piece.toLowerCase())) continue;

      for (let toRank = 0; toRank < 8; toRank++) {
        for (let toFile = 0; toFile < 8; toFile++) {
          const from = String.fromCharCode(97 + fromFile) + (8 - fromRank);
          const to = String.fromCharCode(97 + toFile) + (8 - toRank);

          // Check if the move is valid according to piece movement rules
          if (isValidMove(piece, from, to, board)) {
            // Create a copy of the board to test the move
            const newBoard = board.map(row => [...row]);
            newBoard[toRank][toFile] = piece;
            newBoard[fromRank][fromFile] = '';

            // If this move gets us out of check, it's not checkmate
            if (!isKingInCheck(newBoard, isWhiteKing)) {
              return false;
            }
          }
        }
      }
    }
  }

  // If no legal moves were found to escape check, it's checkmate
  return true;
}

export const isValidMove = (piece: PieceType, from: string, to: string, board: PieceType[][]): boolean => {
  const fromPos = parsePosition(from);
  const toPos = parsePosition(to);
  
  if (!isValidPosition(fromPos) || !isValidPosition(toPos)) return false;
  
  // Check if target square has a piece of the same color
  const targetPiece = board[toPos.rank][toPos.file];
  if (targetPiece !== '') {
    const isSourceWhite = piece === piece.toUpperCase();
    const isTargetWhite = targetPiece === targetPiece.toUpperCase();
    if (isSourceWhite === isTargetWhite) return false;
  }

  // Create a copy of the board to test the move
  const testBoard = board.map(row => [...row]);
  testBoard[toPos.rank][toPos.file] = piece;
  testBoard[fromPos.rank][fromPos.file] = '';
  
  // Check if the move would put/leave own king in check
  const isWhite = piece === piece.toUpperCase();
  if (isKingInCheck(testBoard, isWhite)) return false;
  
  const pieceType = piece.toLowerCase();

  
  switch (pieceType) {
    case 'p':
      return isValidPawnMove(fromPos, toPos, isWhite, board);
    case 'r':
      return isValidRookMove(fromPos, toPos, board);
    case 'n':
      return isValidKnightMove(fromPos, toPos);
    case 'b':
      return isValidBishopMove(fromPos, toPos, board);
    case 'q':
      return isValidQueenMove(fromPos, toPos, board);
    case 'k':
      return isValidKingMove(fromPos, toPos);
    default:
      return false;
  }
};

const parsePosition = (pos: string): Position => ({
  file: pos.charCodeAt(0) - 97,
  rank: 8 - parseInt(pos[1])
});

const isValidPosition = (pos: Position): boolean => {
  return pos.file >= 0 && pos.file < 8 && pos.rank >= 0 && pos.rank < 8;
};

const isValidPawnMove = (from: Position, to: Position, isWhite: boolean, board: PieceType[][]): boolean => {
  const direction = isWhite ? -1 : 1;
  const startRank = isWhite ? 6 : 1;
  
  // Basic one square forward move
  if (from.file === to.file && to.rank === from.rank + direction && !board[to.rank][to.file]) {
    return true;
  }
  
  // Initial two square move
  if (from.file === to.file && from.rank === startRank && 
      to.rank === from.rank + 2 * direction && 
      !board[to.rank][to.file] && 
      !board[from.rank + direction][from.file]) {
    return true;
  }
  
  // Capture moves
  if (Math.abs(to.file - from.file) === 1 && to.rank === from.rank + direction) {
    const targetPiece = board[to.rank][to.file];
    return targetPiece !== '' && isWhite !== (targetPiece === targetPiece.toUpperCase());
  }
  
  return false;
};

const isValidRookMove = (from: Position, to: Position, board: PieceType[][]): boolean => {
  if (from.file !== to.file && from.rank !== to.rank) return false;
  
  const rankDiff = to.rank - from.rank;
  const fileDiff = to.file - from.file;
  
  // Check path is clear
  if (rankDiff !== 0) {
    const step = rankDiff > 0 ? 1 : -1;
    for (let r = from.rank + step; r !== to.rank; r += step) {
      if (board[r][from.file] !== '') return false;
    }
  } else {
    const step = fileDiff > 0 ? 1 : -1;
    for (let f = from.file + step; f !== to.file; f += step) {
      if (board[from.rank][f] !== '') return false;
    }
  }
  
  return true;
};

const isValidKnightMove = (from: Position, to: Position): boolean => {
  const rankDiff = Math.abs(to.rank - from.rank);
  const fileDiff = Math.abs(to.file - from.file);
  return (rankDiff === 2 && fileDiff === 1) || (rankDiff === 1 && fileDiff === 2);
};

const isValidBishopMove = (from: Position, to: Position, board: PieceType[][]): boolean => {
  const rankDiff = Math.abs(to.rank - from.rank);
  const fileDiff = Math.abs(to.file - from.file);
  
  if (rankDiff !== fileDiff) return false;
  
  const rankStep = to.rank > from.rank ? 1 : -1;
  const fileStep = to.file > from.file ? 1 : -1;
  
  for (let i = 1; i < rankDiff; i++) {
    if (board[from.rank + i * rankStep][from.file + i * fileStep] !== '') {
      return false;
    }
  }
  
  return true;
};

const isValidQueenMove = (from: Position, to: Position, board: PieceType[][]): boolean => {
  return isValidRookMove(from, to, board) || isValidBishopMove(from, to, board);
};

const isValidKingMove = (from: Position, to: Position): boolean => {
  const rankDiff = Math.abs(to.rank - from.rank);
  const fileDiff = Math.abs(to.file - from.file);
  return rankDiff <= 1 && fileDiff <= 1;
};

export const hasInsufficientMaterial = (board: PieceType[][]): boolean => {
  let whitePieces: PieceType[] = [];
  let blackPieces: PieceType[] = [];

  // Collect all remaining pieces
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece) {
        if (piece === piece.toUpperCase()) {
          whitePieces.push(piece);
        } else {
          blackPieces.push(piece);
        }
      }
    }
  }

  // King vs King
  if (whitePieces.length === 1 && blackPieces.length === 1) {
    return true;
  }

  // King and Bishop vs King or King and Knight vs King
  if ((whitePieces.length === 2 && blackPieces.length === 1) ||
      (whitePieces.length === 1 && blackPieces.length === 2)) {
    const morePieces = whitePieces.length > blackPieces.length ? whitePieces : blackPieces;
    return morePieces.some(piece => piece.toLowerCase() === 'b' || piece.toLowerCase() === 'n');
  }

  // King and Bishop vs King and Bishop (same colored squares)
  if (whitePieces.length === 2 && blackPieces.length === 2) {
    const whiteBishop = whitePieces.find(piece => piece === 'B');
    const blackBishop = blackPieces.find(piece => piece === 'b');
    if (whiteBishop && blackBishop) {
      // If both sides have bishops, it's insufficient material
      return true;
    }
  }

  return false;
};