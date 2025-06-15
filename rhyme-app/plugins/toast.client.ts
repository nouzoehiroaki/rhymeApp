export default defineNuxtPlugin(() => {
  const toast = {
    success: (message: string) => {
      // 簡単なtoast実装（後で改善可能）
      console.log('✅ Success:', message)
      if (typeof window !== 'undefined') {
        alert('✅ ' + message)
      }
    },
    error: (message: string) => {
      console.error('❌ Error:', message)
      if (typeof window !== 'undefined') {
        alert('❌ ' + message)
      }
    },
    info: (message: string) => {
      console.info('ℹ️ Info:', message)
      if (typeof window !== 'undefined') {
        alert('ℹ️ ' + message)
      }
    }
  }

  return {
    provide: {
      toast
    }
  }
})