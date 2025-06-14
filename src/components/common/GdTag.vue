<template>
  <div
    class="badge badge-sm flex items-center justify-center"
    :class="`bg-${color}/10 text-${color}`"
  >
    <div class="flex items-center justify-center w-full h-full">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  color: {
    type: String,
    default: 'primary',
    validator: value =>
      ['primary', 'warning', 'success', 'error', 'neutral'].includes(value),
  },
})
</script>

<style lang="scss" scoped></style>
