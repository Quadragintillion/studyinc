import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getSavedataRaw } from '@/composables/savedata'

export const useSavedataStore = defineStore('savedata', () => {
  const cache = ref<Map<number, Record<string, string>>>(new Map())

  // Preload progress: null = idle, number = loaded count, -1 = done
  const preloadTotal = ref(0)
  const preloadLoaded = ref(0)
  const preloadDone = ref(false)

  async function preloadAll(toolIds: number[]) {
    const ids = toolIds.filter(id => id > -100) // skip hidden tools (already filtered in tool store, but be safe)
    if (ids.length === 0) {
      preloadDone.value = true
      return
    }

    preloadTotal.value = ids.length
    preloadLoaded.value = 0
    preloadDone.value = false

    await Promise.all(
      ids.map(async (id) => {
        const data = await getSavedataRaw(id)
        if (data !== null) cache.value.set(id, data)
        preloadLoaded.value++
      })
    )

    preloadDone.value = true
  }

  function getCached(toolId: number): Record<string, string> | null {
    return cache.value.get(toolId) ?? null
  }

  function setCached(toolId: number, data: Record<string, string>) {
    cache.value.set(toolId, data)
  }

  function reset() {
    cache.value.clear()
    preloadTotal.value = 0
    preloadLoaded.value = 0
    preloadDone.value = false
  }

  return { cache, preloadTotal, preloadLoaded, preloadDone, preloadAll, getCached, setCached, reset }
})
