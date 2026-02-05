<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('role.copyRoles')"
    width="500px"
    @close="handleClose"
  >
    <div class="copy-content">
      <el-form :model="form" label-width="100px">
        <el-form-item :label="$t('user.sourceUser')">
          <div class="user-info">
            <el-avatar :size="32" :src="sourceUser?.avatar">
              {{ sourceUser?.username?.charAt(0).toUpperCase() }}
            </el-avatar>
            <span>{{ sourceUser?.username }}</span>
          </div>
        </el-form-item>
        
        <el-form-item :label="$t('user.targetUsers')">
          <el-select v-model="form.targetUserIds" multiple filterable>
            <el-option
              v-for="user in availableUsers"
              :key="user.id"
              :label="user.username"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        {{ $t('common.confirm') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  sourceUser: any
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const { t } = useI18n()
const submitting = ref(false)
const availableUsers = ref([])

const form = reactive({
  targetUserIds: []
})

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleSubmit = async () => {
  submitting.value = true
  try {
    // TODO: API call
    ElMessage.success(t('role.copySuccess'))
    emit('success')
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  form.targetUserIds = []
  dialogVisible.value = false
}
</script>

<style scoped>
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>