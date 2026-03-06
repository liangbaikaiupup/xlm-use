<template>
  <div class="chinese-chess">
    <div class="game-header">
      <h1>中国象棋</h1>
      <div class="game-controls">
        <div class="mode-controls">
          <label class="mode-toggle">
            <input type="checkbox" v-model="isAIMode" @change="handleModeChange">
            <span class="toggle-slider"></span>
            <span class="mode-label">{{ isAIMode ? 'AI对战' : '双人对战' }}</span>
          </label>
          <select v-if="isAIMode" v-model="aiDifficulty" class="difficulty-select">
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>
        <div class="action-controls">
          <button @click="resetGame" class="control-btn">重新开始</button>
          <button @click="undoMove" :disabled="!canUndo" class="control-btn">悔棋</button>
        </div>
      </div>
    </div>
    
    <div class="game-info">
      <div class="current-player">
        当前玩家: <span :class="currentPlayer">{{ currentPlayer === 'red' ? '红方' : (isAIMode ? 'AI' : '黑方') }}</span>
        <span v-if="isAIThinking" class="ai-thinking">🤔 AI思考中...</span>
      </div>
      <div class="game-status" v-if="gameStatus">{{ gameStatus }}</div>
    </div>

    <div class="chess-board">
      <!-- 棋盘背景 -->
      <svg class="board-lines" viewBox="0 0 800 900">
        <!-- 横线 -->
        <line v-for="i in 10" :key="`h-${i}`" 
              :x1="50" :y1="50 + (i-1) * 80" 
              :x2="750" :y2="50 + (i-1) * 80" 
              stroke="#8B4513" stroke-width="2"/>
        
        <!-- 竖线 -->
        <line v-for="i in 9" :key="`v-${i}`" 
              :x1="50 + (i-1) * 87.5" :y1="50" 
              :x2="50 + (i-1) * 87.5" :y2="450" 
              stroke="#8B4513" stroke-width="2"/>
        <line v-for="i in 9" :key="`v2-${i}`" 
              :x1="50 + (i-1) * 87.5" :y1="530" 
              :x2="50 + (i-1) * 87.5" :y2="770" 
              stroke="#8B4513" stroke-width="2"/>
        
        <!-- 九宫格斜线 -->
        <!-- 上方九宫格 -->
        <line x1="312.5" y1="50" x2="487.5" y2="210" stroke="#8B4513" stroke-width="2"/>
        <line x1="487.5" y1="50" x2="312.5" y2="210" stroke="#8B4513" stroke-width="2"/>
        
        <!-- 下方九宫格 -->
        <line x1="312.5" y1="610" x2="487.5" y2="770" stroke="#8B4513" stroke-width="2"/>
        <line x1="487.5" y1="610" x2="312.5" y2="770" stroke="#8B4513" stroke-width="2"/>
        
        <!-- 楚河汉界 -->
        <text x="200" y="420" font-size="24" fill="#8B4513" font-weight="bold">楚河</text>
        <text x="500" y="420" font-size="24" fill="#8B4513" font-weight="bold">汉界</text>
      </svg>

      <!-- 棋子 -->
      <div class="chess-pieces">
        <template v-for="(row, rowIndex) in board" :key="rowIndex">
          <template v-for="(piece, colIndex) in row" :key="`${rowIndex}-${colIndex}`">
            <div v-if="piece"
                 class="chess-piece"
                 :class="[(piece as ChessPiece).color, { 
                   'selected': selectedPiece && selectedPiece.row === (piece as ChessPiece).row && selectedPiece.col === (piece as ChessPiece).col,
                   'possible-move': isPossibleMove((piece as ChessPiece).row, (piece as ChessPiece).col)
                 }]"
                 :style="getPiecePosition((piece as ChessPiece).row, (piece as ChessPiece).col)"
                 @click="handlePieceClick(piece as ChessPiece)">
              <div class="piece-content">{{ (piece as ChessPiece).name }}</div>
            </div>
          </template>
        </template>
      </div>

      <!-- 可能的移动位置 -->
      <div class="move-hints">
        <div v-for="move in possibleMoves" :key="`${move.row}-${move.col}`"
             class="move-hint"
             :style="getPiecePosition(move.row, move.col)"
             @click="handleMoveClick(move.row, move.col)">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

// 棋子类型定义
interface ChessPiece {
  name: string
  color: 'red' | 'black'
  type: string
  row: number
  col: number
}

