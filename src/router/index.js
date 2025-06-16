import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/layouts/layoutView.vue'
import { useUserStore } from '@/stores/user'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login', // 重定向到 /s
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfilePage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/TestPage.vue'),
    },
    {
      path: '/login',
      name: 'login-parent', // 保持这个特殊命名，因为是父路由
      component: () => import('../views/LoginPage.vue'),
      meta: { requiresAuth: false },
      children: [
        {
          path: '',
          name: 'login', // 保持这个基础命名
          component: () => import('@/components/form/LoginForm.vue'),
        },
        {
          path: '/register',
          name: 'register', // 保持这个基础命名
          component: () => import('@/components/form/RegisterForm.vue'),
        },
        {
          path: '/forgot-password',
          name: 'forgot-password',
          component: () => import('@/components/form/ForgotPasswordForm.vue'),
        },
      ],
    },
    // 老师路由
    {
      path: '/t',
      name: 'teacher-home',
      component: HomeView,
      redirect: '/t/home',
      children: [
        {
          path: 'home',
          name: 'teacher-home-page',
          component: () => import('@/views/teacher/HomePage.vue'),
        },
        {
          path: 'course',
          name: 'teacher-course',
          component: () => import('@/views/teacher/CourseView.vue'),
        },
        {
          path: 'course/:courseId',
          name: 'teacher-course-detail',
          component: () =>
            import('@/views/teacher/CourseDetailView/CourseDetailView.vue'),
        },
        {
          path: 'ai',
          component: () => import('../views/student/AIPage.vue'),
          children: [
            {
              path: '',
              name: 'teacher-ai-parent', // 修改为特定于老师的命名
              redirect: '/t/ai/home',
            },
            {
              path: 'home',
              name: 'teacher-ai-chat-home', // 修改为特定于老师的命名
              component: () => import('@/components/AI/ChatHome.vue'),
            },
            {
              path: 'chat/:id',
              name: 'teacher-ai-chat-session', // 修改为特定于老师的命名
              component: () => import('@/components/AI/ChatBox.vue'),
            },
          ],
        },

        {
          path: 'question',
          name: 'teacher-question',
          component: () => import('@/views/teacher/QuestionView.vue'),
        },
        {
          path: 'question/:bankId',
          name: 'QuestionBankDetail',
          component: () => import('@/views/teacher/QuestionBankDetail.vue'),
        },
        {
          path: 'exam',
          name: 'teacher-exam',
          component: () => import('@/views/teacher/ExamView.vue'),
        },
      ],
    },
    // 学生
    {
      path: '/s',
      name: 'student-home',
      component: HomeView,
      redirect: '/s/home',
      children: [
        {
          path: 'home',
          name: 'student-home-page',
          component: () => import('../views/student/HomePage.vue'),
        },
        {
          path: 'my-test-paper',
          name: 'student-test-paper',
          component: () => import('../views/student/MyTestPaper.vue'),
        },
        {
          path: 'my-course',
          name: 'student-course-list',
          component: () => import('../views/student/MyCoursePage.vue'),
        },
        {
          path: 'my-course/:courseId',
          name: 'student-course-detail',
          component: () => import('../views/student/Course/CourseView.vue'),
          redirect: to => {
            return `/s/my-course/${to.params.courseId}/sign-in`
          },
          children: [
            {
              path: 'sign-in',
              name: 'student-course-signin',
              component: () =>
                import('../views/student/Course/page/CourseSignInView.vue'),
            },
            {
              path: 'work',
              name: 'student-course-work',
              component: () =>
                import('../views/student/Course/page/CourseWorkView.vue'),
            },
          ],
        },
        {
          path: 'ai',
          component: () => import('../views/student/AIPage.vue'),
          children: [
            {
              path: '',
              name: 'student-ai-parent', // 修改为特定于学生的命名
              redirect: '/s/ai/home',
            },
            {
              path: 'home',
              name: 'student-ai-chat-home', // 修改为特定于学生的命名
              component: () => import('@/components/AI/ChatHome.vue'),
            },
            {
              path: 'chat/:id',
              name: 'student-ai-chat-session', // 修改为特定于学生的命名
              component: () => import('@/components/AI/ChatBox.vue'),
            },
          ],
        },
      ],
    },
    {
      path: '/about',
      name: 'about-page',
      component: () => import('../views/AboutMePage.vue'),
    },
    {
      path: '/test',
      name: 'test-page',
      component: () => import('../views/student/TestPage.vue'),
    },
  ],
})
// 前置路由守卫
router.beforeEach((to, from, next) => {
  const store = useUserStore()
  const isLoggedIn = store.userInfo && store.userInfo.jwtToken

  // 登录相关页面路径
  const authRoutes = ['/login', '/register', '/forgot-password']

  // 公开页面
  const openRoutes = ['/about', '/test']
  if (openRoutes.includes(to.path)) {
    next()
    return
  }

  // 已登录用户访问登录页面时重定向到首页
  if (isLoggedIn && authRoutes.includes(to.path)) {
    if (store.userInfo.role === 'teacher') {
      next({ name: 'teacher-home-page' })
    } else {
      next({ name: 'student-home-page' })
    }
    return
  }

  // 未登录用户只能访问登录相关页面
  if (!isLoggedIn && !authRoutes.includes(to.path)) {
    next('/login')
    return
  }

  // 允许访问个人资料页面
  if (isLoggedIn && to.path === '/profile') {
    next()
    return
  }

  // 角色权限检查
  if (isLoggedIn) {
    const isTeacherPath = to.path.startsWith('/t')
    const isStudentPath = to.path.startsWith('/s')

    if (
      store.userInfo.role === 'teacher' &&
      !isTeacherPath &&
      to.path !== '/profile'
    ) {
      next({ name: 'teacher-home-page' })
      return
    }

    if (
      store.userInfo.role === 'student' &&
      !isStudentPath &&
      to.path !== '/profile'
    ) {
      next({ name: 'student-home-page' })
      return
    }
  }

  // 正常放行
  next()
})
export default router
