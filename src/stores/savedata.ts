import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { getSavedataRaw, setSavedata } from '@/composables/savedata'

const STORAGE_KEY = 'savedata_cache'

function loadFromStorage(): Map<number, Record<string, string>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Map()
    const obj = JSON.parse(raw) as Record<string, Record<string, string>>
    return new Map(Object.entries(obj).map(([k, v]) => [parseInt(k, 10), v]))
  } catch {
    return new Map()
  }
}

function saveToStorage(cache: Map<number, Record<string, string>>) {
  const obj: Record<number, Record<string, string>> = {}
  for (const [k, v] of cache) obj[k] = v
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
}

export const useSavedataStore = defineStore('savedata', () => {
  const cache = ref<Map<number, Record<string, string>>>(loadFromStorage())

  type BulkOp = 'save' | 'load' | null
  const bulkOp = ref<BulkOp>(null)
  const bulkTotal = ref(0)
  const bulkDone = ref(0)

  watch(cache, (val) => saveToStorage(val), { deep: true })

  function getCached(toolId: number): Record<string, string> | null {
    return cache.value.get(toolId) ?? null
  }

  function setCached(toolId: number, data: Record<string, string>) {
    cache.value.set(toolId, data)
    saveToStorage(cache.value)
  }

  async function saveAll(toolIds: number[]) {
    bulkOp.value = 'save'
    bulkTotal.value = toolIds.length
    bulkDone.value = 0

    await Promise.all(
      toolIds.map(async (id) => {
        const data = cache.value.get(id)
        if (data) await setSavedata(id, data)
        bulkDone.value++
      })
    )

    bulkOp.value = null
  }

  async function loadAll(toolIds: number[]) {
    bulkOp.value = 'load'
    bulkTotal.value = toolIds.length
    bulkDone.value = 0

    await Promise.all(
      toolIds.map(async (id) => {
        const data = await getSavedataRaw(id)
        if (data !== null) cache.value.set(id, data)
        bulkDone.value++
      })
    )

    saveToStorage(cache.value)
    bulkOp.value = null
  }

  function exportToJson(toolIds: number[]): void {
    const out: Record<number, Record<string, string>> = {}
    for (const id of toolIds) {
      const data = cache.value.get(id)
      if (data) out[id] = data
    }
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'savedata.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function importFromJson(toolIds: number[], json: Record<string, Record<string, string>>): void {
    for (const [key, data] of Object.entries(json)) {
      const id = parseInt(key, 10)
      if (!isNaN(id) && toolIds.includes(id)) {
        cache.value.set(id, data)
      }
    }
    saveToStorage(cache.value)
  }

  function reset() {
    cache.value.clear()
    saveToStorage(cache.value)
    bulkOp.value = null
    bulkTotal.value = 0
    bulkDone.value = 0
  }

  return {
    cache,
    bulkOp, bulkTotal, bulkDone,
    getCached, setCached,
    saveAll, loadAll,
    exportToJson, importFromJson,
    reset,
  }
})
