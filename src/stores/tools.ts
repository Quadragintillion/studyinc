import { ref } from 'vue'
import { defineStore } from 'pinia'

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
        aspectRatio: t.aspectRatio ? eval(t.aspectRatio) : t.aspectRatio
      }))

      tools.value.sort((a: Tool, b: Tool) => {
        return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1 // sort alphabetically
      })

      console.log(tools)
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }

    return tools.value
  }

  // encodes using xor
  function format(thing: string): string {
    const key = Uint8Array.from('doof', c => c.charCodeAt(0))
    const bytes = Uint8Array.from(atob(thing), c => c.charCodeAt(0))
    const out = bytes.map((b, i) => b ^ (key[i % key.length] ?? 0))
    return new TextDecoder().decode(out)
  }

  const activeTool = ref<Tool | null>(null)

  function openTool(id: number | null) {
    activeTool.value = id === null ? null : (tools.value.find(t => t.id === id) ?? null)
  }

  return { tools, loading, error, fetchTools, format, activeTool, openTool }
})
