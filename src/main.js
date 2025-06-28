import '@/styles/main.css'
import '@/styles/element-plus.scss'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
// 引入animate.css动画库
import 'animate.css'
const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate) // 注册插件
app.use(pinia)

app.use(router)

app.mount('#app')