// 游戏状态
const currentPlayer = ref<'red' | 'black'>('red')
const selectedPiece = ref<ChessPiece | null>(null)
const possibleMoves = ref<Array<{row: number, col: number}>>([])
const gameStatus = ref<string>('')
const moveHistory = ref<any[]>([])
const isMounted = ref(true)

// AI相关状态
const isAIMode = ref<boolean>(false)
const aiDifficulty = ref<'easy' | 'medium' | 'hard'>('medium')
const isAIThinking = ref<boolean>(false)

// 初始化棋盘
const initializeBoard = (): (ChessPiece | null)[][] => {
  const board: (ChessPiece | null)[][] = Array(10).fill(null).map(() => Array(9).fill(null))
  
  // 黑方棋子 (上方)
  const blackPieces = [
    { name: '車', type: 'rook', positions: [[0, 0], [0, 8]] },
    { name: '馬', type: 'knight', positions: [[0, 1], [0, 7]] },
    { name: '象', type: 'elephant', positions: [[0, 2], [0, 6]] },
    { name: '士', type: 'advisor', positions: [[0, 3], [0, 5]] },
    { name: '將', type: 'king', positions: [[0, 4]] },
    { name: '炮', type: 'cannon', positions: [[2, 1], [2, 7]] },
    { name: '卒', type: 'pawn', positions: [[3, 0], [3, 2], [3, 4], [3, 6], [3, 8]] }
  ]

  // 红方棋子 (下方)
  const redPieces = [
    { name: '车', type: 'rook', positions: [[9, 0], [9, 8]] },
    { name: '马', type: 'knight', positions: [[9, 1], [9, 7]] },
    { name: '相', type: 'elephant', positions: [[9, 2], [9, 6]] },
    { name: '仕', type: 'advisor', positions: [[9, 3], [9, 5]] },
    { name: '帅', type: 'king', positions: [[9, 4]] },
    { name: '炮', type: 'cannon', positions: [[7, 1], [7, 7]] },
    { name: '兵', type: 'pawn', positions: [[6, 0], [6, 2], [6, 4], [6, 6], [6, 8]] }
  ]

  // 放置黑方棋子
  blackPieces.forEach(pieceType => {
    pieceType.positions.forEach(([row, col]) => {
      board[row][col] = {
        name: pieceType.name,
        color: 'black',
        type: pieceType.type,
        row,
        col
      }
    })
  })

  // 放置红方棋子
  redPieces.forEach(pieceType => {
    pieceType.positions.forEach(([row, col]) => {
      board[row][col] = {
        name: pieceType.name,
        color: 'red',
        type: pieceType.type,
        row,
        col
      }
    })
  })

  return board
}

const board = ref<(ChessPiece | null)[][]>(initializeBoard())

// 计算棋子位置
const getPiecePosition = (row: number, col: number) => {
  const x = 50 + col * 87.5
  const y = 50 + row * 80
  return {
    left: `${x - 30}px`,
    top: `${y - 30}px`
  }
}

// 检查是否为可能的移动位置
const isPossibleMove = (row: number, col: number) => {
  return possibleMoves.value.some(move => move.row === row && move.col === col)
}

