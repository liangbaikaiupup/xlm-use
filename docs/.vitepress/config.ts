import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "xlm-use",
  description: "基于 Vue 3 + TypeScript 的现代化工具库",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/getting-started' },
      { text: '指令', link: '/directives/' },
      { text: 'Hooks', link: '/hooks/' },
      { text: '工具函数', link: '/utils/' },
      { text: '演示', link: '/demo' }
    ],

    sidebar: [
      {
        text: '指南',
        items: [
          { text: '快速开始', link: '/getting-started' },
          { text: 'API 示例', link: '/api-examples' }
        ]
      },
      {
        text: '自定义指令',
        items: [
          { text: '指令概览', link: '/directives/' },
          { text: 'v-waves 水波纹', link: '/directives/waves' },
          { text: 'v-debounce 防抖', link: '/directives/debounce' }
        ]
      },
      {
        text: '组合式函数',
        items: [
          { text: 'Hooks 概览', link: '/hooks/' },
          { text: 'useTable 表格', link: '/hooks/table' },
          { text: 'usePolling 轮询', link: '/hooks/polling' }
        ]
      },
      {
        text: '工具函数',
        items: [
          { text: '工具概览', link: '/utils/' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
    search: {
      provider: 'local'
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 xlm-use'
    }
  },
  base: '/xlm-use/'
})
