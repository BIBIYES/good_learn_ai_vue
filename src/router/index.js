import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { userStore } from '@/stores/user'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login-parent',
      component: () => import('../views/LoginPage.vue'),
      meta: { requiresAuth: false },
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('@/components/form/LoginForm.vue'),
        },
        {
          path: '/register',
          name: 'register',
          component: () => import('@/components/form/RegisterForm.vue'),
        },
      ],
    },
    {
      path: '/',
      name: 'home',
      redirect: '/s', // 重定向到 /s
    },
    {
      path: '/s',
      name: 'home-s',
      component: HomeView,
      redirect: '/s/home',
      children: [
        {
          path: 'home',
          name: 'home-page',
          component: () => import('../views/student/page/HomePage.vue'),
        },
        {
          path: 'my-test-paper',
          name: 'my-test-paper',
          component: () => import('../views/student/page/MyTestPaper.vue'),
        },
        {
          path: 'my-class',
          name: 'my-class',
          component: () => import('../views/student/page/MyClassPage.vue'),
        },
        {
          path: 'AI',
          name: 'AI',
          component: () => import('../views/student/page/AIPage.vue'),
        },
      ],
    },
    {
      path: '/abot',
      name: 'abot',
      component: () => import('../views/student/page/AbotMePage.vue'),
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/student/page/TestPage.vue'),
    },
  ],
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const user = userStore()

  // 1. 定义不需要认证的白名单路由
  const allowList = ['login', 'register', 'forgot-password'] // 根据需要添加

  // 4. 已登录用户访问登录页 → 跳首页
  if (to.name === 'login' && user.userInfo.value) {
    return next({ name: 'home-s' })
  }

  // 2. 如果目标路由在白名单中，直接放行
  if (allowList.includes(to.name)) {
    return next() // 注意这里要用 return
  }

  // 3. 检查用户是否认证
  if (!user.userInfo.value) {
    // 未登录且访问的是需要认证的路由 → 跳登录页
    return next({ name: 'login' })
  }

  // 5. 其他情况正常放行
  next()
})
export default router
