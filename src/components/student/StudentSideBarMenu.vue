<script setup>
const route = useRoute()
</script>

<template>
  <div class="app animate__animated animate__fadeInLeft">
    <ul class="menu rounded-box w-56 menu-lg gap-4">
      <li class="">
        <router-link
          to="/s/home"
          :class="{ 'menu-active': route.name === 'student-home-components' }"
        >
          <LineMdHomeMdAltTwotone />
          <a href="#" class="">首页</a>
        </router-link>
      </li>
      <li>
        <router-link
          to="/s/ai"
          :class="{ 'menu-active': route.path.startsWith('/s/ai') }"
        >
          <LineMdLightbulbTwotone />
          <a href="#">智识顾问</a>
        </router-link>
      </li>
      <li>
        <router-link
          to="/s/course"
          :class="{
            'menu-active': route.path.startsWith('/s/course'),
          }"
        >
          <LineMdPencilAltTwotone />
          <a href="#">我的课程</a>
        </router-link>
      </li>
    </ul>
  </div>
</template>
