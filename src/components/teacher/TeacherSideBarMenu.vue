<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <div class="app animate__animated animate__fadeInLeft">
    <ul class="menu rounded-box w-56 menu-lg gap-4">
      <li class="">
        <router-link
          to="/t/home"
          :class="{ 'menu-active': route.name === 'teacher-home-components' }"
        >
          <LineMdHomeMdAltTwotone />
          <a href="#">首页</a>
        </router-link>
      </li>
      <li>
        <router-link
          to="/t/ai"
          :class="{ 'menu-active': route.path.startsWith('/t/ai') }"
        >
          <LineMdLightbulbTwotone />
          <a href="#">智识顾问</a>
        </router-link>
      </li>
      <li class="">
        <router-link
          to="/t/course"
          :class="{ 'menu-active': route.name === 'teacher-course-detail' }"
        >
          <LineMdPencilAltTwotone />
          <a href="#">我的课程</a>
        </router-link>
      </li>
      <li class="">
        <router-link
          to="/t/question"
          :class="{ 'menu-active': route.name === 'teacher-question' }"
        >
          <LineMdCheckList3 />
          <a href="#">我的题库</a>
        </router-link>
      </li>
      <li class="">
        <router-link
          to="/t/exam"
          :class="{ 'menu-active': route.name === 'teacher-exam' }"
        >
          <LineMdClipboardCheckTwotone />
          <a href="#">我的试卷</a>
        </router-link>
      </li>
    </ul>
  </div>
</template>
