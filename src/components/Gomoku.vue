<template>
  <div class="gomoku">
    <div class="game-header">
      <h1>五子棋</h1>
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
        当前玩家: <span :class="currentPlayer">{{ currentPlayer === 'black' ? '黑方' : (isAIMode && currentPlayer === 'white' ? 'AI' : '白方') }}</span>
        <span v-if="isAIThinking" class="ai-thinking">🤔 AI思考中...</span>
      </div>
      <div class="game-status" v-if="gameStatus">{{ gameStatus }}</div>
    </div>

    <div class="board-container">
      <div class="board" @click="handleBoardClick">
        <!-- 棋盘网格线 -->
        <svg class="board-lines" viewBox="0 0 600 600">
          <!-- 横线 -->
          <line v-for="i in 15" :key="`h-${i}`" 
                :x1="20" :y1="20 + (i-1) * 40" 
                :x2="580" :y2="20 + (i-1) * 40" 
                stroke="#8B4513" stroke-width="1"/>
          
          <!-- 竖线 -->
          <line v-for="i in 15" :key="`v-${i}`" 
                :x1="20 + (i-1) * 40" :y1="20" 
                :x2="20 + (i-1) * 40" :y2="580" 
                stroke="#8B4513" stroke-width="1"/>
          
          <!-- 天元和星位 -->
          <circle cx="300" cy="300" r="3" fill="#8B4513"/>
          <circle cx="140" cy="140" r="2" fill="#8B4513"/>
          <circle cx="460" cy="140" r="2" fill="#8B4513"/>
          <circle cx="140" cy="460" r="2" fill="#8B4513"/>
          <circle cx="460" cy="460" r="2" fill="#8B4513"/>
        </svg>
        
        <!-- 棋子 -->
        <div 
          v-for="(row, rowIndex) in board" 
          :key="`row-${rowIndex}`"
          class="board-row"
        >
          <div 
            v-for="(cell, colIndex) in row" 
            :key="`cell-${rowIndex}-${colIndex}`"
            class="board-cell"
            :style="getCellStyle(rowIndex, colIndex)"
            @click.stop="handleCellClick(rowIndex, colIndex)"
          >
            <div 
              v-if="cell" 
              class="piece"
              :class="[cell, { 'winning-piece': isWinningPiece(rowIndex, colIndex) }]"
            >
              <div class="piece-inner"></div>
            </div>
            <div 
              v-if="showHint && isValidMove(rowIndex, colIndex)" 
              class="move-hint"
              :class="currentPlayer"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'

// 游戏状态
const currentPlayer = ref<'black' | 'white'>('black')
const board = ref<(string | null)[][]>(Array(15).fill(null).map(() => Array(15).fill(null)))
const gameStatus = ref<string>('')
const moveHistory = ref<{row: number, col: number, player: string}[]>([])
const winningLine = ref<{row: number, col: number}[]>([])
const showHint = ref<boolean>(true)

// AI相关状态
const isAIMode = ref<boolean>(false)
const aiDifficulty = ref<'easy' | 'medium' | 'hard'>('medium')
const isAIThinking = ref<boolean>(false)

// 重置游戏
const resetGame = () => {
  board.value = Array(15).fill(null).map(() => Array(15).fill(null))
  currentPlayer.value = 'black'
  gameStatus.value = ''
  moveHistory.value = []
  winningLine.value = []
}

// 获取单元格样式
const getCellStyle = (row: number, col: number) => {
  return {
    left: `${20 + col * 40 - 15}px`,
    top: `${20 + row * 40 - 15}px`
  }
}

// 检查是否为有效移动
const isValidMove = (row: number, col: number): boolean => {
  return !board.value[row][col] && !gameStatus.value
}

// 检查是否为获胜棋子
const isWinningPiece = (row: number, col: number): boolean => {
  return winningLine.value.some(pos => pos.row === row && pos.col === col)
}

// 处理单元格点击
const handleCellClick = (row: number, col: number) => {
  if (!isValidMove(row, col)) return
  if (isAIMode.value && currentPlayer.value === 'white') return

  makeMove(row, col, currentPlayer.value)
}

