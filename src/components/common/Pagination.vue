<script setup>
import { computed } from 'vue'

// Define the component name for Vue linting rules
defineOptions({
  name: 'AppPagination',
})

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    default: 0,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  showSizeChanger: {
    type: Boolean,
    default: true,
  },
  pageSizeOptions: {
    type: Array,
    default: () => [5, 10, 20, 50],
  },
})

const emit = defineEmits(['change', 'sizeChange'])

// 计算显示的页码范围
const pageNumbers = computed(() => {
  const result = []
  const maxVisiblePages = 5

  if (props.totalPages <= maxVisiblePages) {
    // 如果总页数少于或等于最大可见页数，显示所有页码
    for (let i = 1; i <= props.totalPages; i++) {
      result.push(i)
    }
  } else {
    // 否则显示当前页附近的页码
    let startPage = Math.max(
      1,
      props.currentPage - Math.floor(maxVisiblePages / 2),
    )
    let endPage = Math.min(props.totalPages, startPage + maxVisiblePages - 1)

    // 调整起始页，确保显示足够的页码
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // 添加第一页（如果不是从第一页开始）
    if (startPage > 1) {
      result.push(1)
      if (startPage > 2) {
        result.push('...')
      }
    }

    // 添加中间的页码
    for (let i = startPage; i <= endPage; i++) {
      result.push(i)
    }

    // 添加最后一页（如果不是到最后一页结束）
    if (endPage < props.totalPages) {
      if (endPage < props.totalPages - 1) {
        result.push('...')
      }
      result.push(props.totalPages)
    }
  }

  return result
})

const changePage = page => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('change', page)
  }
}

const changePageSize = event => {
  emit('sizeChange', Number(event.target.value))
}

// 计算当前显示的记录范围
const recordRange = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize + 1
  const end = Math.min(props.currentPage * props.pageSize, props.total)
  return { start, end }
})
</script>

<template>
  <div class="flex justify-between items-center px-2">
    <div class="text-sm text-base-content/70">
      <span v-if="total > 0">
        显示 {{ recordRange.start }}-{{ recordRange.end }}，共
        {{ total }} 条记录
      </span>
    </div>
    <div class="flex items-center gap-4">
      <div class="btn-group">
        <button
          class="btn btn-sm"
          :class="{ 'btn-disabled': currentPage === 1 }"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          «
        </button>
        <button
          v-for="page in pageNumbers"
          :key="page"
          class="btn btn-sm"
          :class="{
            'btn-active': currentPage === page,
            'pointer-events-none': page === '...',
          }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
        <button
          class="btn btn-sm"
          :class="{
            'btn-disabled': currentPage === totalPages || totalPages === 0,
          }"
          :disabled="currentPage === totalPages || totalPages === 0"
          @click="changePage(currentPage + 1)"
        >
          »
        </button>
      </div>
      <select
        v-if="showSizeChanger"
        :value="pageSize"
        class="select select-sm select-bordered w-24"
        @change="changePageSize"
      >
        <option v-for="size in pageSizeOptions" :key="size" :value="size">
          {{ size }}条/页
        </option>
      </select>
    </div>
  </div>
</template>
