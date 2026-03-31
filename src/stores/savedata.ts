import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getSavedataRaw, setSavedata } from '@/composables/savedata'

export const useSavedataStore = defineStore('savedata', () => {
  const cache = ref<Map<number, Record<string, string>>>(new Map())

  type BulkOp = 'save' | 'load' | null
  const bulkOp = ref<BulkOp>(null)
  const bulkTotal = ref(0)
  const bulkDone = ref(0)

  function getCached(toolId: number): Record<string, string> | null {
    return cache.value.get(toolId) ?? null
  }

  function setCached(toolId: number, data: Record<string, string>) {
    cache.value.set(toolId, data)
  }

  // Collect all localStorage data across all tool origins.
  // Each tool stores data under its own iframe origin, so we read from
  // the parent's localStorage which is keyed by toolId via the bridge cache.
  // For export/import we use the in-memory cache as the source of truth.

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
  }

  function reset() {
    cache.value.clear()
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