// 获取可能的移动位置
const getPossibleMoves = (piece: ChessPiece): {row: number, col: number}[] => {
  const moves: {row: number, col: number}[] = []
  const { row, col, type, color } = piece

  switch (type) {
    case 'pawn':
      // 兵/卒的移动规则
      if (color === 'red') {
        // 红兵
        if (row > 4) {
          // 未过河，只能向前
          if (row > 0 && !board.value[row - 1][col]) {
            moves.push({ row: row - 1, col })
          }
        } else {
          // 已过河，可以向前和左右
          if (row > 0 && !board.value[row - 1][col]) {
            moves.push({ row: row - 1, col })
          }
          if (col > 0 && !board.value[row][col - 1]) {
            moves.push({ row, col: col - 1 })
          }
          if (col < 8 && !board.value[row][col + 1]) {
            moves.push({ row, col: col + 1 })
          }
        }
      } else {
        // 黑卒
        if (row < 5) {
          // 未过河，只能向前
          if (row < 9 && !board.value[row + 1][col]) {
            moves.push({ row: row + 1, col })
          }
        } else {
          // 已过河，可以向前和左右
          if (row < 9 && !board.value[row + 1][col]) {
            moves.push({ row: row + 1, col })
          }
          if (col > 0 && !board.value[row][col - 1]) {
            moves.push({ row, col: col - 1 })
          }
          if (col < 8 && !board.value[row][col + 1]) {
            moves.push({ row, col: col + 1 })
          }
        }
      }
      break

    case 'rook':
      // 车的移动规则 - 直线移动
      // 向上
      for (let r = row - 1; r >= 0; r--) {
        if (!board.value[r][col]) {
          moves.push({ row: r, col })
        } else {
          if (board.value[r][col]!.color !== color) {
            moves.push({ row: r, col })
          }
          break
        }
      }
      // 向下
      for (let r = row + 1; r <= 9; r++) {
        if (!board.value[r][col]) {
          moves.push({ row: r, col })
        } else {
          if (board.value[r][col]!.color !== color) {
            moves.push({ row: r, col })
          }
          break
        }
      }
      // 向左
      for (let c = col - 1; c >= 0; c--) {
        if (!board.value[row][c]) {
          moves.push({ row, col: c })
        } else {
          if (board.value[row][c]!.color !== color) {
            moves.push({ row, col: c })
          }
          break
        }
      }
      // 向右
      for (let c = col + 1; c <= 8; c++) {
        if (!board.value[row][c]) {
          moves.push({ row, col: c })
        } else {
          if (board.value[row][c]!.color !== color) {
            moves.push({ row, col: c })
          }
          break
        }
      }
      break

    case 'knight':
      // 马的移动规则 - 日字形
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ]
      knightMoves.forEach(([dr, dc]) => {
        const newRow = row + dr
        const newCol = col + dc
        if (newRow >= 0 && newRow <= 9 && newCol >= 0 && newCol <= 8) {
          // 检查马腿是否被阻挡
          const blockRow = row + Math.sign(dr)
          const blockCol = col + Math.sign(dc)
          if (!board.value[blockRow] || !board.value[blockRow][blockCol]) {
            if (!board.value[newRow][newCol] || board.value[newRow][newCol]!.color !== color) {
              moves.push({ row: newRow, col: newCol })
            }
          }
        }
      })
      break

    case 'cannon':
      // 炮的移动规则 - 需要跳过一个棋子才能吃子
      // 向上
      let hasJumped = false
      for (let r = row - 1; r >= 0; r--) {
        if (!board.value[r][col]) {
          if (!hasJumped) moves.push({ row: r, col })
        } else {
          if (!hasJumped) {
            hasJumped = true
          } else {
            if (board.value[r][col]!.color !== color) {
              moves.push({ row: r, col })
            }
            break
          }
        }
      }
      // 向下
      hasJumped = false
      for (let r = row + 1; r <= 9; r++) {
        if (!board.value[r][col]) {
          if (!hasJumped) moves.push({ row: r, col })
        } else {
          if (!hasJumped) {
            hasJumped = true
          } else {
            if (board.value[r][col]!.color !== color) {
              moves.push({ row: r, col })
            }
            break
          }
        }
      }
      // 向左
      hasJumped = false
      for (let c = col - 1; c >= 0; c--) {
        if (!board.value[row][c]) {
          if (!hasJumped) moves.push({ row, col: c })
        } else {
          if (!hasJumped) {
            hasJumped = true
          } else {
            if (board.value[row][c]!.color !== color) {
              moves.push({ row, col: c })
            }
            break
          }
        }
      }
      // 向右
      hasJumped = false
      for (let c = col + 1; c <= 8; c++) {
        if (!board.value[row][c]) {
          if (!hasJumped) moves.push({ row, col: c })
        } else {
          if (!hasJumped) {
            hasJumped = true
          } else {
            if (board.value[row][c]!.color !== color) {
              moves.push({ row, col: c })
            }
            break
          }
        }
      }
      break

    case 'king':
      // 帅/将的移动规则 - 只能在九宫格内移动
      const kingArea = color === 'red' ? [7, 8, 9] : [0, 1, 2]
      const kingMoves = [[-1, 0], [1, 0], [0, -1], [0, 1]]
      kingMoves.forEach(([dr, dc]) => {
        const newRow = row + dr
        const newCol = col + dc
        if (kingArea.includes(newRow) && newCol >= 3 && newCol <= 5) {
          if (!board.value[newRow][newCol] || board.value[newRow][newCol]!.color !== color) {
            moves.push({ row: newRow, col: newCol })
          }
        }
      })
      break

    case 'advisor':
      // 士的移动规则 - 只能在九宫格内斜着移动
      const advisorArea = color === 'red' ? [7, 8, 9] : [0, 1, 2]
      const advisorMoves = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      advisorMoves.forEach(([dr, dc]) => {
        const newRow = row + dr
        const newCol = col + dc
        if (advisorArea.includes(newRow) && newCol >= 3 && newCol <= 5) {
          if (!board.value[newRow][newCol] || board.value[newRow][newCol]!.color !== color) {
            moves.push({ row: newRow, col: newCol })
          }
        }
      })
      break

    case 'elephant':
      // 相/象的移动规则 - 田字形，不能过河
      const elephantArea = color === 'red' ? [5, 6, 7, 8, 9] : [0, 1, 2, 3, 4]
      const elephantMoves = [[-2, -2], [-2, 2], [2, -2], [2, 2]]
      elephantMoves.forEach(([dr, dc]) => {
        const newRow = row + dr
        const newCol = col + dc
        if (elephantArea.includes(newRow) && newCol >= 0 && newCol <= 8) {
          // 检查象眼是否被阻挡
          const eyeRow = row + dr / 2
          const eyeCol = col + dc / 2
          if (!board.value[eyeRow][eyeCol]) {
            if (!board.value[newRow][newCol] || board.value[newRow][newCol]!.color !== color) {
              moves.push({ row: newRow, col: newCol })
            }
          }
        }
      })
      break
  }

  return moves.filter(move => {
    // 过滤掉己方棋子的位置
    const targetPiece = board.value[move.row][move.col]
    return !targetPiece || targetPiece.color !== color
  })
}

