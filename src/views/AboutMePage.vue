<script setup>
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { getEmailAvatarPath } from '@/utils/avatarPath'
gsap.registerPlugin(ScrollTrigger)

const router = useRouter()

const isLoading = ref(true)

// 切换loading状态
const toggleLoading = () => {
  isLoading.value = false
}

const developmentTeam = ref(null)

const scrollToBottom = () => {
  console.log('滚动到底部')
  console.log(developmentTeam.value)

  if (developmentTeam.value) {
    developmentTeam.value.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}

onMounted(() => {
  isLoading.value = true
  window.addEventListener('load', () => {
    console.log('所有资源加载完成')
    toggleLoading()
  })
  setInterval(() => {
    toggleLoading()
  }, 1000)
  // 加载动画
  animation()
})

const formData = ref({
  name: '',
  email: '',
  phone: '',
  class: '',
  mbti: '',
  intro: '',
})

const errors = ref({})
const isSubmitting = ref(false)

const validateField = (field, value) => {
  const validations = {
    name: value.trim().length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    phone: /^\+?\d{7,15}$/.test(value),
    class: value.trim().length >= 5,
    mbti: /^[A-Z]{4}$/.test(value),
    intro: value.trim().length >= 20,
  }

  errors.value[field] = !validations[field]
  return validations[field]
}

const handleSubmit = async () => {
  isSubmitting.value = true

  // 验证所有字段
  const isValid = Object.entries(formData.value).every(([key, value]) => {
    return validateField(key, value)
  })

  if (!isValid) {
    isSubmitting.value = false
    return
  }

  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 重置表单
    formData.value = {
      name: '',
      email: '',
      phone: '',
      class: '',
      mbti: '',
      intro: '',
    }
    errors.value = {}
  } finally {
    isSubmitting.value = false
  }
}

// 团队成员数据
const teamMembers = [
  {
    name: '骆子豪',
    role: '前端架构',
    intro:
      '负责前端架构整体开发，精通Vue前端框架，拥有丰富的大型应用开发经验。',
    skills: ['Vue', 'JavaScript', 'TypeScript', 'Flushbonading'],
    github: 'https://github.com/BIBIYES',
    email: '3203727672@qq.com',
    avatar: getEmailAvatarPath('3203727672@qq.com'),
  },
  {
    name: '李豪',
    role: '数据算法',
    intro:
      '负责系统数据分析与算法优化，专注于机器学习和数据可视化，具备扎实的数学功底。',
    skills: ['Python', 'TensorFlow', 'Data Analysis', 'Machine Learning'],
    github: 'https://github.com/LeastBit',
    email: '2969004227@qq.com',
    avatar: getEmailAvatarPath('2969004227@qq.com'),
  },
  {
    name: '陈克岚',
    role: '视觉开发',
    intro: '负责交互设计与前端视觉开发，美术功底深厚，擅长科技与艺术融合。',
    skills: ['React', 'Pan-Design', 'Figma', 'CSS'],
    github: 'https://github.com/lingfeng11111',
    email: '3374080053@qq.com',
    avatar: getEmailAvatarPath('3374080053@qq.com'),
  },
  {
    name: '曾志翔',
    role: '后端运维',
    intro: '负责后端开发与系统运维，精通Doker以及部署等。',
    skills: ['Java', 'Linux', 'Docker', 'MySQL'],
    github: 'https://github.com/dsfeiji',
    email: '2315124408@qq.com',
    avatar: getEmailAvatarPath('2315124408@qq.com'),
  },
  {
    name: '王斐霓',
    role: '前端工程',
    intro: '负责前端功能实现与组件开发，对新技术有强烈的探索精神。',
    skills: ['Vue', 'JavaScript', 'Webpack'],
    github: 'https://github.com/IC-1318',
    email: '1547689028@qq.com',
    avatar: getEmailAvatarPath('1547689028@qq.com'),
  },
  {
    name: '王诗琪',
    role: '后端开发',
    intro: '负责后端服务开发，具备优秀的系统架构设计能力。',
    skills: ['Java', 'Spring Boot', 'MySQL'],
    github: 'https://github.com/Netlibata',
    email: '3160054387@qq.com',
    avatar: getEmailAvatarPath('3160054387@qq.com'),
  },
]

