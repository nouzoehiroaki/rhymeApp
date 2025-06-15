<template>
  <v-card class="mb-6" elevation="3">
    <v-card-title class="bg-primary text-white">
      <v-icon class="mr-2">mdi-microphone</v-icon>
      韻を踏む言葉を入力
    </v-card-title>
    
    <v-card-text class="pa-6">
      <v-form @submit.prevent="generateRhyme">
        <v-text-field
          v-model="inputWord"
          label="韻を踏みたい言葉"
          placeholder="例: さくら、愛、夢"
          variant="outlined"
          :rules="[rules.required, rules.japanese]"
          :loading="loading"
          :disabled="loading"
          prepend-inner-icon="mdi-format-text"
        />
        
        <v-btn
          type="submit"
          color="primary"
          size="large"
          block
          :loading="loading"
          :disabled="!inputWord.trim()"
          class="mt-4"
        >
          <v-icon class="mr-2">mdi-creation</v-icon>
          韻を生成する
        </v-btn>
      </v-form>
      
      <v-alert
        v-if="error"
        type="error"
        class="mt-4"
        dismissible
        @click:close="error = null"
      >
        {{ error }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface RhymeResponse {
  word: string
  rhymes: string
  timestamp: string
}

const emit = defineEmits<{
  'rhyme-generated': [result: RhymeResponse]
}>()

const handleLoading = inject('handleLoading') as (loading: boolean) => void
const handleError = inject('handleError') as (error: string) => void

const inputWord = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const rules = {
  required: (value: string) => !!value || '言葉を入力してください',
  japanese: (value: string) => {
    if (!value) return true
    const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/
    return japaneseRegex.test(value) || '日本語を入力してください'
  }
}

const generateRhyme = async () => {
  if (!inputWord.value.trim()) return

  loading.value = true
  error.value = null
  handleLoading(true)

  try {
    const response = await $fetch<{success: boolean, data: RhymeResponse}>('/api/rhyme', {
      method: 'POST',
      body: {
        word: inputWord.value.trim()
      }
    })

    if (response.success && response.data) {
      emit('rhyme-generated', response.data)
    } else {
      throw new Error('無効な応答形式です')
    }
  } catch (err: any) {
    const errorMessage = err.data?.message || err.statusMessage || err.message || '韻の生成に失敗しました'
    error.value = errorMessage
    handleError(errorMessage)
  } finally {
    loading.value = false
    handleLoading(false)
  }
}

// フォーカス時にエラーをクリア
watch(inputWord, () => {
  if (error.value) {
    error.value = null
  }
})
</script>