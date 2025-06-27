**任务：** 将项目中所有的 `@icon-park/vue-next` 图标替换为 Material Design Icons (Line)。

**计划步骤：**

1.  **分析与准备:**
    *   首先，检查 `vite.config.js` 文件，确认 `unplugin-icons` 插件的配置情况。
    *   接着，在整个 `src` 目录下搜索 `@icon-park/vue-next` 的使用实例，以找出所有需要修改的文件和组件。

2.  **执行重构:**
    *   从 `package.json` 中移除 `@icon-park/vue-next` 依赖，并更新 `vite.config.js` 的 `unplugin-icons` 配置。
    *   逐一修改所有使用了旧图标的文件，用合适的 Material Line Icons 替换。

3.  **清理与验证:**
    *   执行 `npm install` 来更新 `package-lock.json` 文件。
    *   建议用户启动项目，在界面上直观地检查所有图标是否都已正确替换。