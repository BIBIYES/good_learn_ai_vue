<script setup>
import { computed } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: 'w-96'
  },
  showCloseButton: {
    type: Boolean,
    default: true
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  }
})

// Define the component name for Vue linting rules
defineOptions({
  name: 'AppModal'
})

const emit = defineEmits(['close', 'ok'])

const handleClose = () => {
  emit('close')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    emit('close')
  }
}

const containerClasses = computed(() => {
  return `modal-box rounded-xl shadow-lg ${props.width}`
})
</script>

<template>
  <dialog
    class="modal"
    :open="open"
  >
    <div :class="containerClasses">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-lg">
          {{ title }}
        </h3>
        <button
          v-if="showCloseButton"
          class="btn btn-sm btn-circle btn-ghost"
          @click="handleClose"
        >
          ✕
        </button>
      </div>

      <div class="modal-body">
        <!-- 默认内容插槽 -->
        <slot />
      </div>

      <div class="modal-action">
        <!-- 自定义底部插槽 -->
        <slot name="footer">
          <button
            class="btn btn-ghost"
            @click="handleClose"
          >
            取消
          </button>
          <button
            class="btn btn-primary"
            @click="$emit('ok')"
          >
            确认
          </button>
        </slot>
      </div>
    </div>
    <div
      class="modal-backdrop bg-base-200 bg-opacity-50"
      @click="handleBackdropClick"
    />
  </dialog>
</template>
