<template>
  <v-app>
    <v-app-bar
      color="primary"
      dark
      elevation="2"
    >
      <v-app-bar-title>
        <v-icon class="mr-2">mdi-music-note</v-icon>
        日本語韻生成アプリ
      </v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="8" lg="6">
            <RhymeForm @rhyme-generated="handleRhymeGenerated" />
            <RhymeResult 
              v-if="rhymeResult" 
              :result="rhymeResult"
              :loading="loading"
              :error="error"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
interface RhymeResponse {
  word: string
  rhymes: string
  timestamp: string
}

const rhymeResult = ref<RhymeResponse | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const handleRhymeGenerated = (result: RhymeResponse) => {
  rhymeResult.value = result
  loading.value = false
  error.value = null
}

const handleLoading = (isLoading: boolean) => {
  loading.value = isLoading
  if (isLoading) {
    error.value = null
  }
}

const handleError = (errorMessage: string) => {
  error.value = errorMessage
  loading.value = false
}

provide('handleLoading', handleLoading)
provide('handleError', handleError)
</script>
