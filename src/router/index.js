import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/student/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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

export default router