// 处理棋子点击
const handlePieceClick = (piece: ChessPiece) => {
  if (piece.color !== currentPlayer.value) {
    return
  }

  if (selectedPiece.value && selectedPiece.value.row === piece.row && selectedPiece.value.col === piece.col) {
    // 取消选择
    selectedPiece.value = null
    possibleMoves.value = []
  } else {
    // 选择棋子
    selectedPiece.value = piece
    possibleMoves.value = getPossibleMoves(piece)
  }
}

// 处理移动点击
const handleMoveClick = (row: number, col: number) => {
  if (!selectedPiece.value) return

  // 保存移动历史
  const move = {
    from: { row: selectedPiece.value.row, col: selectedPiece.value.col },
    to: { row, col },
    piece: { ...selectedPiece.value },
    capturedPiece: board.value[row][col] ? { ...board.value[row][col] } : null
  }
  moveHistory.value.push(move)

  // 移动棋子
  board.value[selectedPiece.value.row][selectedPiece.value.col] = null
  selectedPiece.value.row = row
  selectedPiece.value.col = col
  board.value[row][col] = selectedPiece.value

  // 检查游戏状态
  checkGameStatus()

  // 切换玩家
  currentPlayer.value = currentPlayer.value === 'red' ? 'black' : 'red'
  selectedPiece.value = null
  possibleMoves.value = []
}

// 检查游戏状态
const checkGameStatus = () => {
  // 简单的将军检查
  const redKing = findKing('red')
  const blackKing = findKing('black')
  
  if (!redKing) {
    gameStatus.value = '黑方获胜！'
    return
  }
  if (!blackKing) {
    gameStatus.value = '红方获胜！'
    return
  }
  
  gameStatus.value = ''
}

// 查找王
const findKing = (color: 'red' | 'black'): ChessPiece | null => {
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board.value[row][col]
      if (piece && piece.color === color && piece.type === 'king') {
        return piece
      }
    }
  }
  return null
}

// 重新开始游戏
const resetGame = () => {
  board.value = initializeBoard()
  currentPlayer.value = 'red'
  selectedPiece.value = null
  possibleMoves.value = []
  gameStatus.value = ''
  moveHistory.value = []
}

// 悔棋
const undoMove = () => {
  if (moveHistory.value.length === 0) return

  const lastMove = moveHistory.value.pop()!
  
  // 恢复棋子位置
  board.value[lastMove.to.row][lastMove.to.col] = lastMove.capturedPiece
  lastMove.piece.row = lastMove.from.row
  lastMove.piece.col = lastMove.from.col
  board.value[lastMove.from.row][lastMove.from.col] = lastMove.piece

  // 切换玩家
  currentPlayer.value = currentPlayer.value === 'red' ? 'black' : 'red'
  selectedPiece.value = null
  possibleMoves.value = []
  gameStatus.value = ''
}