// 处理棋盘点击（用于显示提示）
const handleBoardClick = (event: MouseEvent) => {
  // 这里可以添加额外的棋盘交互逻辑
}

// 执行移动
const makeMove = (row: number, col: number, player: string) => {
  board.value[row][col] = player
  moveHistory.value.push({ row, col, player })
  
  // 检查胜负
  if (checkWin(row, col, player)) {
    gameStatus.value = `${player === 'black' ? '黑方' : (isAIMode.value && player === 'white' ? 'AI' : '白方')}获胜！`
    return
  }
  
  // 检查平局
  if (moveHistory.value.length === 225) {
    gameStatus.value = '平局！'
    return
  }
  
  // 切换玩家
  currentPlayer.value = currentPlayer.value === 'black' ? 'white' : 'black'
}

// 检查胜负
const checkWin = (row: number, col: number, player: string): boolean => {
  const directions = [
    [0, 1],   // 水平
    [1, 0],   // 垂直
    [1, 1],   // 对角线
    [1, -1]   // 反对角线
  ]
  
  for (const [dx, dy] of directions) {
    let count = 1
    const line = [{ row, col }]
    
    // 向一个方向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row + dx * i
      const newCol = col + dy * i
      if (newRow >= 0 && newRow < 15 && newCol >= 0 && newCol < 15 && 
          board.value[newRow][newCol] === player) {
        count++
        line.push({ row: newRow, col: newCol })
      } else {
        break
      }
    }
    
    // 向相反方向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row - dx * i
      const newCol = col - dy * i
      if (newRow >= 0 && newRow < 15 && newCol >= 0 && newCol < 15 && 
          board.value[newRow][newCol] === player) {
        count++
        line.unshift({ row: newRow, col: newCol })
      } else {
        break
      }
    }
    
    if (count >= 5) {
      winningLine.value = line.slice(0, 5)
      return true
    }
  }
  
  return false
}

// 悔棋
const undoMove = () => {
  if (moveHistory.value.length === 0) return
  
  const lastMove = moveHistory.value.pop()!
  board.value[lastMove.row][lastMove.col] = null
  
  // 如果是AI模式，需要撤销两步
  if (isAIMode.value && moveHistory.value.length > 0) {
    const secondLastMove = moveHistory.value.pop()!
    board.value[secondLastMove.row][secondLastMove.col] = null
  }
  
  currentPlayer.value = 'black'
  gameStatus.value = ''
  winningLine.value = []
}

// 计算属性
const canUndo = computed(() => moveHistory.value.length > 0)

// AI相关方法
const handleModeChange = () => {
  resetGame()
}

// 评估位置价值
const evaluatePosition = (row: number, col: number, player: string): number => {
  let score = 0
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]
  
  for (const [dx, dy] of directions) {
    score += evaluateLine(row, col, dx, dy, player)
  }
  
  return score
}

// 评估一条线的价值
const evaluateLine = (row: number, col: number, dx: number, dy: number, player: string): number => {
  let score = 0
  let count = 1
  let blocked = 0
  
  // 向一个方向检查
  for (let i = 1; i < 5; i++) {
    const newRow = row + dx * i
    const newCol = col + dy * i
    if (newRow >= 0 && newRow < 15 && newCol >= 0 && newCol < 15) {
      if (board.value[newRow][newCol] === player) {
        count++
      } else if (board.value[newRow][newCol] !== null) {
        blocked++
        break
      } else {
        break
      }
    } else {
      blocked++
      break
    }
  }
  
  // 向相反方向检查
  for (let i = 1; i < 5; i++) {
    const newRow = row - dx * i
    const newCol = col - dy * i
    if (newRow >= 0 && newRow < 15 && newCol >= 0 && newCol < 15) {
      if (board.value[newRow][newCol] === player) {
        count++
      } else if (board.value[newRow][newCol] !== null) {
        blocked++
        break
      } else {
        break
      }
    } else {
      blocked++
      break
    }
  }
  
  // 根据连子数和阻挡情况计算分数
  if (count >= 5) return 100000
  if (count === 4 && blocked === 0) return 10000
  if (count === 4 && blocked === 1) return 1000
  if (count === 3 && blocked === 0) return 1000
  if (count === 3 && blocked === 1) return 100
  if (count === 2 && blocked === 0) return 100
  if (count === 2 && blocked === 1) return 10
  
  return score
}

