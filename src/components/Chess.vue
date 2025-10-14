<template>
  <div class="chess-game">
    <div class="game-header">
      <h2>国际象棋</h2>
      <div class="game-info">
        <div class="current-player">
          当前玩家: <span :class="currentPlayer">{{ currentPlayer === 'white' ? '白方' : '黑方' }}</span>
        </div>
        <div class="game-status" v-if="gameStatus">{{ gameStatus }}</div>
        <button @click="resetGame" class="reset-btn">重新开始</button>
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
          :class="{
            'light': (rowIndex + colIndex) % 2 === 0,
            'dark': (rowIndex + colIndex) % 2 === 1,
            'selected': selectedSquare && selectedSquare.row === rowIndex && selectedSquare.col === colIndex,
            'possible-move': possibleMoves.some(move => move.row === rowIndex && move.col === colIndex),
            'in-check': isKingInCheck(rowIndex, colIndex)
          }"
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
        <div class="pieces">
          <span v-for="(piece, index) in capturedPieces.white" :key="index" class="captured-piece white">
            {{ getPieceSymbol(piece) }}
          </span>
        </div>
      </div>
      <div class="captured-black">
        <h4>黑方被吃棋子:</h4>
        <div class="pieces">
          <span v-for="(piece, index) in capturedPieces.black" :key="index" class="captured-piece black">
            {{ getPieceSymbol(piece) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

interface ChessPiece {
  type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'
  color: 'white' | 'black'
  hasMoved?: boolean
}

interface Square {
  row: number
  col: number
}

interface Move {
  from: Square
  to: Square
  piece: ChessPiece
  capturedPiece?: ChessPiece
}

const board = ref<(ChessPiece | null)[][]>([])
const currentPlayer = ref<'white' | 'black'>('white')
const selectedSquare = ref<Square | null>(null)
const possibleMoves = ref<Square[]>([])
const gameStatus = ref<string>('')
const moveHistory = ref<Move[]>([])
const capturedPieces = reactive({
  white: [] as ChessPiece[],
  black: [] as ChessPiece[]
})

// 初始化棋盘
const initializeBoard = () => {
  board.value = Array(8).fill(null).map(() => Array(8).fill(null))
  
  // 放置白方棋子
  const whiteBackRow: ChessPiece['type'][] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
  whiteBackRow.forEach((type, col) => {
    board.value[7][col] = { type, color: 'white', hasMoved: false }
  })
  for (let col = 0; col < 8; col++) {
    board.value[6][col] = { type: 'pawn', color: 'white', hasMoved: false }
  }
  
  // 放置黑方棋子
  const blackBackRow: ChessPiece['type'][] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
  blackBackRow.forEach((type, col) => {
    board.value[0][col] = { type, color: 'black', hasMoved: false }
  })
  for (let col = 0; col < 8; col++) {
    board.value[1][col] = { type: 'pawn', color: 'black', hasMoved: false }
  }
}

// 获取棋子符号
const getPieceSymbol = (piece: ChessPiece): string => {
  const symbols = {
    white: {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙'
    },
    black: {
      king: '♚',
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞',
      pawn: '♟'
    }
  }
  return symbols[piece.color][piece.type]
}

// 检查位置是否在棋盘内
const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < 8 && col >= 0 && col < 8
}

// 获取可能的移动
const getPossibleMoves = (row: number, col: number): Square[] => {
  const piece = board.value[row][col]
  if (!piece || piece.color !== currentPlayer.value) return []
  
  const moves: Square[] = []
  
  switch (piece.type) {
    case 'pawn':
      moves.push(...getPawnMoves(row, col, piece))
      break
    case 'rook':
      moves.push(...getRookMoves(row, col, piece))
      break
    case 'bishop':
      moves.push(...getBishopMoves(row, col, piece))
      break
    case 'queen':
      moves.push(...getQueenMoves(row, col, piece))
      break
    case 'king':
      moves.push(...getKingMoves(row, col, piece))
      break
    case 'knight':
      moves.push(...getKnightMoves(row, col, piece))
      break
  }
  
  // 过滤掉会导致自己被将军的移动
  return moves.filter(move => !wouldBeInCheckAfterMove({ row, col }, move, piece))
}

// 兵的移动规则
const getPawnMoves = (row: number, col: number, piece: ChessPiece): Square[] => {
  const moves: Square[] = []
  const direction = piece.color === 'white' ? -1 : 1
  const startRow = piece.color === 'white' ? 6 : 1
  
  // 向前移动一格
  if (isValidPosition(row + direction, col) && !board.value[row + direction][col]) {
    moves.push({ row: row + direction, col })
    
    // 初始位置可以移动两格
    if (row === startRow && !board.value[row + 2 * direction][col]) {
      moves.push({ row: row + 2 * direction, col })
    }
  }
  
  // 斜向吃子
  for (const dcol of [-1, 1]) {
    const newRow = row + direction
    const newCol = col + dcol
    if (isValidPosition(newRow, newCol)) {
      const target = board.value[newRow][newCol]
      if (target && target.color !== piece.color) {
        moves.push({ row: newRow, col: newCol })
      }
    }
  }
  
  return moves
}

// 车的移动规则
const getRookMoves = (row: number, col: number, piece: ChessPiece): Square[] => {
  const moves: Square[] = []
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]
  
  for (const [drow, dcol] of directions) {
    for (let i = 1; i < 8; i++) {
      const newRow = row + drow * i
      const newCol = col + dcol * i
      
      if (!isValidPosition(newRow, newCol)) break
      
      const target = board.value[newRow][newCol]
      if (!target) {
        moves.push({ row: newRow, col: newCol })
      } else {
        if (target.color !== piece.color) {
          moves.push({ row: newRow, col: newCol })
        }
        break
      }
    }
  }
  
  return moves
}

