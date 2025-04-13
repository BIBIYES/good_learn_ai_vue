import './assets/main.css'
import 'animate.css'
import '@icon-park/vue-next/styles/index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate) // 注册插件
app.use(pinia)

app.use(router)

app.mount('#app')
