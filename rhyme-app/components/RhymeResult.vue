<template>
  <v-card v-if="result || loading || error" elevation="3">
    <v-card-title class="bg-success text-white">
      <v-icon class="mr-2">mdi-music-note-outline</v-icon>
      韻の生成結果
    </v-card-title>

    <v-card-text class="pa-6">
      <!-- ローディング状態 -->
      <div v-if="loading" class="text-center py-8">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
          class="mb-4"
        />
        <p class="text-h6 text-medium-emphasis">
          「{{ result?.word }}」の韻を生成中...
        </p>
        <p class="text-body-2 text-medium-emphasis">
          AIが最適な韻を考えています
        </p>
      </div>

      <!-- エラー状態 -->
      <v-alert
        v-else-if="error"
        type="error"
        class="mb-4"
        prominent
        border="start"
      >
        <v-alert-title>エラーが発生しました</v-alert-title>
        {{ error }}
      </v-alert>

      <!-- 結果表示 -->
      <div v-else-if="result && !loading">
        <v-chip
          color="primary"
          variant="tonal"
          size="large"
          class="mb-4"
        >
          <v-icon class="mr-2">mdi-target</v-icon>
          元の言葉: {{ result.word }}
        </v-chip>

        <v-divider class="my-4" />

        <div class="rhyme-content">
          <h3 class="text-h6 mb-3 text-primary">
            <v-icon class="mr-2">mdi-music-clef-treble</v-icon>
            韻を踏む言葉の提案
          </h3>
          
          <div class="rhyme-text">
            <pre class="text-body-1">{{ result.rhymes }}</pre>
          </div>
        </div>

        <v-divider class="my-4" />

        <div class="d-flex justify-space-between align-center">
          <v-chip
            variant="outlined"
            size="small"
            color="secondary"
          >
            <v-icon class="mr-1" size="small">mdi-clock-outline</v-icon>
            {{ formatTimestamp(result.timestamp) }}
          </v-chip>

          <v-btn
            color="primary"
            variant="text"
            @click="copyToClipboard"
          >
            <v-icon class="mr-2">mdi-content-copy</v-icon>
            結果をコピー
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface RhymeResponse {
  word: string
  rhymes: string
  timestamp: string
}

interface Props {
  result: RhymeResponse | null
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null
})

const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const copyToClipboard = async () => {
  if (!props.result) return

  const textToCopy = `元の言葉: ${props.result.word}\n\n${props.result.rhymes}`
  
  try {
    await navigator.clipboard.writeText(textToCopy)
    
    // 成功時の通知
    const { $toast } = useNuxtApp()
    $toast.success('結果をクリップボードにコピーしました')
  } catch (err) {
    console.error('クリップボードへのコピーに失敗:', err)
    const { $toast } = useNuxtApp()
    $toast.error('クリップボードへのコピーに失敗しました')
  }
}
</script>

<style scoped>
.rhyme-content {
  background-color: rgb(var(--v-theme-surface-variant));
  border-radius: 8px;
  padding: 16px;
}

.rhyme-text pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Noto Sans JP', sans-serif;
  line-height: 1.6;
  margin: 0;
  color:#fff;
}

.v-chip {
  margin: 2px;
}
</style>