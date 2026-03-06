<template>
  <div class="chess-game">
    <div class="game-header">
      <h2>国际象棋</h2>
      <div class="game-info">
        <div class="current-player">
          当前玩家: <span :class="currentPlayer">{{ currentPlayerText }}</span>
        </div>
        <div class="game-status" v-if="gameStatus">{{ gameStatus }}</div>
        <div class="controls">
          <button @click="undoMove" :disabled="!canUndo" class="control-btn" title="悔棋">
            ↩ 悔棋
          </button>
          <button @click="resetGame" class="control-btn reset-btn">重新开始</button>
        </div>
      </div>
    </div>
    
    <div class="chess-board">
      <div 
        v-for="(row, rowIndex) in board" 
        :key="rowIndex" 
        class="chess-row"
      >
        <div
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          class="chess-cell"
          :class="getCellClasses(rowIndex, colIndex)"
          @click="handleSquareClick(rowIndex, colIndex)"
        >
          <div v-if="cell" class="chess-piece" :class="cell.color">
            {{ getPieceSymbol(cell) }}
          </div>
          <div class="coordinate" v-if="rowIndex === 7">{{ String.fromCharCode(97 + colIndex) }}</div>
          <div class="coordinate row-number" v-if="colIndex === 0">{{ 8 - rowIndex }}</div>
        </div>
      </div>
    </div>

    <div class="captured-pieces">
      <div class="captured-white">
        <h4>白方被吃棋子:</h4>
        <TransitionGroup name="list" tag="div" class="pieces">
          <span v-for="(piece, index) in capturedPieces.white" :key="index" class="captured-piece white">
            {{ getPieceSymbol(piece) }}
          </span>
        </TransitionGroup>
      </div>
      <div class="captured-black">
        <h4>黑方被吃棋子:</h4>
        <TransitionGroup name="list" tag="div" class="pieces">
          <span v-for="(piece, index) in capturedPieces.black" :key="index" class="captured-piece black">
            {{ getPieceSymbol(piece) }}
          </span>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChessGame, type ChessPiece, type PieceType, type Color } from '../composables/useChessGame'

// Use the composable
const {
  board,
  currentPlayer,
  selectedSquare,
  possibleMoves,
  gameStatus,
  capturedPieces,
  currentPlayerText,
  lastMove,
  canUndo,
  undoMove,
  handleSquareClick,
  resetGame,
  isKingInCheck
} = useChessGame()

// --- Constants (View Helper) ---
const PIECE_SYMBOLS: Record<Color, Record<PieceType, string>> = {
  white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
  black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
}

const getPieceSymbol = (piece: ChessPiece): string => PIECE_SYMBOLS[piece.color][piece.type]

const getCellClasses = (row: number, col: number) => {
  const isSelected = selectedSquare.value?.row === row && selectedSquare.value?.col === col
  const isPossibleMove = possibleMoves.value.some(move => move.row === row && move.col === col)
  const isLastMoveFrom = lastMove.value?.from.row === row && lastMove.value?.from.col === col
  const isLastMoveTo = lastMove.value?.to.row === row && lastMove.value?.to.col === col
  
  return {
    'light': (row + col) % 2 === 0,
    'dark': (row + col) % 2 === 1,
    'selected': isSelected,
    'possible-move': isPossibleMove,
    'in-check': isKingInCheck(row, col),
    'last-move': isLastMoveFrom || isLastMoveTo
  }
}
</script>

<style scoped>
.chess-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.game-header {
  margin-bottom: 20px;
  text-align: center;
}

.game-header h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.game-info {
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.controls {
  display: flex;
  gap: 10px;
}

.current-player {
  font-weight: bold;
}

.current-player .white { color: #2196F3; }
.current-player .black { color: #424242; }

.game-status {
  color: #f44336;
  font-weight: bold;
}

.control-btn {
  padding: 8px 16px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  background-color: #2196F3;
}

.control-btn:hover:not(:disabled) {
  background-color: #1976D2;
  transform: translateY(-1px);
}

.control-btn:disabled {
  background-color: #BDBDBD;
  cursor: not-allowed;
  transform: none;
}

.reset-btn {
  background-color: #4CAF50;
}

.reset-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.chess-board {
  border: 3px solid #8B4513;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  user-select: none;
}

.chess-row {
  display: flex;
}

.chess-cell {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.chess-cell.light { background-color: #f0d9b5; }
.chess-cell.dark { background-color: #b58863; }

.chess-cell.selected {
  background-color: #ffeb3b !important;
  box-shadow: inset 0 0 0 3px #ff9800;
}

.chess-cell.possible-move::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(76, 175, 80, 0.6);
}

.chess-cell.in-check {
  background-color: #f44336 !important;
  animation: pulse 1s infinite;
}

.chess-cell.last-move {
  background-color: rgba(155, 205, 50, 0.5) !important;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.chess-piece {
  font-size: 36px;
  z-index: 1;
}

.chess-piece.white {
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.chess-piece.black {
  color: #000000;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
}

.coordinate {
  position: absolute;
  font-size: 10px;
  font-weight: bold;
  color: #666;
  opacity: 0.7;
}

.coordinate:not(.row-number) {
  bottom: 2px;
  right: 2px;
}

.coordinate.row-number {
  top: 2px;
  left: 2px;
}

.captured-pieces {
  margin-top: 20px;
  display: flex;
  gap: 40px;
  justify-content: center;
  flex-wrap: wrap;
}

.captured-white, .captured-black {
  text-align: center;
}

.pieces {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: center;
  min-height: 40px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.captured-piece {
  font-size: 24px;
  display: inline-block; /* Required for transition */
  margin-right: 5px;
}

.captured-piece.white {
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.captured-piece.black {
  color: #000000;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
}

/* Transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

@media (max-width: 768px) {
  .chess-cell {
    width: 45px;
    height: 45px;
  }
  
  .chess-piece {
    font-size: 28px;
  }
}
</style>
