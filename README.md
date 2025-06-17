# test

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## 自定义库使用说明

### FloatingSquaresBg 背景动画库

FloatingSquaresBg是一个轻量级的背景动画库，用于创建悬浮方块的动态背景效果。

#### 基本用法

1. 确保`FloatingSquaresBg.js`文件已放置在public目录下

2. 在组件中加载并使用：

```javascript
// 创建script标签动态加载库
const bgScript = document.createElement('script')
bgScript.src = '/FloatingSquaresBg.js'
bgScript.onload = () => {
  if (window.Color4Bg) {
    const colorBg = new window.Color4Bg.FloatingSquaresBg({
      dom: 'your-container-id', // 背景容器的ID
      colors: [                 // 方块颜色数组
        '#ffffff',
        '#66cc8a',
        '#79be92',
        '#cedbde',
      ],
      loop: true,              // 是否循环播放动画
    })
  }
}
document.head.appendChild(bgScript)

// 在组件卸载时清理资源
onUnmounted(() => {
  // 清理背景实例
  if (colorBg && typeof colorBg.destroy === 'function') {
    colorBg.destroy()
  }
  
  // 移除脚本标签
  if (bgScript && bgScript.parentNode) {
    bgScript.parentNode.removeChild(bgScript)
  }
})
```

3. 确保容器元素具有相对定位（库会自动检查并设置）：

```html
<div id="your-container-id" class="w-full h-full"></div>
```

#### 配置选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| dom | string \| HTMLElement | document.body | 背景容器ID或DOM元素 |
| colors | string[] | ['#ffffff', '#66cc8a', '#79be92', '#cedbde'] | 方块颜色数组 |
| loop | boolean | true | 是否循环播放动画 |
| parallaxFactor | number | 0.1 | 视差效果因子 |

#### 方法

- `destroy()`: 销毁背景实例，清理资源
