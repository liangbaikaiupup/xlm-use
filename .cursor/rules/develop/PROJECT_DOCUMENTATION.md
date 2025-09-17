# xlm-use 项目详细文档

## 项目概述

**xlm-use** 是一个基于 Vue 3 和 TypeScript 的工具库项目，提供了一系列实用的 Vue Composition API hooks、指令和工具函数。项目采用现代化的前端开发技术栈，支持 ESM 模块化，并提供完整的 TypeScript 类型支持。

### 基本信息
- **项目名称**: xlm-use
- **版本**: 0.0.10
- **类型**: Vue 3 工具库
- **构建工具**: Vite
- **文档系统**: VitePress
- **主要依赖**: Vue 3, Element Plus

## 项目结构分析

### 根目录结构
```
xlm-use/
├── .cursor/                 # Cursor IDE 配置
│   └── rules/              # 开发规则配置
├── .github/                # GitHub 工作流
│   └── workflows/
│       └── deploy.yml      # 自动部署配置
├── .vscode/                # VS Code 配置
├── docs/                   # VitePress 文档系统
├── packages/               # 核心功能模块
├── src/                    # 示例应用源码
├── package.json            # 项目配置
├── vite.config.ts          # Vite 构建配置
├── tsconfig.json           # TypeScript 配置
└── README.md               # 项目说明
```

### 核心模块 (packages/)

#### 1. 入口文件 (packages/index.ts)
- 统一导出所有功能模块
- 引入样式文件
- 模块化导出设计

#### 2. Hooks 模块 (packages/hooks/)

##### useTable Hook
**文件**: `packages/hooks/table.ts`

**功能**: 提供完整的表格数据管理解决方案

**核心特性**:
- 数据列表管理
- 分页功能
- 查询条件处理
- 加载状态管理
- 多选功能
- 排序支持
- 样式配置

**主要接口**:
```typescript
interface BasicTableProps {
  createdIsNeed?: boolean;     // 是否自动加载数据
  isPage?: boolean;            // 是否启用分页
  queryForm?: any;             // 查询表单对象
  dataList?: any[];            // 数据列表
  pagination?: Pagination;     // 分页配置
  dataListLoading?: boolean;   // 加载状态
  dataListSelections?: any[];  // 多选数据
  pageList?: (...arg: any) => Promise<any>; // 数据获取方法
  // ... 更多配置项
}
```

**分页配置**:
```typescript
interface Pagination {
  current?: number;    // 当前页码
  size?: number;       // 每页条数
  total?: number;      // 总条数
  pageSizes?: any[];   // 页码选项
  layout?: String;     // 布局配置
}
```

##### usePolling Hook
**文件**: `packages/hooks/polling.ts`

**功能**: 提供智能轮询功能

**核心特性**:
- 自动轮询数据
- 页面可见性检测
- 请求取消机制
- 错误处理
- 加载状态管理

**使用示例**:
```typescript
const { data, loading, error, start, stop } = usePolling(
  (signal) => fetchData(signal),
  5000 // 轮询间隔
)
```

#### 3. 指令模块 (packages/directives/)

##### vWaves 指令
**文件**: `packages/directives/waves.ts`

**功能**: 提供点击波纹效果

**特性**:
- 自定义波纹颜色
- 可配置动画时长
- 自动清理机制
- 响应式设计

**配置选项**:
```typescript
interface WavesOptions {
  color?: string;      // 波纹颜色
  duration?: number;   // 动画时长
}
```

**使用方式**:
```vue
<button v-waves="{ color: 'rgba(0,0,0,0.2)', duration: 800 }">
  点击我
</button>
```

#### 4. 常量模块 (packages/constants/)

**文件**: `packages/constants/index.ts`

**功能**: 提供通用常量定义

**当前常量**:
- `TF`: 是/否选项数组

#### 5. 工具函数 (packages/utils/)

**文件**: `packages/utils/index.ts`

**功能**: 提供通用工具函数

**当前函数**:
- `toUnderline(str: string)`: 驼峰转下划线

#### 6. 样式文件 (packages/style/)

