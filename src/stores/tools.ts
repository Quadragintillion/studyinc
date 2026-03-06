import { ref } from 'vue'
import { defineStore } from 'pinia'
import { formatText } from '@/composables/format'

export const useToolStore = defineStore('tools', () => {
  const tools = ref<Tool[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTools(): Promise<Tool[]> {
    loading.value = true
    error.value = null
    try {
      const res = await fetch('/api/res/index.json')
      if (!res.ok) throw new Error(`${res.status}`)
      const raw = await res.json() as any[] // generically type so we can change aspectRatio to a number

      tools.value = raw.map(t => ({
        ...t,
        title: formatText(t.title),
        aspectRatio: t.aspectRatio ? eval(t.aspectRatio) : t.aspectRatio
      })).filter((tool) => tool.id > -100)

      tools.value.sort((a: Tool, b: Tool) => {
        if (a.id < 0 && a.id < b.id) return -1
        return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1 // sort alphabetically
      })
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }

    return tools.value
  }

  const activeTool = ref<Tool | null>(null)

  function openTool(id: number | null) {
    activeTool.value = id === null ? null : (tools.value.find(t => t.id === id) ?? null)
  }

  return { tools, loading, error, fetchTools, activeTool, openTool }
})
