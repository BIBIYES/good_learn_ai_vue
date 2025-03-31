<script setup>
import { useRoute } from 'vue-router'
import { Home, Lightning, DocumentFolder, School } from '@icon-park/vue-next'
const route = useRoute()
</script>

<template>
  <div class="app animate__animated animate__fadeInLeft">
    <ul class="menu rounded-box w-56 menu-lg gap-4">
      <li class="">
        <router-link
          to="/s/home"
          :class="{ 'menu-active': route.name === 'home-page' }"
        >
          <home theme="outline" size="24" />
          <a href="#">首页</a>
        </router-link>
      </li>
      <li>
        <router-link to="/s/ai" :class="{ 'menu-active': route.name === 'AI' }">
          <lightning theme="outline" size="24" />
          <a href="#">智识顾问</a>
        </router-link>
      </li>
      <li>
        <router-link
          to="/s/my-class"
          :class="{ 'menu-active': route.name === 'my-class' }"
        >
          <school theme="outline" size="24" />
          <a href="#">我的班级</a>
        </router-link>
      </li>
      <li>
        <router-link
          to="/s/my-test-paper"
          :class="{ 'menu-active': route.name === 'my-test-paper' }"
        >
          <document-folder theme="outline" size="24" />
          <a href="#">我的试卷</a>
        </router-link>
      </li>
    </ul>
  </div>
</template>