// AI相关方法
const handleModeChange = () => {
  resetGame()
}

// 棋子价值评估
const getPieceValue = (piece: ChessPiece): number => {
  const values: Record<string, number> = {
    'pawn': 10,
    'cannon': 45,
    'rook': 90,
    'knight': 40,
    'elephant': 20,
    'advisor': 20,
    'king': 1000
  }
  return values[piece.type] || 0
}

// 位置评估函数
const evaluatePosition = (board: (ChessPiece | null)[][], color: 'red' | 'black'): number => {
  let score = 0
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col]
      if (piece) {
        const pieceValue = getPieceValue(piece)
        const multiplier = piece.color === color ? 1 : -1
        
        // 基础分值
        score += pieceValue * multiplier
        
        // 位置奖励
        if (piece.type === 'pawn') {
          // 兵过河奖励
          const isAdvanced = piece.color === 'red' ? row < 5 : row > 4
          if (isAdvanced) score += 5 * multiplier
        }
        
        if (piece.type === 'king') {
          // 将帅安全性
          const inPalace = (piece.color === 'red' && row >= 7 && col >= 3 && col <= 5) ||
                          (piece.color === 'black' && row <= 2 && col >= 3 && col <= 5)
          if (inPalace) score += 10 * multiplier
        }
      }
    }
  }
  
  return score
}

// 获取所有可能的移动
const getAllPossibleMoves = (board: (ChessPiece | null)[][], color: 'red' | 'black'): Array<{from: {row: number, col: number}, to: {row: number, col: number}, piece: ChessPiece}> => {
  const moves: Array<{from: {row: number, col: number}, to: {row: number, col: number}, piece: ChessPiece}> = []
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col]
      if (piece && piece.color === color) {
        const possibleMoves = getPossibleMoves(piece)
        possibleMoves.forEach(move => {
          moves.push({
            from: { row: piece.row, col: piece.col },
            to: { row: move.row, col: move.col },
            piece
          })
        })
      }
    }
  }
  
  return moves
}

// 简化版Minimax算法
const minimax = (board: (ChessPiece | null)[][], depth: number, isMaximizing: boolean, aiColor: 'red' | 'black'): {score: number, move?: any} => {
  if (depth === 0) {
    return { score: evaluatePosition(board, aiColor) }
  }
  
  const currentColor = isMaximizing ? aiColor : (aiColor === 'red' ? 'black' : 'red')
  const moves = getAllPossibleMoves(board, currentColor)
  
  if (moves.length === 0) {
    return { score: isMaximizing ? -10000 : 10000 }
  }
  
  let bestMove = moves[0]
  let bestScore = isMaximizing ? -Infinity : Infinity
  
  for (const move of moves) {
    // 模拟移动
    const newBoard = board.map(row => [...row])
    const capturedPiece = newBoard[move.to.row][move.to.col]
    newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col]
    newBoard[move.from.row][move.from.col] = null
    
    if (newBoard[move.to.row][move.to.col]) {
      newBoard[move.to.row][move.to.col]!.row = move.to.row
      newBoard[move.to.row][move.to.col]!.col = move.to.col
    }
    
    const result = minimax(newBoard, depth - 1, !isMaximizing, aiColor)
    
    if (isMaximizing && result.score > bestScore) {
      bestScore = result.score
      bestMove = move
    } else if (!isMaximizing && result.score < bestScore) {
      bestScore = result.score
      bestMove = move
    }
  }
  
  return { score: bestScore, move: bestMove }
}

// AI选择最佳移动
const getAIMove = (): {from: {row: number, col: number}, to: {row: number, col: number}} | null => {
  const aiColor = 'black' // AI默认执黑
  const depth = aiDifficulty.value === 'easy' ? 1 : aiDifficulty.value === 'medium' ? 2 : 3
  
  const result = minimax(board.value, depth, true, aiColor)
  return result.move ? { from: result.move.from, to: result.move.to } : null
}