// 当前选中的成员索引
const activeIndex = ref(null)
// 控制弹窗显示
const showDialog = ref(false)

// 显示成员详情
const showMemberDetail = index => {
  activeIndex.value = index
  showDialog.value = true
}

// 关闭弹窗
const closeDialog = () => {
  showDialog.value = false
}

// 动画部分

const animation = () => {
  // Team标题动画
  gsap.from('.lightning', {
    opacity: 0,
    textShadow: '5px 5px 5px #D86E28',
    scale: 1,
    y: -50,
    duration: 0.8,
    delay: 0.3,
  })

  // 闪电标志动画
  gsap.fromTo(
    '.lightning',
    {
      opacity: 0.7,
      textShadow: '5px 5px 5px #D86E28',
      scale: 1,
    },
    {
      opacity: 1,
      textShadow: '5px 5px 10px #FBC02D',
      scale: 1.2,
      duration: 0.8,
      yoyo: true,
      repeat: -1,
      ease: 'power1.inOut',
    },
  )

  // 卡片从上到下一个接一个滑入动画
  for (let i = 0; i < 6; i++) {
    gsap.from(`.team-card-${i}`, {
      y: -100,
      opacity: 0,
      duration: 0.7,
      delay: 0.2 + i * 0.2, // 每个卡片延迟不同时间
      scrollTrigger: {
        trigger: '.author-card',
        start: 'top bottom',
        end: 'bottom top',
        toggleActions: 'restart none none reset',
        scrub: false,
        once: false,
        markers: false,
      },
    })
  }

  // 整体团队区域动画
  gsap.from('.team-grid', {
    y: 50,
    opacity: 0,
    duration: 1,
    scrollTrigger: {
      trigger: '.team-grid',
      start: 'top bottom',
      end: 'bottom top',
      toggleActions: 'restart none none reset',
      scrub: false,
      once: false,
    },
  })
}

// const activeMemberIndex = ref(null)

// const handleShowMember = idx => {
//   activeMemberIndex.value = idx
//   nextTick(() => {
//     const imgs = document.querySelectorAll('.team-member-img img')
//     imgs.forEach((img, i) => {
//       if (i === idx) {
//         img.classList.add('active')
//       } else {
//         img.classList.remove('active')
//       }
//     })
//   })
//   // 这里可以弹窗或做其他操作
// }

// const handleHideMember = () => {
//   activeMemberIndex.value = null
//   const imgs = document.querySelectorAll('.team-member-img img')
//   imgs.forEach(img => img.classList.remove('active'))
// }
</script>

