<script setup>
import router from '@/router'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
import { onMounted, ref } from 'vue'

const isloading = ref(true)

// 切换loading状态
const toggleLoading = () => {
  isloading.value = false
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
  isloading.value = true
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
    await new Promise((resolve) => setTimeout(resolve, 1000))

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

// 动画部分

const animation = () => {
  gsap.from('.author-card', {
    x: -1000,
    duration: 1,
    scrollTrigger: {
      trigger: '.author-card',
      ease: 'power4.inOut',
      start: 'top center',
      end: 'top center',
      // markers: true,
      toggleActions: 'play none reverse none', // 关键配置
    },
  })
  gsap.fromTo(
    '.lightning',
    {
      // 起始状态
      opacity: 0, // 透明度从 0 开始
      textShadow: '5px 5px 5px #D86E28', // 起始无阴影
      scale: 1, // 起始缩放比例为 1
    },
    {
      // 结束状态
      opacity: 1, // 透明度动画结束时为 1
      textShadow: '5px 5px 10px #FBC02D', // 结束时的阴影效果
      scale: 1.2, // 结束时放大到 1.2 倍
      duration: 0.8, // 动画持续时间
      yoyo: true, // 动画来回切换
      repeat: -1, // 无限循环
      ease: 'power1.inOut', // 缓动效果
    },
  )
}
</script>

<template>
  <div class="app flex flex-col h-screen w-full">
    <dialog id="my_modal_1" class="modal">
      <div class="modal-box max-w-md">
        <h3 class="text-xl font-bold text-primary mb-6">
          加入 <span class="outlined-text-black">X</span> CAMP申请表
        </h3>

        <!-- 表单容器 -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- 姓名 -->
          <div class="form-control space-y-1">
            <label class="label" for="name">
              <span class="label-text">你的姓名</span>
            </label>
            <input
              type="text"
              id="name"
              v-model.trim="formData.name"
              placeholder="张三"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.name }"
              @blur="validateField('name', formData.name)"
              required
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
              type="email"
              id="email"
              v-model.trim="formData.email"
              placeholder="example@qq.com"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.email }"
              @blur="validateField('email', formData.email)"
              required
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
              type="tel"
              id="phone"
              v-model.trim="formData.phone"
              placeholder="+86 13800138000"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.phone }"
              @blur="validateField('phone', formData.phone)"
              required
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
              type="text"
              id="class"
              v-model.trim="formData.class"
              placeholder="例如：25计算机类301"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.class }"
              @blur="validateField('class', formData.class)"
              required
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
              type="text"
              id="mbti"
              v-model.trim="formData.mbti"
              placeholder="例如：INFP"
              class="input input-bordered w-full uppercase"
              :class="{ 'input-error': errors.mbti }"
              @input="formData.mbti = formData.mbti.toUpperCase()"
              @blur="validateField('mbti', formData.mbti)"
              maxlength="4"
              required
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
              @blur="validateField('intro', formData.intro)"
              placeholder="请说明：\n1. 加入动机\n2. 技术特长\n3. 对计算机的兴趣方向"
              required
            ></textarea>
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
              <span v-if="isSubmitting" class="loading loading-spinner"></span>
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
      :class="{ isloading: !isloading }"
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
        <div class="hero-overlay"></div>
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
                class="btn btn-primary btn-outline hidden sm:flex "
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
        class="min-h-screen w-full hidden sm:flex"
        style="
          background-image: url(https://cdn.pixabay.com/photo/2019/11/13/12/18/king-4623497_1280.jpg);
        "
        ref="developmentTeam"
      >
        <div
          class="backdrop-blur-lg w-full max-h-screen flex p-20 flex-col items-center justify-center"
        >
          <div class="text-5xl font-bold text-white">
            <span class="lightning">⚡</span>Team&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
          <div
            class="author-card grid grid-cols-4 gap-10 w-full p-10 box-border"
          >
            <div class="card bg-base-100 shadow-sm">
              <figure>
                <img
                  class="w-full"
                  src="../../../assets/author/lzh.png"
                  alt="Shoes"
                />
              </figure>
              <div class="card-body">
                <h2 class="card-title">骆子豪</h2>
                <p>
                  后端工程师：负责后端的接口设计部分,拥有多软开奖项,是一名独立开发者。
                </p>
                <div class="card-actions justify-end">
                  <button class="btn btn-primary btn-outline">攻略他</button>
                </div>
              </div>
            </div>
            <div class="card bg-base-100 shadow-sm">
              <figure>
                <img src="../../../assets/author/lh.png" alt="Shoes" />
              </figure>
              <div class="card-body">
                <h2 class="card-title">李豪</h2>
                <p>
                  AI算法工程师：本项目的核心算法工程师，负本项目的模型训练，和算法实现，拥有多项数模奖项，比赛经验
                </p>
                <div class="card-actions justify-end">
                  <button class="btn btn-primary btn-outline">攻略他</button>
                </div>
              </div>
            </div>
            <div class="card bg-base-100 shadow-sm">
              <figure>
                <img src="../../../assets/author/ckl.png" alt="Shoes" />
              </figure>
              <div class="card-body">
                <h2 class="card-title">陈克岚</h2>
                <p>
                  前端工程：师负责页面的前端设计部分,还是一名插画师,拥有多项奖项，比赛经验
                </p>
                <div class="card-actions justify-end">
                  <button class="btn btn-primary btn-outline">攻略他</button>
                </div>
              </div>
            </div>
            <div class="card bg-base-100 shadow-sm">
              <figure>
                <img src="../../../assets/author/zzx.png" alt="Shoes" />
              </figure>
              <div class="card-body">
                <h2 class="card-title">曾志翔</h2>
                <p>运维工程师：扶着服务器的运行,业余还是一名MC MOD开发者</p>
                <div class="card-actions justify-end">
                  <button class="btn btn-primary btn-outline">攻略他</button>
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
.isloading {
  opacity: 0;
  /* 隐藏 */
  visibility: hidden;
}
.outlined-text {
  color: black; /* 黑色文字 */
  -webkit-text-stroke: 2px white; /* 白色描边，适用于 Webkit 浏览器（如 Chrome 和 Safari） */
  text-stroke: 2px white; /* 标准的 text-stroke，某些浏览器可能不支持 */
}
.outlined-text-black {
  color: rgb(255, 255, 255); /* 黑色文字 */
  -webkit-text-stroke: 2px rgb(0, 0, 0); /* 白色描边，适用于 Webkit 浏览器（如 Chrome 和 Safari） */
  text-stroke: 2px rgb(0, 0, 0); /* 标准的 text-stroke，某些浏览器可能不支持 */
}
</style>