// 象的移动规则
const getBishopMoves = (row: number, col: number, piece: ChessPiece): Square[] => {
  const moves: Square[] = []
  const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
  
  for (const [drow, dcol] of directions) {
    for (let i = 1; i < 8; i++) {
      const newRow = row + drow * i
      const newCol = col + dcol * i
      
      if (!isValidPosition(newRow, newCol)) break
      
      const target = board.value[newRow][newCol]
      if (!target) {
        moves.push({ row: newRow, col: newCol })
      } else {
        if (target.color !== piece.color) {
          moves.push({ row: newRow, col: newCol })
        }
        break
      }
    }
  }
  
  return moves
}

// 后的移动规则
const getQueenMoves = (row: number, col: number, piece: ChessPiece): Square[] => {
  return [...getRookMoves(row, col, piece), ...getBishopMoves(row, col, piece)]
}

// 王的移动规则
const getKingMoves = (row: number, col: number, piece: ChessPiece): Square[] => {
  const moves: Square[] = []
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]
  
  for (const [drow, dcol] of directions) {
    const newRow = row + drow
    const newCol = col + dcol
    
    if (isValidPosition(newRow, newCol)) {
      const target = board.value[newRow][newCol]
      if (!target || target.color !== piece.color) {
        moves.push({ row: newRow, col: newCol })
      }
    }
  }
  
  return moves
}

// 马的移动规则
const getKnightMoves = (row: number, col: number, piece: ChessPiece): Square[] => {
  const moves: Square[] = []
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ]
  
  for (const [drow, dcol] of knightMoves) {
    const newRow = row + drow
    const newCol = col + dcol
    
    if (isValidPosition(newRow, newCol)) {
      const target = board.value[newRow][newCol]
      if (!target || target.color !== piece.color) {
        moves.push({ row: newRow, col: newCol })
      }
    }
  }
  
  return moves
}

// 找到国王位置
const findKing = (color: 'white' | 'black'): Square | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board.value[row][col]
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col }
      }
    }
  }
  return null
}

// 检查是否被将军
const isInCheck = (color: 'white' | 'black'): boolean => {
  const kingPos = findKing(color)
  if (!kingPos) return false
  
  // 检查对方所有棋子是否能攻击到国王
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board.value[row][col]
      if (piece && piece.color !== color) {
        const moves = getPossibleMovesWithoutCheckValidation(row, col, piece)
        if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
          return true
        }
      }
    }
  }
  
  return false
}

// 获取可能移动（不验证将军）
const getPossibleMovesWithoutCheckValidation = (row: number, col: number, piece: ChessPiece): Square[] => {
  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(row, col, piece)
    case 'rook':
      return getRookMoves(row, col, piece)
    case 'bishop':
      return getBishopMoves(row, col, piece)
    case 'queen':
      return getQueenMoves(row, col, piece)
    case 'king':
      return getKingMoves(row, col, piece)
    case 'knight':
      return getKnightMoves(row, col, piece)
    default:
      return []
  }
}

// 检查移动后是否会被将军
const wouldBeInCheckAfterMove = (from: Square, to: Square, piece: ChessPiece): boolean => {
  // 临时执行移动
  const originalPiece = board.value[to.row][to.col]
  board.value[to.row][to.col] = piece
  board.value[from.row][from.col] = null
  
  const inCheck = isInCheck(piece.color)
  
  // 恢复棋盘
  board.value[from.row][from.col] = piece
  board.value[to.row][to.col] = originalPiece
  
  return inCheck
}

// 检查是否将死
const isCheckmate = (color: 'white' | 'black'): boolean => {
  if (!isInCheck(color)) return false
  
  // 检查是否有任何合法移动
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board.value[row][col]
      if (piece && piece.color === color) {
        const moves = getPossibleMoves(row, col)
        if (moves.length > 0) return false
      }
    }
  }
  
  return true
}

