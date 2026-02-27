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
      tools.value = await res.json() as Tool[]
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }

    return tools.value
  }

  function format(thing: string): string {
    const key = Uint8Array.from('doof', c => c.charCodeAt(0))
    const bytes = Uint8Array.from(atob(thing), c => c.charCodeAt(0))
    const out = bytes.map((b, i) => b ^ (key[i % key.length] ?? 0))
    return new TextDecoder().decode(out)
  }

  return { tools, loading, error, fetchTools, format }
})
