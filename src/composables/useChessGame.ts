import { ref, reactive, computed } from 'vue'
import { useRefHistory } from '@vueuse/core'

// --- Types ---
export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'
export type Color = 'white' | 'black'

export interface ChessPiece {
  type: PieceType
  color: Color
  hasMoved?: boolean
}

export interface Square {
  row: number
  col: number
}

export interface Move {
  from: Square
  to: Square
  piece: ChessPiece
  capturedPiece?: ChessPiece
}

// --- Constants ---
const BOARD_SIZE = 8
const DIRECTIONS = {
  ORTHOGONAL: [[0, 1], [0, -1], [1, 0], [-1, 0]],
  DIAGONAL: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
  KNIGHT: [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]],
  KING: [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]
}

export function useChessGame() {
  // --- State ---
  const board = ref<(ChessPiece | null)[][]>([])
  const currentPlayer = ref<Color>('white')
  const selectedSquare = ref<Square | null>(null)
  const possibleMoves = ref<Square[]>([])
  const gameStatus = ref<string>('')
  const moveHistory = ref<Move[]>([])
  
  // Use useRefHistory for undo/redo functionality
  const { history, undo, redo, canUndo, canRedo } = useRefHistory(board, {
    deep: true,
    capacity: 50 // Limit history to last 50 moves
  })

  const capturedPieces = reactive({
    white: [] as ChessPiece[],
    black: [] as ChessPiece[]
  })

  // --- Computed ---
  const currentPlayerText = computed(() => currentPlayer.value === 'white' ? '白方' : '黑方')

  const lastMove = computed(() => {
    if (moveHistory.value.length === 0) return null
    return moveHistory.value[moveHistory.value.length - 1]
  })

  // --- Helpers ---
  const isValidPosition = (row: number, col: number): boolean => 
    row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE

  // --- Board Initialization ---
  const initializeBoard = () => {
    board.value = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
    
    const backRow: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
    
    // Place pieces
    backRow.forEach((type, col) => {
      board.value[7][col] = { type, color: 'white', hasMoved: false }
      board.value[0][col] = { type, color: 'black', hasMoved: false }
    })
    
    for (let col = 0; col < BOARD_SIZE; col++) {
      board.value[6][col] = { type: 'pawn', color: 'white', hasMoved: false }
      board.value[1][col] = { type: 'pawn', color: 'black', hasMoved: false }
    }
  }

  // --- Move Logic ---
  const getSlidingMoves = (row: number, col: number, piece: ChessPiece, directions: number[][]): Square[] => {
    const moves: Square[] = []
    for (const [drow, dcol] of directions) {
      for (let i = 1; i < BOARD_SIZE; i++) {
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

  const getSteppingMoves = (row: number, col: number, piece: ChessPiece, offsets: number[][]): Square[] => {
    const moves: Square[] = []
    for (const [drow, dcol] of offsets) {
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

  const getPawnMoves = (row: number, col: number, piece: ChessPiece): Square[] => {
    const moves: Square[] = []
    const direction = piece.color === 'white' ? -1 : 1
    const startRow = piece.color === 'white' ? 6 : 1
    
    // Forward
    if (isValidPosition(row + direction, col) && !board.value[row + direction][col]) {
      moves.push({ row: row + direction, col })
      if (row === startRow && !board.value[row + 2 * direction][col]) {
        moves.push({ row: row + 2 * direction, col })
      }
    }
    
    // Capture
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

  const getPossibleMovesWithoutCheckValidation = (row: number, col: number, piece: ChessPiece): Square[] => {
    switch (piece.type) {
      case 'pawn': return getPawnMoves(row, col, piece)
      case 'rook': return getSlidingMoves(row, col, piece, DIRECTIONS.ORTHOGONAL)
      case 'bishop': return getSlidingMoves(row, col, piece, DIRECTIONS.DIAGONAL)
      case 'queen': return getSlidingMoves(row, col, piece, [...DIRECTIONS.ORTHOGONAL, ...DIRECTIONS.DIAGONAL])
      case 'knight': return getSteppingMoves(row, col, piece, DIRECTIONS.KNIGHT)
      case 'king': return getSteppingMoves(row, col, piece, DIRECTIONS.KING)
      default: return []
    }
  }

  const wouldBeInCheckAfterMove = (from: Square, to: Square, piece: ChessPiece): boolean => {
    const originalPiece = board.value[to.row][to.col]
    board.value[to.row][to.col] = piece
    board.value[from.row][from.col] = null
    
    const inCheck = isInCheck(piece.color)
    
    // Restore
    board.value[from.row][from.col] = piece
    board.value[to.row][to.col] = originalPiece
    
    return inCheck
  }

  const getPossibleMoves = (row: number, col: number): Square[] => {
    const piece = board.value[row][col]
    if (!piece || piece.color !== currentPlayer.value) return []
    
    const moves = getPossibleMovesWithoutCheckValidation(row, col, piece)
    return moves.filter(move => !wouldBeInCheckAfterMove({ row, col }, move, piece))
  }

  // --- Check Logic ---
  const findKing = (color: Color): Square | null => {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const p = board.value[r][c]
        if (p?.type === 'king' && p.color === color) return { row: r, col: c }
      }
    }
    return null
  }

  const isInCheck = (color: Color): boolean => {
    const kingPos = findKing(color)
    if (!kingPos) return false
    
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = board.value[r][c]
        if (piece && piece.color !== color) {
          const moves = getPossibleMovesWithoutCheckValidation(r, c, piece)
          if (moves.some(m => m.row === kingPos.row && m.col === kingPos.col)) return true
        }
      }
    }
    return false
  }

  const isKingInCheck = (row: number, col: number): boolean => {
    const piece = board.value[row][col]
    return !!(piece && piece.type === 'king' && isInCheck(piece.color))
  }

  const hasAnyLegalMoves = (color: Color): boolean => {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = board.value[r][c]
        if (piece && piece.color === color) {
          if (getPossibleMoves(r, c).length > 0) return true
        }
      }
    }
    return false
  }

  const checkGameStatus = () => {
    if (!hasAnyLegalMoves(currentPlayer.value)) {
      if (isInCheck(currentPlayer.value)) {
        const winner = currentPlayer.value === 'white' ? '黑方' : '白方'
        gameStatus.value = `将死！${winner}获胜！`
      } else {
        gameStatus.value = '和棋！'
      }
    } else if (isInCheck(currentPlayer.value)) {
      gameStatus.value = `${currentPlayerText.value}被将军！`
    } else {
      gameStatus.value = ''
    }
  }

  // --- Game Actions ---
  const handleSquareClick = (row: number, col: number) => {
    if (gameStatus.value && !gameStatus.value.includes('将军')) return 
    
    const clickedPiece = board.value[row][col]
    const isSelectedSquare = selectedSquare.value?.row === row && selectedSquare.value?.col === col
    
    // Move to selected square
    if (selectedSquare.value) {
      const isValidMove = possibleMoves.value.some(m => m.row === row && m.col === col)
      if (isValidMove) {
        makeMove(selectedSquare.value, { row, col })
        return
      }
    }
    
    // Select piece
    if (clickedPiece && clickedPiece.color === currentPlayer.value) {
      if (isSelectedSquare) {
        // Deselect
        selectedSquare.value = null
        possibleMoves.value = []
      } else {
        // Select
        selectedSquare.value = { row, col }
        possibleMoves.value = getPossibleMoves(row, col)
      }
    } else {
      // Clicked empty or enemy without valid move
      selectedSquare.value = null
      possibleMoves.value = []
    }
  }

  const makeMove = (from: Square, to: Square) => {
    const piece = board.value[from.row][from.col]!
    const target = board.value[to.row][to.col]
    
    // Record history
    moveHistory.value.push({
      from,
      to,
      piece: { ...piece },
      capturedPiece: target ? { ...target } : undefined
    })
    
    // Update captured
    if (target) {
      capturedPieces[target.color].push(target)
    }
    
    // Move piece
    board.value[to.row][to.col] = piece
    board.value[from.row][from.col] = null
    piece.hasMoved = true
    
    // Promotion (Auto Queen)
    if (piece.type === 'pawn') {
      const promotionRow = piece.color === 'white' ? 0 : 7
      if (to.row === promotionRow) piece.type = 'queen'
    }
    
    // Switch turn
    currentPlayer.value = currentPlayer.value === 'white' ? 'black' : 'white'
    
    // Reset selection
    selectedSquare.value = null
    possibleMoves.value = []
    
    checkGameStatus()
  }

  const undoMove = () => {
      if (canUndo.value) {
          undo()
          // Revert turn logic
          currentPlayer.value = currentPlayer.value === 'white' ? 'black' : 'white'
          moveHistory.value.pop()
          // Note: Captured pieces logic would need more complex state tracking to perfectly undo
          // For now, simple board undo
          selectedSquare.value = null
          possibleMoves.value = []
          checkGameStatus()
      }
  }

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

  // Initialize
  initializeBoard()

  return {
    // State
    board,
    currentPlayer,
    selectedSquare,
    possibleMoves,
    gameStatus,
    capturedPieces,
    currentPlayerText,
    lastMove,
    
    // History
    canUndo,
    canRedo,
    undoMove,
    
    // Actions
    handleSquareClick,
    resetGame,
    isKingInCheck
  }
}
