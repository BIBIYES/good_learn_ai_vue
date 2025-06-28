import { createRouter, createWebHistory } from 'vue-router'
import LayoutView from '../views/layouts/LayoutView.vue'
import { useUserStore } from '@/stores/userStores.js'
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
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/TestView.vue'),
    },
    {
      path: '/login',
      name: 'login-parent', // 保持这个特殊命名，因为是父路由
      component: () => import('../views/LoginView.vue'),
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
      component: LayoutView,
      redirect: '/t/home',
      children: [
        {
          path: 'home',
          name: 'teacher-home-components',
          component: () => import('@/views/teacher/home/HomeView.vue'),
        },
        {
          path: 'course',
          name: 'teacher-course-detail',
          component: () => import('@/views/teacher/course/CourseView.vue'),
        },
        {
          path: 'course/:courseId',
          name: 'teacher-course-detail-detail',
          component: () =>
            import('@/views/teacher/course-detail/CourseDetailView.vue'),
        },
        {
          path: 'ai',
          component: () => import('../views/student/ai/AIPage.vue'),
          children: [
            {
              path: '',
              name: 'teacher-ai-parent', // 修改为特定于老师的命名
              redirect: '/t/ai/home',
            },
            {
              path: 'home',
              name: 'teacher-ai-chat-home', // 修改为特定于老师的命名
              component: () => import('@/components/ai/ChatHome.vue'),
            },
            {
              path: 'chat/:id',
              name: 'teacher-ai-chat-session', // 修改为特定于老师的命名
              component: () => import('@/components/ai/ChatBox.vue'),
            },
          ],
        },

        {
          path: 'question',
          name: 'teacher-question',
          component: () => import('@/views/teacher/question/QuestionView.vue'),
        },
        {
          path: 'question/:bankId',
          name: 'QuestionBankDetail',
          component: () =>
            import(
              '@/views/teacher/question-bank-detail/QuestionBankDetail.vue'
            ),
        },
        {
          path: 'exam',
          name: 'teacher-exam',
          component: () => import('@/views/teacher/exam/ExamView.vue'),
        },
        {
          path: 'exam/:examId',
          name: 'teacher-exam-detail',
          component: () =>
            import('@/views/teacher/exam-detail/ExamDetailView.vue'),
        },
      ],
    },
    // 学生
    {
      path: '/s',
      name: 'student-home',
      component: LayoutView,
      redirect: '/s/home',
      children: [
        {
          path: 'home',
          name: 'student-home-components',
          component: () => import('@/views/student/home/HomeView.vue'),
        },
        {
          path: 'course',
          name: 'student-course-detail-list',
          component: () => import('../views/student/course/CourseView.vue'),
        },
        {
          path: 'my-course-detail/:courseId',
          name: 'student-course-detail-detail',
          component: () =>
            import('@/views/student/course-detail/CourseView.vue'),
          redirect: to => {
            return `/s/my-course/${to.params.courseId}/sign-in`
          },
          children: [
            {
              path: 'sign-in',
              name: 'student-course-detail-signin',
              component: () =>
                import(
                  '@/views/student/course-detail/components/CourseSignInView.vue'
                ),
            },
            {
              path: 'work',
              name: 'student-course-detail-work',
              component: () =>
                import(
                  '@/views/student/course-detail/components/CourseWorkView.vue'
                ),
            },
          ],
        },
        {
          path: 'ai',
          component: () => import('../views/student/ai/AIPage.vue'),
          children: [
            {
              path: '',
              name: 'student-ai-parent', // 修改为特定于学生的命名
              redirect: '/s/ai/home',
            },
            {
              path: 'home',
              name: 'student-ai-chat-home', // 修改为特定于学生的命名
              component: () => import('@/components/ai/ChatHome.vue'),
            },
            {
              path: 'chat/:id',
              name: 'student-ai-chat-session', // 修改为特定于学生的命名
              component: () => import('@/components/ai/ChatBox.vue'),
            },
          ],
        },
      ],
    },
    {
      path: '/about',
      name: 'about-components',
      component: () => import('../views/AboutMeView.vue'),
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
      next({ name: 'teacher-home-components' })
    } else {
      next({ name: 'student-home-components' })
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
      next({ name: 'teacher-home-components' })
      return
    }

    if (
      store.userInfo.role === 'student' &&
      !isStudentPath &&
      to.path !== '/profile'
    ) {
      next({ name: 'student-home-components' })
      return
    }
  }

  // 正常放行
  next()
})
export default router