// 检查是否和棋
const isStalemate = (color: 'white' | 'black'): boolean => {
  if (isInCheck(color)) return false
  
  // 检查是否有任何合法移动
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board.value[row][col]
      if (piece && piece.color === color) {
        const moves = getPossibleMoves(row, col)
        if (moves.length > 0) return false
      }
    }
  }
  
  return true
}

// 检查国王是否被将军（用于高亮显示）
const isKingInCheck = (row: number, col: number): boolean => {
  const piece = board.value[row][col]
  return !!(piece && piece.type === 'king' && isInCheck(piece.color))
}

// 处理方格点击
const handleSquareClick = (row: number, col: number) => {
  if (gameStatus.value) return // 游戏已结束
  
  const clickedPiece = board.value[row][col]
  
  if (selectedSquare.value) {
    // 如果已选中棋子，尝试移动
    const isValidMove = possibleMoves.value.some(move => move.row === row && move.col === col)
    
    if (isValidMove) {
      makeMove(selectedSquare.value, { row, col })
    } else if (clickedPiece && clickedPiece.color === currentPlayer.value) {
      // 选择新棋子
      selectedSquare.value = { row, col }
      possibleMoves.value = getPossibleMoves(row, col)
    } else {
      // 取消选择
      selectedSquare.value = null
      possibleMoves.value = []
    }
  } else {
    // 选择棋子
    if (clickedPiece && clickedPiece.color === currentPlayer.value) {
      selectedSquare.value = { row, col }
      possibleMoves.value = getPossibleMoves(row, col)
    }
  }
}

// 执行移动
const makeMove = (from: Square, to: Square) => {
  const piece = board.value[from.row][from.col]
  const capturedPiece = board.value[to.row][to.col]
  
  if (!piece) return
  
  // 记录移动
  const move: Move = {
    from,
    to,
    piece: { ...piece },
    capturedPiece: capturedPiece ? { ...capturedPiece } : undefined
  }
  moveHistory.value.push(move)
  
  // 如果吃子，添加到被吃棋子列表
  if (capturedPiece) {
    capturedPieces[capturedPiece.color].push(capturedPiece)
  }
  
  // 执行移动
  board.value[to.row][to.col] = piece
  board.value[from.row][from.col] = null
  piece.hasMoved = true
  
  // 检查兵的升变
  if (piece.type === 'pawn') {
    const promotionRow = piece.color === 'white' ? 0 : 7
    if (to.row === promotionRow) {
      // 自动升变为后
      piece.type = 'queen'
    }
  }
  
  // 切换玩家
  currentPlayer.value = currentPlayer.value === 'white' ? 'black' : 'white'
  
  // 检查游戏状态
  checkGameStatus()
  
  // 清除选择
  selectedSquare.value = null
  possibleMoves.value = []
}

// 检查游戏状态
const checkGameStatus = () => {
  if (isCheckmate(currentPlayer.value)) {
    const winner = currentPlayer.value === 'white' ? '黑方' : '白方'
    gameStatus.value = `将死！${winner}获胜！`
  } else if (isStalemate(currentPlayer.value)) {
    gameStatus.value = '和棋！'
  } else if (isInCheck(currentPlayer.value)) {
    gameStatus.value = `${currentPlayer.value === 'white' ? '白方' : '黑方'}被将军！`
  } else {
    gameStatus.value = ''
  }
}

// 重置游戏
const resetGame = () => {
  initializeBoard()
  currentPlayer.value = 'white'
  selectedSquare.value = null
  possibleMoves.value = []
  gameStatus.value = ''
  moveHistory.value = []
  capturedPieces.white = []
  capturedPieces.black = []
}

// 初始化游戏
initializeBoard()
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

.current-player {
  font-weight: bold;
}

.current-player .white {
  color: #2196F3;
}

.current-player .black {
  color: #424242;
}

.game-status {
  color: #f44336;
  font-weight: bold;
}

.reset-btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.reset-btn:hover {
  background-color: #45a049;
}

.chess-board {
  border: 3px solid #8B4513;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
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

.chess-cell.light {
  background-color: #f0d9b5;
}

.chess-cell.dark {
  background-color: #b58863;
}

.chess-cell.selected {
  background-color: #ffeb3b !important;
  box-shadow: inset 0 0 0 3px #ff9800;
}

.chess-cell.possible-move {
  background-color: #4caf50 !important;
  opacity: 0.8;
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

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.chess-piece {
  font-size: 36px;
  user-select: none;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
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

.captured-pieces h4 {
  margin: 0 0 10px 0;
  color: #333;
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
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.captured-piece.white {
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.captured-piece.black {
  color: #000000;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .chess-cell {
    width: 45px;
    height: 45px;
  }
  
  .chess-piece {
    font-size: 28px;
  }
  
  .game-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .captured-pieces {
    flex-direction: column;
    gap: 20px;
  }
}
</style>