<template>
  <div class="app flex flex-col h-screen w-full">
    <!-- 成员详情弹窗 -->
    <div
      v-if="showDialog"
      class="fixed inset-0 flex items-center justify-center z-50"
    >
      <div class="fixed inset-0 bg-black opacity-50" @click="closeDialog"></div>
      <div
        v-if="activeIndex !== null"
        class="member-profile-card bg-base-100 p-6 rounded-lg shadow-xl z-50 w-11/12 max-w-md transform transition-all glass-dark"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-2xl font-bold text-white w-full">
            {{ teamMembers[activeIndex].name }}
          </h3>
          <button
            class="btn btn-sm btn-circle text-white bg-transparent border-none hover:bg-gray-700"
            @click="closeDialog"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="flex flex-col">
          <div class="flex flex-col text-white">
            <div class="flex items-center space-x-3">
              <img
                :src="teamMembers[activeIndex].avatar"
                :alt="teamMembers[activeIndex].name"
                class="w-8 rounded-[50%]"
              />
              <div
                :class="['member-role-badge', `member-role-${activeIndex}`]"
                class="flex-1"
              >
                {{ teamMembers[activeIndex].role }}
              </div>
            </div>

            <p class="my-3 text-sm">{{ teamMembers[activeIndex].intro }}</p>

            <div class="mt-2">
              <h4 class="font-semibold mb-1">技能专长</h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(skill, i) in teamMembers[activeIndex].skills"
                  :key="i"
                  class="badge badge-outline px-2 py-1 text-white border-white/50"
                >
                  {{ skill }}
                </span>
              </div>
            </div>

            <div class="flex gap-4 mt-4">
              <a
                :href="teamMembers[activeIndex].github"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-sm btn-outline text-white border-white/50 hover:bg-white/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="mr-1"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                  />
                </svg>
                GitHub
              </a>
              <a
                :href="`mailto:${teamMembers[activeIndex].email}`"
                class="btn btn-sm btn-outline text-white border-white/50 hover:bg-white/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="mr-1"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z"
                  />
                </svg>
                邮件
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <dialog id="my_modal_1" class="modal">
      <div class="modal-box max-w-md">
        <h3 class="text-xl font-bold text-primary mb-6">
          加入 <span class="outlined-text-black">X</span> CAMP申请表
        </h3>

        <!-- 表单容器 -->
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <!-- 姓名 -->
          <div class="form-control space-y-1">
            <label class="label" for="name">
              <span class="label-text">你的姓名</span>
            </label>
            <input
              id="name"
              v-model.trim="formData.name"
              type="text"
              placeholder="张三"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.name }"
              required
              @blur="validateField('name', formData.name)"
            />
            <span v-if="errors.name" class="text-error text-sm">
              请输入至少2个字符的有效姓名
            </span>
          </div>

          <!-- 邮箱 -->
          <div class="form-control space-y-1">
            <label class="label" for="email">
              <span class="label-text">电子邮箱</span>
            </label>
            <input
              id="email"
              v-model.trim="formData.email"
              type="email"
              placeholder="example@qq.com"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.email }"
              required
              @blur="validateField('email', formData.email)"
            />
            <span v-if="errors.email" class="text-error text-sm">
              请输入有效的邮箱地址
            </span>
          </div>

          <!-- 联系方式 -->
          <div class="form-control space-y-1">
            <label class="label" for="phone">
              <span class="label-text">联系电话</span>
            </label>
            <input
              id="phone"
              v-model.trim="formData.phone"
              type="tel"
              placeholder="+86 13800138000"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.phone }"
              required
              @blur="validateField('phone', formData.phone)"
            />
            <span v-if="errors.phone" class="text-error text-sm">
              请输入有效的电话号码（7-15位数字）
            </span>
          </div>

          <!-- 班级 -->
          <div class="form-control space-y-1">
            <label class="label" for="class">
              <span class="label-text">班级</span>
            </label>
            <input
              id="class"
              v-model.trim="formData.class"
              type="text"
              placeholder="例如：25计算机类301"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.class }"
              required
              @blur="validateField('class', formData.class)"
            />
            <span v-if="errors.class" class="text-error text-sm">
              请输入有效的班级信息
            </span>
          </div>

          <!-- 人格特质 -->
          <div class="form-control space-y-1">
            <label class="label" for="mbti">
              <span class="label-text flex items-center gap-2">
                人格特质
                <div class="tooltip" data-tip="点击进行MBTI测试">
                  <a
                    href="https://www.16personalities.com/ch/"
                    target="_blank"
                    rel="noopener"
                    class="text-sm"
                  >
                    (测试链接)
                  </a>
                </div>
              </span>
            </label>
            <input
              id="mbti"
              v-model.trim="formData.mbti"
              type="text"
              placeholder="例如：INFP"
              class="input input-bordered w-full uppercase"
              :class="{ 'input-error': errors.mbti }"
              maxlength="4"
              required
              @input="formData.mbti = formData.mbti.toUpperCase()"
              @blur="validateField('mbti', formData.mbti)"
            />
            <span v-if="errors.mbti" class="text-error text-sm">
              请输入4位大写字母的MBTI类型
            </span>
          </div>

          <!-- 自我介绍 -->
          <div class="form-control space-y-1">
            <label class="label" for="intro">
              <span class="label-text">描述一下自己吧~</span>
            </label>
            <textarea
              id="intro"
              v-model.trim="formData.intro"
              class="textarea textarea-bordered h-32 w-full"
              :class="{ 'textarea-error': errors.intro }"
              placeholder="请说明：\n1. 加入动机\n2. 技术特长\n3. 对计算机的兴趣方向"
              required
              @blur="validateField('intro', formData.intro)"
            />
            <span v-if="errors.intro" class="text-error text-sm">
              请输入至少20字的自我介绍
            </span>
          </div>

          <!-- 操作按钮 -->
          <div class="modal-action flex justify-between items-center">
            <button
              type="submit"
              class="btn btn-primary flex-1"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="loading loading-spinner" />
              {{ isSubmitting ? '提交中...' : '投递申请' }}
            </button>

            <div class="divider divider-horizontal">或</div>

            <form method="dialog" class="flex-1">
              <button
                class="btn btn-outline w-full"
                aria-label="取消提交"
                :disabled="isSubmitting"
              >
                再考虑一下
              </button>
            </form>
          </div>
        </form>
      </div>

      <!-- 点击外部关闭 -->
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
    <div
      class="btn btn-outline w-20 btn-primary absolute top-2 left-2"
      @click="router.go(-1)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-3"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 19.5 8.25 12l7.5-7.5"
        />
      </svg>
      <span>返回</span>
    </div>
    <!-- <div
      class="w-full min-h-full flex items-center justify-center absolute top-0 left-0 bg-base-100 transform transition-all ease-in ease opacity-100"
      :class="{ isLoading: !isLoading }"
    >
      <span class="loading loading-infinity w-20"></span>
    </div> -->
    <div class="flex flex-col justify-center items-center">
      <div
        class="hero w-full min-h-screen"
        style="
          background-image: url(https://s21.ax1x.com/2025/02/03/pEZfC1U.jpg);
        "
      >
        <div class="hero-overlay" />
        <div class="hero-content text-neutral-content text-center">
          <div class="max-w-md">
            <h1 class="mb-5 text-5xl font-bold">
              这里是
              <span class="outlined-text animate__animated animate__flash"
                >X</span
              ><span>CAMP</span>
            </h1>
            <p class="mb-5">
              X Camp
              是一个致力于培养比赛技能、学习能力、代码发展思维和创新精神的社团。社团成员热衷于学习，秉持极客钻研精神，追求不断探索和自我提升。
            </p>
            <div class="flex items-center justify-between">
              <button
                class="skeleton btn btn-primary bg-primary"
                onclick="my_modal_1.showModal()"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>

                意向加入XCAMP
              </button>

              <button
                class="btn btn-primary btn-outline hidden sm:flex"
                @click="scrollToBottom"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                  />
                </svg>
                了解开发团队
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- 开发团队 -->
      <div
        ref="developmentTeam"
        class="min-h-screen w-full hidden sm:flex"
        style="
          background-image: url(https://cdn.pixabay.com/photo/2019/11/13/12/18/king-4623497_1280.jpg);
        "
      >
        <div
          class="backdrop-blur-lg w-full max-h-screen flex p-20 flex-col items-center justify-center"
        >
          <div class="text-5xl font-bold text-white">
            <span class="lightning">⚡</span>Team&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
          <div
            class="author-card grid grid-cols-6 gap-10 w-full p-10 box-border team-grid"
          >
            <div
              class="card team-card-0 bg-base-100 shadow-sm team-member-card cursor-pointer"
              @click="showMemberDetail(0)"
            >
              <figure class="team-member-img">
                <img
                  class="w-full grayscale transition-all duration-300"
                  src="@/assets/author/lzh.png"
                  alt="Shoes"
                />
              </figure>
              <div class="card-body">
                <h2 class="card-title team-member-name">骆子豪</h2>
                <div class="card-actions justify-end">
                  <div class="role-tag role-tag-0">前端架构</div>
                </div>
              </div>
            </div>
            <div
              class="card team-card-1 bg-base-100 shadow-sm team-member-card cursor-pointer"
              @click="showMemberDetail(1)"
            >
              <figure class="team-member-img">
                <img
                  src="@/assets/author/lh.PNG"
                  alt="Shoes"
                  class="w-full grayscale transition-all duration-300"
                />
              </figure>
              <div class="card-body">
                <h2 class="card-title team-member-name">李豪</h2>
                <div class="card-actions justify-end">
                  <div class="role-tag role-tag-1">数据算法</div>
                </div>
              </div>
            </div>
            <div
              class="card team-card-2 bg-base-100 shadow-sm team-member-card cursor-pointer"
              @click="showMemberDetail(2)"
            >
              <figure class="team-member-img">
                <img
                  src="@/assets/author/ckl.PNG"
                  alt="Shoes"
                  class="w-full grayscale transition-all duration-300"
                />
              </figure>
              <div class="card-body">
                <h2 class="card-title team-member-name">陈克岚</h2>
                <div class="card-actions justify-end">
                  <div class="role-tag role-tag-2">视觉开发</div>
                </div>
              </div>
            </div>
            <div
              class="card team-card-3 bg-base-100 shadow-sm team-member-card cursor-pointer"
              @click="showMemberDetail(3)"
            >
              <figure class="team-member-img">
                <img
                  src="@/assets/author/zzx.PNG"
                  alt="Shoes"
                  class="w-full grayscale transition-all duration-300"
                />
              </figure>
              <div class="card-body">
                <h2 class="card-title team-member-name">曾志翔</h2>
                <div class="card-actions justify-end">
                  <div class="role-tag role-tag-3">后端运维</div>
                </div>
              </div>
            </div>
            <div
              class="card team-card-4 bg-base-100 shadow-sm team-member-card cursor-pointer"
              @click="showMemberDetail(4)"
            >
              <figure class="team-member-img">
                <img
                  src="@/assets/author/wfn.PNG"
                  alt="Shoes"
                  class="w-full grayscale transition-all duration-300"
                />
              </figure>
              <div class="card-body">
                <h2 class="card-title team-member-name">王斐霓</h2>
                <div class="card-actions justify-end">
                  <div class="role-tag role-tag-4">前端工程</div>
                </div>
              </div>
            </div>
            <div
              class="card team-card-5 bg-base-100 shadow-sm team-member-card cursor-pointer"
              @click="showMemberDetail(5)"
            >
              <figure class="team-member-img">
                <img
                  src="@/assets/author/wsq.PNG"
                  alt="Shoes"
                  class="w-full grayscale transition-all duration-300"
                />
              </figure>
              <div class="card-body">
                <h2 class="card-title team-member-name">王诗琪</h2>
                <div class="card-actions justify-end">
                  <div class="role-tag role-tag-5">后端开发</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.isLoading {
  opacity: 0;
  /* 隐藏 */
  visibility: hidden;
}
.outlined-text {
  color: black; /* 黑色文字 */
  -webkit-text-stroke: 2px white; /* 白色描边，适用于 Webkit 浏览器（如 Chrome 和 Safari） */
}
.outlined-text-black {
  color: rgb(255, 255, 255); /* 黑色文字 */
  -webkit-text-stroke: 2px rgb(0, 0, 0); /* 白色描边，适用于 Webkit 浏览器（如 Chrome 和 Safari） */
}

/* 团队成员卡片样式 */
.team-member-card {
  position: relative;
  overflow: visible; /* 允许内容溢出 */
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  background: linear-gradient(145deg, #2a323c, #1d232a);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1;
  transform-origin: center bottom; /* 从底部中心点开始变换 */
  perspective: 1000px; /* 添加3D透视效果，增强立体感 */
}

/* 移除透明框效果 */

.team-member-card:hover {
  transform: translateY(-15px) scale(1.05) rotateX(5deg);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  transition:
    transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1),
    background 0.8s cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
  z-index: 5; /* 提高悬停卡片的层级 */
  animation: cardStretch 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; /* 使用卡片上移动画，更丝滑的缓动函数 */
  background: linear-gradient(145deg, #3a424c, #2d333a); /* 基础悬停背景更亮 */
}

/* 移除透明框效果 */

/* 移除之前的悬浮样式，因为我们已经在新的样式中定义了 */

.team-member-card:hover .team-member-name {
  /* 基础样式，会被各彩虹色卡片的样式覆盖 */
  transform: scale(1.1);
}

/* 图片容器样式已在下方定义 */

.team-member-img {
  position: relative;
  overflow: hidden; /* 初始状态下隐藏溢出部分 */
  margin: 0; /* 重置边距 */
}

.team-member-img img {
  transform: translateX(-25%);
  transition: all 0.3s ease-out;
  width: 150%;
  max-width: none;
  filter: grayscale(0.85) brightness(0.9); /* 降低灰度，保留一些颜色 */
  position: relative;
  z-index: 10;
  object-fit: cover;
  height: 100%;
  will-change: transform, filter;
  transform-origin: center center;
}

/* 为每个卡片设置不同的初始颜色滤镜 */
.team-card-0 .team-member-img img {
  filter: grayscale(0.85) brightness(0.9) sepia(0.2) hue-rotate(0deg)
    saturate(0.4); /* 红色调 */
}
.team-card-1 .team-member-img img {
  filter: grayscale(0.85) brightness(0.9) sepia(0.2) hue-rotate(20deg)
    saturate(0.4); /* 橙色调 */
}
.team-card-2 .team-member-img img {
  filter: grayscale(0.85) brightness(0.9) sepia(0.2) hue-rotate(50deg)
    saturate(0.4); /* 黄色调 */
}
.team-card-3 .team-member-img img {
  filter: grayscale(0.85) brightness(0.9) sepia(0.2) hue-rotate(90deg)
    saturate(0.4); /* 绿色调 */
}
.team-card-4 .team-member-img img {
  filter: grayscale(0.85) brightness(0.9) sepia(0.2) hue-rotate(180deg)
    saturate(0.4); /* 蓝色调 */
}
.team-card-5 .team-member-img img {
  filter: grayscale(0.85) brightness(0.9) sepia(0.2) hue-rotate(270deg)
    saturate(0.4); /* 紫色调 */
}

@keyframes imageReveal {
  0% {
    filter: grayscale(0.85) brightness(0.9) saturate(0.4);
    transform: translateX(-25%) scale(1, 1);
  }
  50% {
    filter: grayscale(0.4) brightness(1) saturate(0.7);
    transform: translateX(-25%) scale(1.02, 1.02);
  }
  100% {
    filter: grayscale(0) brightness(1.1) saturate(1.1);
    transform: translateX(-25%) scale(1.05, 1.05);
  }
}

/* 修改悬浮动画，使用对应的颜色滤镜 */
.team-card-0:hover .team-member-img img {
  filter: grayscale(0) brightness(1.1) saturate(1.1) sepia(0.1) hue-rotate(0deg);
}
.team-card-1:hover .team-member-img img {
  filter: grayscale(0) brightness(1.1) saturate(1.1) sepia(0.1)
    hue-rotate(20deg);
}
.team-card-2:hover .team-member-img img {
  filter: grayscale(0) brightness(1.1) saturate(1.1) sepia(0.1)
    hue-rotate(50deg);
}
.team-card-3:hover .team-member-img img {
  filter: grayscale(0) brightness(1.1) saturate(1.1) sepia(0.1)
    hue-rotate(90deg);
}
.team-card-4:hover .team-member-img img {
  filter: grayscale(0) brightness(1.1) saturate(1.1) sepia(0.1)
    hue-rotate(180deg);
}
.team-card-5:hover .team-member-img img {
  filter: grayscale(0) brightness(1.1) saturate(1.1) sepia(0.1)
    hue-rotate(270deg);
}

.team-member-card:hover .team-member-img {
  overflow: visible;
  z-index: 25;
}

.team-member-card:hover .team-member-img::before {
  display: none;
}

.team-member-card:hover .team-member-img img {
  transform: translateX(-25%) scale(1.05, 1.05);
  filter: grayscale(0);
  border-radius: 0;
  z-index: 30;
  box-shadow: none;
  transition: all 0.2s ease-out;
  animation: imageReveal 0.2s ease-out forwards;
}

@keyframes powerfulStretch {
  0% {
    transform: translateX(-25%) scale(1, 1);
    filter: grayscale(1) brightness(1) contrast(1) saturate(1);
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  }
  15% {
    transform: translateX(-28%) scale(1.1, 1);
    filter: grayscale(0.8) brightness(1.05) contrast(1.05) saturate(1.05);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  }
  30% {
    transform: translateX(-30%) scale(1.15, 1);
    filter: grayscale(0.6) brightness(1.08) contrast(1.1) saturate(1.1);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
  }
  50% {
    transform: translateX(-32%) scale(1.2, 1);
    filter: grayscale(0.4) brightness(1.12) contrast(1.15) saturate(1.15);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.35);
  }
  70% {
    transform: translateX(-34%) scale(1.25, 1);
    filter: grayscale(0.2) brightness(1.15) contrast(1.2) saturate(1.18);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.4);
  }
  85% {
    transform: translateX(-35%) scale(1.28, 1);
    filter: grayscale(0.1) brightness(1.18) contrast(1.25) saturate(1.19);
    box-shadow: 0 13px 30px rgba(0, 0, 0, 0.45);
  }
  100% {
    transform: translateX(-35%) scale(1.3, 1);
    filter: grayscale(0) brightness(1.2) contrast(1.3) saturate(1.2);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
  }
}

@keyframes cardStretch {
  0% {
    transform: translateY(0) scale(1) rotateX(0);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    filter: brightness(1);
  }
  30% {
    transform: translateY(-8px) scale(1.02) rotateX(2deg);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.25);
    filter: brightness(1.03);
  }
  50% {
    transform: translateY(-12px) scale(1.03) rotateX(3.5deg);
    box-shadow: 0 18px 35px rgba(0, 0, 0, 0.35);
    filter: brightness(1.05);
  }
  75% {
    transform: translateY(-14px) scale(1.04) rotateX(4.5deg);
    box-shadow: 0 22px 45px rgba(0, 0, 0, 0.45);
    filter: brightness(1.07);
  }
  100% {
    transform: translateY(-15px) scale(1.05) rotateX(5deg);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    filter: brightness(1.1);
  }
}

