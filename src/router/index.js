import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { userStore } from '@/stores/user'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login' // 重定向到 /s
    },
    {
      path: '/login',
      name: 'login-parent',
      component: () => import('../views/LoginPage.vue'),
      meta: { requiresAuth: false },
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('@/components/form/LoginForm.vue')
        },
        {
          path: '/register',
          name: 'register',
          component: () => import('@/components/form/RegisterForm.vue')
        }
      ]
    },
    // 老师路由
    {
      path: '/t',
      name: 'home-t',
      component: HomeView,
      redirect: '/t/home',
      children: [
        {
          path: 'home',
          name: 'home-page-t',
          component: () => import('../views/teacher/page/HomePage.vue')
        }
      ]
    },
    // 学生
    {
      path: '/s',
      name: 'home-s',
      component: HomeView,
      redirect: '/s/home',
      children: [
        {
          path: 'home',
          name: 'home-page-s',
          component: () => import('../views/student/page/HomePage.vue')
        },
        {
          path: 'my-test-paper',
          name: 'my-test-paper',
          component: () => import('../views/student/page/MyTestPaper.vue')
        },
        {
          path: 'my-course',
          name: 'my-course',
          component: () => import('../views/student/page/MyCoursePage.vue')
        },
        {
          path: 'ai',
          component: () => import('../views/student/page/AIPage.vue'),
          children: [
            {
              path: '',
              name: 'AI',
              redirect: '/s/ai/home'
            },
            {
              path: 'home',
              name: 'ai-home',
              component: () => import('@/components/AI/ChatHome.vue')
            },
            {
              path: 'chat/:id',
              name: 'ai-chat',
              component: () => import('@/components/AI/ChatBox.vue')
            }
          ]
        }
      ]
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutMePage.vue')
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/student/page/TestPage.vue')
    }
  ]
})
// 前置路由守卫
router.beforeEach((to, from, next) => {
  const store = userStore()
  const isLoggedIn = store.userInfo && store.userInfo.jwtToken

  // 登录相关页面路径
  const authRoutes = ['/login', '/register']

  // 公开页面
  const openRoutes = ['/about', '/test']
  if (openRoutes.includes(to.path)) {
    next()
    return
  }

  // 已登录用户访问登录页面时重定向到首页
  if (isLoggedIn && authRoutes.includes(to.path)) {
    if (store.userInfo.role === 'teacher') {
      next('/t/home')
    } else {
      next('/s/home')
    }
    return
  }

  // 未登录用户只能访问登录相关页面
  if (!isLoggedIn && !authRoutes.includes(to.path)) {
    next('/login')
    return
  }

  // 角色权限检查
  if (isLoggedIn) {
    const isTeacherPath = to.path.startsWith('/t')
    const isStudentPath = to.path.startsWith('/s')

    if (store.userInfo.role === 'teacher' && !isTeacherPath) {
      next('/t/home')
      return
    }

    if (store.userInfo.role === 'student' && !isStudentPath) {
      next('/s/home')
      return
    }
  }

  // 正常放行
  next()
})
export default router
