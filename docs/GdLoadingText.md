# GdLoadingText 组件

GdLoadingText 是一个带有粒子动画效果的加载文本组件，具有精美的视觉效果和交互体验。

## 功能特点

- 绿色渐变文字带白色描边
- 丰富的粒子动画效果
- 鼠标悬停和点击交互
- 自定义加载文字

## 使用方法

### 基础用法

```vue
<template>
  <GdLoadingText />
</template>

<script setup>
import GdLoadingText from '@/components/common/GdLoadingText.vue'
</script>
```

### 自定义文字

```vue
<template>
  <GdLoadingText text="数据加载中..." />
</template>

<script setup>
import GdLoadingText from '@/components/common/GdLoadingText.vue'
</script>
```

### 自定义颜色

```vue
<template>
  <GdLoadingText color="#66cc8a" />
</template>

<script setup>
import GdLoadingText from '@/components/common/GdLoadingText.vue'
</script>
```

## 属性

| 属性名 | 类型   | 默认值      | 说明                 |
|--------|--------|-------------|---------------------|
| text   | String | 正在加载... | 加载文本内容         |
| color  | String | #66cc8a     | 主色调颜色（绿色系） |

## 交互效果

- **悬停效果**：鼠标悬停在粒子上会使粒子变大并产生轻微的推力效果
- **点击效果**：点击画布任意位置会产生爆炸式的粒子效果

## 注意事项

1. 组件默认高度为 260px，宽度为 100%
2. 组件使用 Canvas 绘制，确保父容器有适当的尺寸
3. 粒子动画会根据容器大小自动调整数量，以保证性能
4. 组件使用了自定义字体 Fusion，确保在项目中已引入该字体

## 实现细节

该组件使用 Canvas 实现了流畅的动画效果：
- 带有重力效果的形状落到文字上并反弹
- 反弹时产生粒子爆炸效果
- 粒子具有物理特性，包括重力、旋转、透明度变化等
- 文字使用绿色渐变填充，带有白色描边和光晕效果

## 示例

![GdLoadingText 效果示例](../assets/images/gdloadingtext-demo.png) 