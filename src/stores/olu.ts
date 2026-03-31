import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useOluStore = defineStore('olu', () => {
  const onlineUsers = ref('loading...')

  async function fetchOnlineUsers() {
    try {
      const response = await fetch('/api/olu')
      onlineUsers.value = await response.text()
    } catch {
      onlineUsers.value = 'unknown'
    }
  }

  return { onlineUsers, fetchOnlineUsers }
})
