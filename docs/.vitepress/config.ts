import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "xlm-use",
  description: "sleemon vueuse",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        // collapsed: false,
        text: 'Dict文档',
        items: [
          { text: 'Dict使用', link: '/dict' },
        ],
      },
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/liangbaikaiupup/xlm-use' },
    ],

    search:{
      provider: "local",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright ©Eluuu",
    },
    
  }
})
