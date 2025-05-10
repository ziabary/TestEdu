<template>
  <el-dialog
    v-model="show"
    :title="title"
    width="30%"
    :before-close="cancel"
  >
      <p class="mb-4">{{ message }}</p>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">{{ t('common.cancel') }}</el-button>
        <el-button type="danger" @click="confirm">{{ t('common.confirm') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  title: string
  message: string
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const show = ref(true)

const confirm = () => {
  emit('confirm')
  show.value = false
}

const cancel = () => {
  emit('cancel')
  show.value = false
}
</script>
