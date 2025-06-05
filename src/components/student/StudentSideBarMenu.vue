<script setup>
import { Home, Lightning, DocumentFolder, School } from '@icon-park/vue-next'
const route = useRoute()
</script>

<template>
  <div class="app animate__animated animate__fadeInLeft">
    <ul class="menu  rounded-box w-56 menu-lg gap-4">
      <li class="">
        <router-link
          to="/s/home"
          :class="{ 'menu-active': route.name === 'student-home-page' }"
        >
          <home
            theme="outline"
            size="24"
          />
          <a
            href="#"
            class=""
          >首页111</a>
        </router-link>
      </li>
      <li>
        <router-link
          to="/s/ai"
          :class="{ 'menu-active': route.path.startsWith('/s/ai') }"
        >
          <lightning
            theme="outline"
            size="24"
          />
          <a href="#">智识顾问</a>
        </router-link>
      </li>
      <li>
        <router-link
          to="/s/my-course"
          :class="{ 'menu-active': route.path.startsWith('/s/my-course') }"
        >
          <school
            theme="outline"
            size="24"
          />
          <a href="#">我的课程</a>
        </router-link>
      </li>
      <li>
        <router-link
          to="/s/my-test-paper"
          :class="{ 'menu-active': route.name === 'student-test-paper' }"
        >
          <document-folder
            theme="outline"
            size="24"
          />
          <a href="#">未设置的按钮</a>
        </router-link>
      </li>
    </ul>
  </div>
</template>
