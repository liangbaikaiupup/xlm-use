# xlm-use 项目开发规则

## 目录
- [代码规范](#代码规范)
- [项目结构规范](#项目结构规范)
- [Git 工作流规范](#git-工作流规范)
- [文档规范](#文档规范)
- [测试规范](#测试规范)
- [发布规范](#发布规范)
- [代码审查规范](#代码审查规范)

## 代码规范

### TypeScript 规范

#### 1. 类型定义
```typescript
// ✅ 推荐：明确的接口定义
interface UserInfo {
  id: number;
  name: string;
  email?: string;
}

// ❌ 避免：使用 any 类型
const userData: any = {};

// ✅ 推荐：使用泛型
function createResponse<T>(data: T): ApiResponse<T> {
  return { code: 200, data };
}
```

#### 2. 函数定义
```typescript
// ✅ 推荐：明确的参数和返回值类型
function processData(input: string[]): Promise<ProcessedData[]> {
  // 实现逻辑
}

// ✅ 推荐：使用箭头函数（简单逻辑）
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
```

#### 3. 导入导出规范
```typescript
// ✅ 推荐：命名导出
export { useTable, usePolling };
export type { BasicTableProps, Pagination };

// ✅ 推荐：统一的导入方式
import { ref, reactive, onMounted } from 'vue';
import type { Ref } from 'vue';
```

### Vue 组件规范

#### 1. Composition API 使用
```vue
<script setup lang="ts">
// ✅ 推荐：使用 Composition API
import { ref, reactive, computed, onMounted } from 'vue';

// 响应式数据
const count = ref(0);
const state = reactive({
  loading: false,
  data: []
});

// 计算属性
const doubleCount = computed(() => count.value * 2);

// 生命周期
onMounted(() => {
  // 初始化逻辑
});
</script>
```

#### 2. 模板规范
```vue
<template>
  <!-- ✅ 推荐：使用 kebab-case 属性名 -->
  <el-button 
    :loading="state.loading"
    @click="handleClick"
  >
    {{ buttonText }}
  </el-button>
  
  <!-- ✅ 推荐：条件渲染使用 v-if/v-show -->
  <div v-if="showContent" class="content">
    内容区域
  </div>
</template>
```

#### 3. 样式规范
```vue
<style scoped>
/* ✅ 推荐：使用 scoped 样式 */
.component-wrapper {
  padding: 16px;
  border-radius: 4px;
}

/* ✅ 推荐：使用 CSS 变量 */
.button {
  background-color: var(--primary-color, #409eff);
  transition: all 0.3s ease;
}

/* ✅ 推荐：响应式设计 */
@media (max-width: 768px) {
  .component-wrapper {
    padding: 8px;
  }
}
</style>
```

### 命名规范

#### 1. 文件命名
- **组件文件**: PascalCase (如 `UserProfile.vue`)
- **工具文件**: camelCase (如 `dateUtils.ts`)
- **常量文件**: camelCase (如 `apiConstants.ts`)
- **类型文件**: camelCase (如 `userTypes.ts`)

#### 2. 变量命名
```typescript
// ✅ 推荐：描述性命名
const userAccountBalance = ref(0);
const isDataLoading = ref(false);
const fetchUserProfile = async () => {};

// ❌ 避免：缩写和不明确的命名
const bal = ref(0);
const loading = ref(false);
const getData = async () => {};
```

#### 3. 常量命名
```typescript
// ✅ 推荐：大写字母 + 下划线
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;
const DEFAULT_PAGE_SIZE = 10;
```

## 项目结构规范

### 目录组织
```
packages/
├── hooks/              # Composition API hooks
│   ├── index.ts       # 统一导出
│   ├── useTable.ts    # 表格相关 hook
│   └── usePolling.ts  # 轮询相关 hook
├── directives/         # Vue 指令
│   ├── index.ts       # 统一导出
│   └── waves.ts       # 波纹效果指令
├── utils/             # 工具函数
│   ├── index.ts       # 统一导出
│   ├── string.ts      # 字符串工具
│   └── date.ts        # 日期工具
├── constants/         # 常量定义
│   ├── index.ts       # 统一导出
│   └── api.ts         # API 相关常量
├── types/             # 类型定义
│   ├── index.ts       # 统一导出
│   ├── api.ts         # API 类型
│   └── common.ts      # 通用类型
└── style/             # 样式文件
    └── index.css      # 主样式文件
```

### 模块导出规范
```typescript
// packages/index.ts - 主入口文件
export * from './hooks';
export * from './directives';
export * from './utils';
export * from './constants';
export * from './types';

// 各子模块的 index.ts
export { useTable } from './useTable';
export { usePolling } from './usePolling';
export type { BasicTableProps, Pagination } from './useTable';
```

## Git 工作流规范

### 分支管理
- **main**: 主分支，保持稳定
- **develop**: 开发分支，集成新功能
- **feature/xxx**: 功能分支
- **fix/xxx**: 修复分支
- **release/xxx**: 发布分支

### 提交信息规范
```bash
# 格式：<type>(<scope>): <description>

# 类型说明：
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动

# 示例：
feat(hooks): add usePolling hook for data polling
fix(table): resolve pagination issue in useTable
docs(readme): update installation instructions
style(components): format code with prettier
```

### Pull Request 规范
1. **标题**: 简洁描述变更内容
2. **描述**: 详细说明变更原因和影响
3. **检查清单**:
   - [ ] 代码符合规范
   - [ ] 添加了必要的测试
   - [ ] 更新了相关文档
   - [ ] 通过了所有测试

## 文档规范

### API 文档
```typescript
/**
 * 表格数据管理 Hook
 * @param options 表格配置选项
 * @returns 表格管理方法和状态
 * 
 * @example
 * ```typescript
 * const tableState = reactive({
 *   queryForm: {},
 *   pageList: fetchDataApi
 * });
 * 
 * const { getDataList, currentChangeHandle } = useTable(tableState);
 * ```
 */
export function useTable(options?: BasicTableProps) {
  // 实现逻辑
}
```

### README 文档结构
1. 项目简介
2. 安装说明
3. 快速开始
4. API 文档
5. 示例代码
6. 贡献指南
7. 更新日志

### VitePress 文档规范
```markdown
# 页面标题

## 概述
简要介绍功能特性

## 安装
\`\`\`bash
npm install xlm-use
\`\`\`

## 基本用法
\`\`\`typescript
import { useTable } from 'xlm-use';
\`\`\`

## API 参考
### 参数
| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|

### 返回值
| 属性名 | 类型 | 说明 |
|--------|------|------|
```

## 测试规范

### 单元测试
```typescript
// tests/hooks/useTable.test.ts
import { describe, it, expect } from 'vitest';
import { useTable } from '../../packages/hooks/useTable';

describe('useTable', () => {
  it('should initialize with default options', () => {
    const { pagination } = useTable();
    expect(pagination.current).toBe(1);
    expect(pagination.size).toBe(10);
  });
  
  it('should handle page change correctly', async () => {
    const mockPageList = vi.fn().mockResolvedValue({ data: [], total: 0 });
    const { currentChangeHandle } = useTable({ pageList: mockPageList });
    
    await currentChangeHandle(2);
    expect(mockPageList).toHaveBeenCalledWith(expect.objectContaining({
      current: 2
    }));
  });
});
```

### 测试覆盖率要求
- 核心功能: 90% 以上
- 工具函数: 95% 以上
- 组件: 80% 以上

## 发布规范

### 版本号规范
遵循 [Semantic Versioning](https://semver.org/):
- **MAJOR**: 不兼容的 API 修改
- **MINOR**: 向下兼容的功能性新增
- **PATCH**: 向下兼容的问题修正

### 发布流程
1. 更新版本号
2. 更新 CHANGELOG.md
3. 创建 release 分支
4. 代码审查
5. 合并到 main 分支
6. 创建 Git tag
7. 发布到 npm
8. 部署文档

### 发布检查清单
- [ ] 所有测试通过
- [ ] 文档已更新
- [ ] 版本号正确
- [ ] CHANGELOG 已更新
- [ ] 构建产物正常

## 代码审查规范

### 审查要点
1. **功能正确性**: 代码是否实现了预期功能
2. **代码质量**: 是否符合编码规范
3. **性能考虑**: 是否存在性能问题
4. **安全性**: 是否存在安全隐患
5. **可维护性**: 代码是否易于理解和维护
6. **测试覆盖**: 是否有足够的测试

### 审查流程
1. 自动化检查（ESLint, TypeScript, 测试）
2. 人工代码审查
3. 功能测试
4. 性能测试（如需要）
5. 批准合并

## 工具配置

### ESLint 配置
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    '@vue/typescript/recommended',
    'plugin:vue/vue3-recommended'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    'vue/multi-word-component-names': 'off'
  }
};
```

### Prettier 配置
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
```

### Husky 配置
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,vue}": ["eslint --fix", "prettier --write"]
  }
}
```

## 性能优化规范

### 1. 代码分割
```typescript
// 动态导入
const LazyComponent = defineAsyncComponent(() => import('./LazyComponent.vue'));

// 路由懒加载
const routes = [
  {
    path: '/user',
    component: () => import('./views/User.vue')
  }
];
```

### 2. Tree Shaking
```typescript
// ✅ 推荐：具名导入
import { useTable, usePolling } from 'xlm-use';

// ❌ 避免：默认导入整个库
import * as XlmUse from 'xlm-use';
```

### 3. 内存管理
```typescript
// ✅ 推荐：及时清理定时器和监听器
onUnmounted(() => {
  clearInterval(timer);
  window.removeEventListener('resize', handleResize);
});
```

## 安全规范

### 1. 输入验证
```typescript
// ✅ 推荐：验证用户输入
function processUserInput(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input');
  }
  return input.trim();
}
```

### 2. XSS 防护
```vue
<!-- ✅ 推荐：使用文本插值 -->
<div>{{ userContent }}</div>

<!-- ❌ 避免：直接插入 HTML -->
<div v-html="userContent"></div>
```

### 3. 敏感信息处理
```typescript
// ❌ 避免：在代码中硬编码敏感信息
const API_KEY = 'sk-1234567890abcdef';

// ✅ 推荐：使用环境变量
const API_KEY = import.meta.env.VITE_API_KEY;
```

## 总结

本规范文档旨在确保 xlm-use 项目的代码质量、可维护性和团队协作效率。所有开发者都应该遵循这些规范，并在代码审查过程中严格执行。

规范会根据项目发展和技术演进持续更新，请定期查看最新版本。

---

**最后更新**: 2024年1月
**版本**: 1.0.0
**维护者**: xlm-use 开发团队