**文件**: `packages/style/vxe-table.css`

**功能**: 提供表格组件样式

### 文档系统 (docs/)

#### VitePress 配置
**文件**: `docs/.vitepress/config.ts`

**特性**:
- 响应式导航
- 侧边栏配置
- 本地搜索
- GitHub 链接
- 自定义主题

**导航结构**:
- Dict文档
- Vue Hooks 文档
- 示例文档

#### 文档内容
- `index.md`: 首页
- `dict.md`: 字典使用文档
- `vue-hooks/table.md`: useTable Hook 文档
- `markdown-examples.md`: Markdown 示例
- `api-examples.md`: API 示例

### 示例应用 (src/)

#### 主要文件
- `main.ts`: 应用入口
- `App.vue`: 主组件，演示 vWaves 指令
- `assets/`: 静态资源

### 构建配置

#### Vite 配置 (vite.config.ts)
**核心特性**:
- Vue 3 支持
- Element Plus 自动导入
- TypeScript 支持
- 库模式构建
- 外部依赖处理

**构建输出**:
- UMD 格式: `dist/xlm-use.umd.js`
- ESM 格式: `dist/xlm-use.es.js`

#### TypeScript 配置
- 项目引用配置
- Element Plus 类型支持
- 严格类型检查

## 技术栈

### 核心依赖
- **Vue 3**: 渐进式 JavaScript 框架
- **Element Plus**: Vue 3 UI 组件库
- **TypeScript**: 静态类型检查

### 开发工具
- **Vite**: 现代化构建工具
- **VitePress**: 静态站点生成器
- **unplugin-auto-import**: 自动导入插件
- **unplugin-vue-components**: 组件自动导入

### 开发环境
- **Node.js 20+**: 运行环境
- **pnpm**: 包管理器
- **Vue TSC**: TypeScript 编译器

## 功能特性

### 1. 表格管理
- 完整的数据表格解决方案
- 分页、排序、筛选
- 多选、加载状态
- 自定义样式支持

### 2. 轮询功能
- 智能轮询机制
- 页面可见性优化
- 自动错误处理
- 资源清理

### 3. UI 交互
- 波纹点击效果
- 自定义动画配置
- 响应式设计

### 4. 工具函数
- 字符串处理
- 常量定义
- 类型支持

## 使用方式

### 安装
```bash
npm install xlm-use
# 或
pnpm add xlm-use
```

### 基本使用
```typescript
import { useTable, vWaves, TF } from 'xlm-use'

// 使用表格 Hook
const tableState = reactive({
  queryForm: {},
  pageList: fetchDataApi
})

const { getDataList, currentChangeHandle } = useTable(tableState)
```

### 指令使用
```vue
<template>
  <button v-waves="{ color: 'rgba(0,0,0,0.2)' }">
    点击按钮
  </button>
</template>
```

## 开发脚本

### 开发环境
```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm preview      # 预览构建结果
```

### 文档系统
```bash
pnpm docs:dev     # 启动文档开发服务器
pnpm docs:build   # 构建文档
pnpm docs:preview # 预览文档
```

### 类型检查
```bash
pnpm type-check   # TypeScript 类型检查
```

## 项目特点

### 1. 现代化技术栈
- Vue 3 Composition API
- TypeScript 全面支持
- Vite 快速构建
- ESM 模块化

### 2. 完整的开发体验
- 自动导入配置
- 类型提示完善
- 热更新支持
- 文档系统集成

### 3. 生产就绪
- 库模式构建
- 外部依赖优化
- Tree-shaking 支持
- 多格式输出

### 4. 可扩展性
- 模块化设计
- 插件化架构
- 配置灵活
- 易于维护

## 版本信息

当前版本: **0.0.10**

该项目处于活跃开发阶段，持续添加新功能和优化现有特性。

## 贡献指南

项目采用标准的 Git 工作流，支持 GitHub Actions 自动部署。开发者可以通过 Pull Request 的方式贡献代码。

## 许可证

项目采用 MIT 许可证，允许自由使用和修改。