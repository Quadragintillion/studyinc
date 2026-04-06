import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useToolStore } from './tools'

export const useOluStore = defineStore('olu', () => {
  const onlineUsers = ref('loading...')
  const toolStore = useToolStore()

  async function fetchOnlineUsers() {
    try {
      const response = await fetch(`/api/olu${toolStore.activeTool ? `?toolId=${toolStore.activeTool.id}` : ''}`)
      onlineUsers.value = await response.text()
    } catch {
      onlineUsers.value = 'unknown'
    }
  }

  return { onlineUsers, fetchOnlineUsers }
})
