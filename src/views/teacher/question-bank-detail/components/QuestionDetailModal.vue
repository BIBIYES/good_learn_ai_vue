<script setup>
import { ref, watch } from 'vue'
import MarkdBox from '@/components/common/MarkdBox.vue'

const props = defineProps({
  question: {
    type: Object,
    default: () => ({}),
  },
})

const detailQuestion = ref({})

// 监听question变化
watch(
  () => props.question,
  newVal => {
    if (newVal) {
      detailQuestion.value = { ...newVal }
    }
  },
  { immediate: true, deep: true },
)

// 难度中文映射
const difficultyMap = {
  1: '简单',
  2: '中等',
  3: '困难',
  easy: '简单',
  medium: '中等',
  hard: '困难',
}

// 获取难度标签样式
const getDifficultyStyle = difficulty => {
  switch (difficulty) {
    case '1':
    case 'easy':
      return 'success'
    case '2':
    case 'medium':
      return 'warning'
    case '3':
    case 'hard':
      return 'error'
    default:
      return 'info'
  }
}

// 格式化日期
const formatDate = dateString => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString()
  } catch (e) {
    console.log(e)
    return dateString
  }
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-200px)] overflow-y-auto">
    <div class="divide-y divide-gray-100">
      <div class="py-3 flex">
        <div class="font-medium text-gray-500 w-24">标题</div>
        <div class="text-gray-800">{{ detailQuestion.title || '-' }}</div>
      </div>
      <div class="py-3">
        <div class="font-medium text-gray-500 mb-2">题目内容</div>
        <div class="bg-gray-50 p-4 rounded-lg">
          <MarkdBox :content="detailQuestion.content || ''" />
        </div>
      </div>
      <div class="py-3 flex">
        <div class="font-medium text-gray-500 w-24">难度等级</div>
        <div class="text-gray-800">
          <div
            class="badge-liquid-glass"
            :class="getDifficultyStyle(detailQuestion.difficulty)"
          >
            {{
              difficultyMap[detailQuestion.difficulty] ||
              detailQuestion.difficulty
            }}
          </div>
        </div>
      </div>
      <div class="py-3 flex">
        <div class="font-medium text-gray-500 w-24">创建时间</div>
        <div class="text-gray-800">
          {{ formatDate(detailQuestion.createdAt) }}
        </div>
      </div>
      <div class="py-3 flex">
        <div class="font-medium text-gray-500 w-24">更新时间</div>
        <div class="text-gray-800">
          {{ formatDate(detailQuestion.updatedAt) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 徽章样式 */
.badge-liquid-glass {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.badge-liquid-glass.success {
  background: linear-gradient(
    145deg,
    rgba(34, 197, 94, 0.3),
    rgba(21, 128, 61, 0.2)
  );
  color: rgb(21, 128, 61);
  border: 1px solid rgba(34, 197, 94, 0.4);
  box-shadow:
    0 1px 3px rgba(21, 128, 61, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.5);
}

.badge-liquid-glass.warning {
  background: linear-gradient(
    145deg,
    rgba(234, 179, 8, 0.3),
    rgba(161, 98, 7, 0.2)
  );
  color: rgb(161, 98, 7);
  border: 1px solid rgba(234, 179, 8, 0.4);
  box-shadow:
    0 1px 3px rgba(161, 98, 7, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.5);
}

.badge-liquid-glass.error {
  background: linear-gradient(
    145deg,
    rgba(239, 68, 68, 0.3),
    rgba(185, 28, 28, 0.2)
  );
  color: rgb(185, 28, 28);
  border: 1px solid rgba(239, 68, 68, 0.4);
  box-shadow:
    0 1px 3px rgba(185, 28, 28, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.5);
}

.badge-liquid-glass.disabled {
  background: linear-gradient(
    145deg,
    rgba(156, 163, 175, 0.3),
    rgba(75, 85, 99, 0.2)
  );
  color: rgb(75, 85, 99);
  border: 1px solid rgba(156, 163, 175, 0.4);
  box-shadow:
    0 1px 3px rgba(75, 85, 99, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.5);
}

/* 液态玻璃按钮基础样式 */
.btn-liquid-glass {
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: linear-gradient(
    145deg,
    rgba(248, 255, 252, 0.7),
    rgba(245, 253, 248, 0.6)
  );
  color: rgb(40, 130, 90);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(248, 255, 252, 0.5);
  box-shadow:
    0 2px 10px rgba(0, 0, 0, 0.05),
    inset 0 1px 1px rgba(255, 255, 255, 0.6);
}

.btn-liquid-glass:hover {
  background: linear-gradient(
    145deg,
    rgba(250, 255, 253, 0.8),
    rgba(248, 253, 250, 0.7)
  );
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.btn-liquid-glass:active {
  background: linear-gradient(
    145deg,
    rgba(245, 253, 248, 0.7),
    rgba(242, 250, 245, 0.6)
  );
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.04),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
  transform: translateY(0);
}

/* 模态框动画 */
@keyframes modalPop {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

.animate-modal-pop > div:last-child {
  animation: modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  margin: auto;
  position: relative;
  z-index: 1003;
}

.modal-container > div:last-child {
  max-height: 80vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 200, 130, 0.3) transparent;
  margin: auto;
}

.modal-container > div:last-child::-webkit-scrollbar {
  width: 5px;
}

.modal-container > div:last-child::-webkit-scrollbar-track {
  background: transparent;
}

.modal-container > div:last-child::-webkit-scrollbar-thumb {
  background-color: rgba(100, 200, 130, 0.3);
  border-radius: 10px;
}
</style>