// AI执行移动
const executeAIMove = async () => {
  if (!isAIMode.value || currentPlayer.value !== 'black' || gameStatus.value) {
    return
  }
  
  isAIThinking.value = true
  
  // 添加思考延迟，让用户看到AI在思考
  await new Promise(resolve => setTimeout(resolve, 500))
  
  if (!isMounted.value) return

  const aiMove = getAIMove()
  if (aiMove) {
    const fromPiece = board.value[aiMove.from.row][aiMove.from.col]
    if (fromPiece) {
      // 记录移动历史
      moveHistory.value.push({
        from: { ...aiMove.from },
        to: { ...aiMove.to },
        piece: { ...fromPiece },
        capturedPiece: board.value[aiMove.to.row][aiMove.to.col] ? { ...board.value[aiMove.to.row][aiMove.to.col] } : null
      })
      
      // 执行移动
      board.value[aiMove.to.row][aiMove.to.col] = fromPiece
      board.value[aiMove.from.row][aiMove.from.col] = null
      fromPiece.row = aiMove.to.row
      fromPiece.col = aiMove.to.col
      
      // 切换玩家
      currentPlayer.value = 'red'
      
      // 检查游戏状态
      checkGameStatus()
    }
  }
  
  isAIThinking.value = false
}

// 监听当前玩家变化，触发AI移动
watch(currentPlayer, (newPlayer) => {
  if (isAIMode.value && newPlayer === 'black' && !gameStatus.value && isMounted.value) {
    nextTick(() => {
      executeAIMove()
    })
  }
})

// 计算属性
const canUndo = computed(() => moveHistory.value.length > 0)

onMounted(() => {
  isMounted.value = true
  resetGame()
})

onUnmounted(() => {
  isMounted.value = false
})
</script>

<style scoped>
.chinese-chess {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f5f5dc 0%, #deb887 100%);
  min-height: 100vh;
  font-family: 'Microsoft YaHei', sans-serif;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin-bottom: 20px;
}

.game-header h1 {
  color: #8B4513;
  font-size: 2.5rem;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.game-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.mode-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.mode-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.mode-toggle input[type="checkbox"] {
  display: none;
}

.toggle-slider {
  width: 50px;
  height: 25px;
  background: #ccc;
  border-radius: 25px;
  position: relative;
  transition: background 0.3s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 21px;
  height: 21px;
  border-radius: 50%;
  background: white;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

.mode-toggle input:checked + .toggle-slider {
  background: #4CAF50;
}

.mode-toggle input:checked + .toggle-slider::before {
  transform: translateX(25px);
}

.mode-label {
  font-weight: bold;
  color: #333;
}

.difficulty-select {
  padding: 5px 10px;
  border: 2px solid #d4af37;
  border-radius: 5px;
  background: white;
  font-weight: bold;
}

.action-controls {
  display: flex;
  gap: 10px;
}

.control-btn {
  padding: 10px 20px;
  background: linear-gradient(145deg, #d4af37, #b8860b);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.control-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.3);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.game-info {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  font-size: 1.2rem;
  font-weight: bold;
}

.current-player .red {
  color: #dc143c;
}

.current-player .black {
  color: #2f4f4f;
}

.ai-thinking {
  color: #4CAF50;
  margin-left: 10px;
  animation: thinking 1.5s infinite;
}

@keyframes thinking {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.game-status {
  color: #ff6b35;
  font-size: 1.5rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.chess-board {
  position: relative;
  width: 800px;
  height: 900px;
  background: linear-gradient(45deg, #daa520, #b8860b);
  border: 8px solid #8B4513;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.board-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.chess-pieces {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.chess-piece {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  border: 3px solid;
}

.chess-piece.red {
  background: radial-gradient(circle, #ff6b6b, #dc143c);
  border-color: #8b0000;
  color: white;
}

.chess-piece.black {
  background: radial-gradient(circle, #4a4a4a, #2f4f4f);
  border-color: #000;
  color: white;
}

.chess-piece:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(0,0,0,0.4);
}

.chess-piece.selected {
  transform: scale(1.2);
  box-shadow: 0 0 20px #ffd700;
  border-color: #ffd700;
}

.piece-content {
  font-size: 20px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.move-hints {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.move-hint {
  position: absolute;
  width: 20px;
  height: 20px;
  background: rgba(255, 215, 0, 0.8);
  border-radius: 50%;
  pointer-events: all;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: -10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.move-hint:hover {
  transform: scale(1.5);
  background: rgba(255, 215, 0, 1);
}

@media (max-width: 900px) {
  .chess-board {
    width: 90vw;
    height: calc(90vw * 1.125);
  }
  
  .game-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .game-header h1 {
    font-size: 2rem;
  }
}
</style>