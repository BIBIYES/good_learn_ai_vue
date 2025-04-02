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
          path: 'my-course',
          name: 'my-course',
          component: () => import('../views/student/page/MyCoursePage.vue'),
        },
        {
          path: 'AI',
          name: 'AI',
          component: () => import('../views/student/page/AIPage.vue'),
        },
      ],
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutMePage.vue'),
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/student/page/TestPage.vue'),
    },
  ],
})
// 前置路由守卫
router.beforeEach((to, from, next) => {
  const store = userStore()
  const isLoggedIn = store.userInfo && store.userInfo.jwtToken

  // 登录相关页面路径
  const authRoutes = ['/login', '/register']

  // 已登录用户访问登录页面时重定向到首页
  if (isLoggedIn && authRoutes.includes(to.path)) {
    next('/')
    return
  }

  // 未登录用户只能访问登录相关页面
  if (!isLoggedIn && !authRoutes.includes(to.path)) {
    next('/login')
    return
  }

  // 正常放行
  next()
})
export default router
