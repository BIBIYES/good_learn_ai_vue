import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/student/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/student/page/LoginPage.vue'),
      meta: { requiresAuth: false }
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
  // 检查路由是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  const isAuthenticated = localStorage.getItem('user') // 这里假设用户信息存储在 localStorage 中

  if (requiresAuth && !isAuthenticated) {
    // 如果需要认证但用户未登录，重定向到登录页面
    next({ name: 'login' })
  } else if (to.name === 'login' && isAuthenticated) {
    // 如果用户已登录但试图访问登录页面，重定向到首页
    next({ name: 'home-s' })
  } else {
    // 其他情况正常通过
    next()
  }
})

export default router
