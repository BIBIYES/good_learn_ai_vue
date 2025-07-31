<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold">签到管理</h2>
      <el-button type="primary" @click="dialogs.create.visible = true">
        <template #icon>
          <LineMdPlus />
        </template>
        发布签到
      </el-button>
    </div>

    <!-- 签到列表 -->
    <el-table
      v-loading="loading"
      element-loading-text="正在加载签到数据..."
      :data="signInList"
      style="width: 100%"
      border
      stripe
    >
      <el-table-column prop="title" label="签到类型" width="150" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)" effect="light">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.startTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="endTime" label="结束时间" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="{ row }">
          <el-button size="small" type="info" @click="viewSignInDetail(row)">
            <template #icon>
              <IcOutlineRemoveRedEye />
            </template>
            查看详情
          </el-button>
          <el-button
            size="small"
            type="primary"
            :disabled="row.status === 'ended'"
            @click="toggleSignInStatus(row)"
          >
            <template #icon> </template>
            {{ row.status === 'active' ? '结束' : '开始' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空数据状态 -->
    <el-empty
      v-if="!loading && signInList.length === 0"
      description="暂无签到记录，点击上方按钮发布新签到"
    >
      <el-button type="primary" @click="dialogs.create.visible = true">
        <template #icon>
          <LineMdPlus />
        </template>
        发布签到
      </el-button>
    </el-empty>

    <!-- 创建签到模态框 -->
    <el-dialog
      v-model="dialogs.create.visible"
      title="发布新签到"
      width="500px"
      align-center
      destroy-on-close
    >
      <CreateSignInForm
        :course-id="courseId"
        @close="dialogs.create.visible = false"
        @created="handleSignInCreated"
      />
    </el-dialog>

    <!-- 确认停止签到模态框 -->
    <el-dialog
      v-model="dialogs.confirm.visible"
      title="确认停止签到"
      width="400px"
      align-center
    >
      <div>
        <p>您确定要停止当前签到吗？该操作不可撤销。</p>
        <p class="mt-2 text-sm text-base-content/70">
          停止签到后，学生将无法再进行签到。
        </p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogs.confirm.visible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="stopLoading"
            @click="confirmStopSignIn"
          >
            确认停止
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import message from '@/plugin/message'
import CreateSignInForm from './CreateSignInForm.vue'
import { getSignInInfo, stopSignIn } from '@/api/courseApi.js'
import { formatDateTime } from '@/utils/dataFormat.js'

const props = defineProps({
  courseId: {
    type: [String, Number],
    required: true,
  },
})

// 状态
const dialogs = reactive({
  create: {
    visible: false,
  },
  confirm: {
    visible: false,
  },
})

const signInList = ref([])
const loading = ref(false)
const stopLoading = ref(false)
const currentItem = ref(null) // 当前操作的签到项

// 获取签到列表数据
const fetchSignInList = async () => {
  loading.value = true
  try {
    const res = await getSignInInfo(props.courseId)
    if (res.code === 200 && res.data) {
      // 将API返回的数据格式转换为组件中使用的格式
      signInList.value = res.data.map(item => ({
        id: item.attendanceId,
        title: `${getTypeText(item.type)} 签到`,
        status: item.status ? 'active' : 'ended',
        startTime: item.createdAt,
        endTime: item.status
          ? new Date(new Date(item.createdAt).getTime() + 30 * 60 * 1000)
          : item.createdAt, // 假设签到持续30分钟
        type: item.type,
        createdBy: item.createdBy,
      }))
    }
  } catch (error) {
    console.error('获取签到列表失败:', error)
    message.error('获取签到列表失败')
  } finally {
    loading.value = false
  }
}

// 获取签到类型文本
const getTypeText = type => {
  switch (type) {
    case 'pin':
      return '验证码'
    case 'button':
      return '按钮'
    default:
      return '普通'
  }
}

// 查看签到详情
const viewSignInDetail = item => {
  console.log('查看签到详情', item)
  // 这里可以跳转到详情页或者打开详情模态框
}

// 切换签到状态
const toggleSignInStatus = item => {
  if (item.status === 'active') {
    // 如果是停止签到，显示确认对话框
    currentItem.value = item
    dialogs.confirm.visible = true
  } else if (item.status === 'pending') {
    // 如果是开始签到，直接开始（这部分逻辑可能需要调整）
    item.status = 'active'
    message.success('签到已开始')
  }
}

// 确认停止签到
const confirmStopSignIn = async () => {
  if (!currentItem.value) return

  stopLoading.value = true
  try {
    const res = await stopSignIn(currentItem.value.id)
    if (res.code === 200) {
      message.success('签到已成功结束')
      // 重新获取最新数据
      fetchSignInList()
    } else {
      message.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('停止签到失败:', error)
    message.error('停止签到失败')
  } finally {
    stopLoading.value = false
    dialogs.confirm.visible = false
    currentItem.value = null
  }
}

// 处理新建签到
const handleSignInCreated = () => {
  dialogs.create.visible = false
  message.success('签到创建成功')
  fetchSignInList() // 重新获取最新的签到列表
}

// 获取状态对应的 Element Plus 标签类型
const getStatusTagType = status => {
  switch (status) {
    case 'active':
      return 'success'
    case 'pending':
      return 'warning'
    case 'ended':
      return 'info'
    default:
      return ''
  }
}

const getStatusText = status => {
  switch (status) {
    case 'active':
      return '进行中'
    case 'pending':
      return '未开始'
    case 'ended':
      return '已结束'
    default:
      return '未知'
  }
}

onMounted(() => {
  fetchSignInList()
})
</script>
