# 工具函数

xlm-use 提供了一系列实用的工具函数，帮助你处理常见的数据转换和操作。

## 函数列表

### toUnderline

将驼峰命名转换为下划线命名。

#### 语法

```typescript
toUnderline(str: string): string
```

#### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `str` | `string` | 需要转换的驼峰命名字符串 |

#### 返回值

返回转换后的下划线命名字符串。

#### 示例

```typescript
import { toUnderline } from 'xlm-use'

// 基础用法
toUnderline('userName')     // 'user_name'
toUnderline('firstName')    // 'first_name'
toUnderline('getUserInfo')  // 'get_user_info'

// 处理连续大写字母
toUnderline('XMLParser')    // 'x_m_l_parser'
toUnderline('HTTPRequest')  // 'h_t_t_p_request'

// 已经是下划线命名的字符串
toUnderline('user_name')    // 'user_name'
toUnderline('first_name')   // 'first_name'
```

#### 使用场景

1. **API 字段转换**：前端使用驼峰命名，后端使用下划线命名时的字段转换
2. **数据库字段映射**：将 JavaScript 对象属性名转换为数据库字段名
3. **配置文件生成**：生成符合特定命名规范的配置项

#### 完整示例

```vue
<template>
  <div>
    <h3>用户信息</h3>
    <form @submit="handleSubmit">
      <input v-model="userForm.firstName" placeholder="名字" />
      <input v-model="userForm.lastName" placeholder="姓氏" />
      <input v-model="userForm.emailAddress" placeholder="邮箱" />
      <button type="submit">提交</button>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { toUnderline } from 'xlm-use'

const userForm = reactive({
  firstName: '',
  lastName: '',
  emailAddress: ''
})

const handleSubmit = () => {
  // 将前端的驼峰命名转换为后端需要的下划线命名
  const apiData = {}
  
  Object.keys(userForm).forEach(key => {
    const underlineKey = toUnderline(key)
    apiData[underlineKey] = userForm[key]
  })
  
  console.log('转换前:', userForm)
  // { firstName: 'John', lastName: 'Doe', emailAddress: 'john@example.com' }
  
  console.log('转换后:', apiData)
  // { first_name: 'John', last_name: 'Doe', email_address: 'john@example.com' }
  
  // 发送到后端 API
  submitUserData(apiData)
}

const submitUserData = async (data) => {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    
    if (response.ok) {
      console.log('用户数据提交成功')
    }
  } catch (error) {
    console.error('提交失败:', error)
  }
}
</script>
```

#### 批量转换工具函数

基于 `toUnderline`，你可以创建批量转换的工具函数：

```typescript
import { toUnderline } from 'xlm-use'

/**
 * 将对象的所有键名从驼峰命名转换为下划线命名
 */
export function convertKeysToUnderline<T extends Record<string, any>>(
  obj: T
): Record<string, any> {
  const result: Record<string, any> = {}
  
  Object.keys(obj).forEach(key => {
    const underlineKey = toUnderline(key)
    result[underlineKey] = obj[key]
  })
  
  return result
}

/**
 * 递归转换嵌套对象的键名
 */
export function deepConvertKeysToUnderline(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => deepConvertKeysToUnderline(item))
  }
  
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, any> = {}
    
    Object.keys(obj).forEach(key => {
      const underlineKey = toUnderline(key)
      result[underlineKey] = deepConvertKeysToUnderline(obj[key])
    })
    
    return result
  }
  
  return obj
}

// 使用示例
const userData = {
  firstName: 'John',
  lastName: 'Doe',
  contactInfo: {
    emailAddress: 'john@example.com',
    phoneNumber: '123-456-7890'
  },
  hobbies: ['reading', 'swimming']
}

const converted = deepConvertKeysToUnderline(userData)
console.log(converted)
// {
//   first_name: 'John',
//   last_name: 'Doe',
//   contact_info: {
//     email_address: 'john@example.com',
//     phone_number: '123-456-7890'
//   },
//   hobbies: ['reading', 'swimming']
// }
```

## 按需引入

```typescript
// 只引入需要的工具函数
import { toUnderline } from 'xlm-use/utils'
```

## TypeScript 支持

所有工具函数都提供完整的 TypeScript 类型定义：

```typescript
declare function toUnderline(str: string): string
```