/* 图片过渡效果已在上方定义 */

.team-member-name {
  transition: all 0.3s ease;
  text-align: center;
  width: 100%;
  display: block;
}

/* 彩虹色背景变换 */

/* 彩虹色卡片设置 */
.team-card-0 {
  --team-glow-color: rgba(255, 0, 0, 0.7); /* 红色 */
}
.team-card-0:hover {
  background: linear-gradient(145deg, #5a3838, #4d2d2d);
}
.team-card-0:hover .team-member-name {
  color: #ff5555 !important;
  text-shadow: 0 0 8px rgba(255, 0, 0, 0.5) !important;
}

.team-card-1 {
  --team-glow-color: rgba(255, 165, 0, 0.7); /* 橙色 */
}
.team-card-1:hover {
  background: linear-gradient(145deg, #5a4038, #4d3d2d);
}
.team-card-1:hover .team-member-name {
  color: #ffaa55 !important;
  text-shadow: 0 0 8px rgba(255, 165, 0, 0.5) !important;
}

.team-card-2 {
  --team-glow-color: rgba(255, 255, 0, 0.7); /* 黄色 */
}
.team-card-2:hover {
  background: linear-gradient(145deg, #5a5a38, #4d4d2d);
}
.team-card-2:hover .team-member-name {
  color: #ffff55 !important;
  text-shadow: 0 0 8px rgba(255, 255, 0, 0.5) !important;
}

.team-card-3 {
  --team-glow-color: rgba(0, 255, 0, 0.7); /* 绿色 */
}
.team-card-3:hover {
  background: linear-gradient(145deg, #385a38, #2d4d2d);
}
.team-card-3:hover .team-member-name {
  color: #55ff55 !important;
  text-shadow: 0 0 8px rgba(0, 255, 0, 0.5) !important;
}

.team-card-4 {
  --team-glow-color: rgba(0, 0, 255, 0.7); /* 蓝色 */
}
.team-card-4:hover {
  background: linear-gradient(145deg, #38385a, #2d2d4d);
}
.team-card-4:hover .team-member-name {
  color: #5555ff !important;
  text-shadow: 0 0 8px rgba(0, 0, 255, 0.5) !important;
}

.team-card-5 {
  --team-glow-color: rgba(148, 0, 211, 0.7); /* 紫色 */
}
.team-card-5:hover {
  background: linear-gradient(145deg, #40385a, #362d4d);
}
.team-card-5:hover .team-member-name {
  color: #b255ff !important;
  text-shadow: 0 0 8px rgba(148, 0, 211, 0.5) !important;
}

/* 团队网格 */
.team-grid {
  isolation: isolate; /* 创建新的层叠上下文 */
}

/* 设置卡片悬浮时的层级优先级 */
.team-grid .team-member-card {
  transition:
    all 0.3s ease,
    z-index 0s;
}

.team-grid .team-member-card:hover {
  z-index: 10; /* 悬浮时提高整个卡片的层级 */
}

/* 角色标签样式 */
.role-tag {
  width: 100%;
  text-align: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
  pointer-events: none;
  position: relative;
  z-index: 1;
}

/* 各角色标签默认颜色（只有框有颜色） */
.role-tag-0 {
  color: #772222;
  background-color: transparent;
  border: 1.5px solid rgba(204, 51, 51, 0.6);
}

.role-tag-1 {
  color: #884400;
  background-color: transparent;
  border: 1.5px solid rgba(230, 119, 0, 0.6);
}

.role-tag-2 {
  color: #777700;
  background-color: transparent;
  border: 1.5px solid rgba(204, 204, 34, 0.6);
}

.role-tag-3 {
  color: #226622;
  background-color: transparent;
  border: 1.5px solid rgba(51, 170, 51, 0.6);
}

.role-tag-4 {
  color: #222288;
  background-color: transparent;
  border: 1.5px solid rgba(51, 68, 204, 0.6);
}

.role-tag-5 {
  color: #551177;
  background-color: transparent;
  border: 1.5px solid rgba(136, 34, 187, 0.6);
}

/* 卡片悬浮时各角色标签显示颜色 - 使用::before伪元素实现完整覆盖 */

.team-card-0:hover .role-tag-0 {
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
}

.team-card-0:hover .role-tag-0::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: linear-gradient(135deg, #cc3333, #ff5555);
  z-index: -1;
  box-shadow: 0 2px 10px rgba(255, 0, 0, 0.5);
}

.team-card-1:hover .role-tag-1 {
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
}

.team-card-1:hover .role-tag-1::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: linear-gradient(135deg, #e67700, #ffaa55);
  z-index: -1;
  box-shadow: 0 2px 10px rgba(255, 165, 0, 0.5);
}

.team-card-2:hover .role-tag-2 {
  color: #333;
  border-color: transparent;
  transform: translateY(-2px);
}

.team-card-2:hover .role-tag-2::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: linear-gradient(135deg, #cccc22, #ffff55);
  z-index: -1;
  box-shadow: 0 2px 10px rgba(255, 255, 0, 0.5);
}

.team-card-3:hover .role-tag-3 {
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
}

.team-card-3:hover .role-tag-3::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: linear-gradient(135deg, #33aa33, #55ff55);
  z-index: -1;
  box-shadow: 0 2px 10px rgba(0, 255, 0, 0.5);
}

.team-card-4:hover .role-tag-4 {
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
}

.team-card-4:hover .role-tag-4::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: linear-gradient(135deg, #3344cc, #5555ff);
  z-index: -1;
  box-shadow: 0 2px 10px rgba(0, 0, 255, 0.5);
}

.team-card-5:hover .role-tag-5 {
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
}

.team-card-5:hover .role-tag-5::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: linear-gradient(135deg, #8822bb, #b255ff);
  z-index: -1;
  box-shadow: 0 2px 10px rgba(148, 0, 211, 0.5);
}

/* 成员详情弹窗样式 */
.member-profile-card {
  animation: slide-up 0.3s ease;
}

.glass-dark {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.member-role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.member-role-0 {
  background: linear-gradient(135deg, #cc3333, #ff5555);
  color: white;
  box-shadow: 0 2px 10px rgba(255, 0, 0, 0.3);
}

.member-role-1 {
  background: linear-gradient(135deg, #e67700, #ffaa55);
  color: white;
  box-shadow: 0 2px 10px rgba(255, 165, 0, 0.3);
}

.member-role-2 {
  background: linear-gradient(135deg, #cccc22, #ffff55);
  color: #333;
  box-shadow: 0 2px 10px rgba(255, 255, 0, 0.3);
}

.member-role-3 {
  background: linear-gradient(135deg, #33aa33, #55ff55);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 255, 0, 0.3);
}

.member-role-4 {
  background: linear-gradient(135deg, #3344cc, #5555ff);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 255, 0.3);
}

.member-role-5 {
  background: linear-gradient(135deg, #8822bb, #b255ff);
  color: white;
  box-shadow: 0 2px 10px rgba(148, 0, 211, 0.3);
}
</style>