// 获取所有可能的移动
const getAllPossibleMoves = (): {row: number, col: number, score: number}[] => {
  const moves: {row: number, col: number, score: number}[] = []
  
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      if (!board.value[row][col]) {
        // 只考虑已有棋子附近的位置
        if (hasNeighbor(row, col)) {
          const score = evaluatePosition(row, col, 'white') - evaluatePosition(row, col, 'black')
          moves.push({ row, col, score })
        }
      }
    }
  }
  
  return moves.sort((a, b) => b.score - a.score)
}

// 检查是否有邻居棋子
const hasNeighbor = (row: number, col: number): boolean => {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue
      const newRow = row + dx
      const newCol = col + dy
      if (newRow >= 0 && newRow < 15 && newCol >= 0 && newCol < 15 && 
          board.value[newRow][newCol]) {
        return true
      }
    }
  }
  return false
}

// AI选择最佳移动
const getAIMove = (): {row: number, col: number} | null => {
  const moves = getAllPossibleMoves()
  if (moves.length === 0) return null
  
  const depth = aiDifficulty.value === 'easy' ? 5 : aiDifficulty.value === 'medium' ? 10 : 15
  const bestMoves = moves.slice(0, depth)
  
  return bestMoves[0] || null
}

// AI执行移动
const executeAIMove = async () => {
  if (!isAIMode.value || currentPlayer.value !== 'white' || gameStatus.value) {
    return
  }
  
  isAIThinking.value = true
  
  // 添加思考延迟
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const aiMove = getAIMove()
  if (aiMove) {
    makeMove(aiMove.row, aiMove.col, 'white')
  }
  
  isAIThinking.value = false
}

// 监听当前玩家变化，触发AI移动
watch(currentPlayer, (newPlayer) => {
  if (isAIMode.value && newPlayer === 'white' && !gameStatus.value) {
    nextTick(() => {
      executeAIMove()
    })
  }
})

onMounted(() => {
  resetGame()
})
</script>

<style scoped>
.gomoku {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f5f5dc 0%, #deb887 100%);
  min-height: 100vh;
  font-family: 'Microsoft YaHei', sans-serif;
}

.game-header {
  text-align: center;
  margin-bottom: 20px;
}

.game-header h1 {
  font-size: 2.5rem;
  color: #8B4513;
  margin-bottom: 20px;
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
  justify-content: center;
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
  justify-content: center;
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

.current-player .black {
  color: #2f2f2f;
}

.current-player .white {
  color: #f5f5f5;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
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

.board-container {
  position: relative;
  background: #daa520;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.3);
}

.board {
  position: relative;
  width: 600px;
  height: 600px;
  background: linear-gradient(45deg, #daa520 0%, #b8860b 100%);
  border-radius: 8px;
  cursor: pointer;
}

.board-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.board-row {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.board-cell {
  position: absolute;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.board-cell:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.piece {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
  animation: placeStone 0.3s ease-out;
}

@keyframes placeStone {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.piece.black {
  background: radial-gradient(circle at 30% 30%, #666, #000);
  border: 1px solid #333;
}

.piece.white {
  background: radial-gradient(circle at 30% 30%, #fff, #ddd);
  border: 1px solid #ccc;
}

.piece.winning-piece {
  animation: winningPulse 1s infinite;
  box-shadow: 0 0 10px #ff6b35;
}

@keyframes winningPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.piece-inner {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: inherit;
  opacity: 0.8;
}

.move-hint {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  opacity: 0.6;
  transition: all 0.2s;
}

.move-hint.black {
  background: #333;
}

.move-hint.white {
  background: #fff;
  border: 1px solid #ccc;
}

.board-cell:hover .move-hint {
  transform: scale(1.5);
  opacity: 0.8;
}
</style>