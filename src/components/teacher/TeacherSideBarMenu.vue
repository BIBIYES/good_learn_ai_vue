<script setup>
import { useRoute } from 'vue-router'
import { Home } from '@icon-park/vue-next'
const route = useRoute()
</script>

<template>
  <div class="app animate__animated animate__fadeInLeft">
    <ul class="menu rounded-box w-56 menu-lg gap-4">
      <li class="">
        <router-link
          to="/t/home"
          :class="{ 'menu-active': route.name === 'teacher-home-page' }"
        >
          <home
            theme="outline"
            size="24"
          />
          <a href="#">首页</a>
        </router-link>
      </li>
    </ul>
  </div>
</template>
