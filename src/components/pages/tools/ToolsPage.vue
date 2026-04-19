<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useToolStore } from '@/stores/tools';
import { useOluStore } from '@/stores/olu';
import BasePage from '../BasePage.vue';
import ToolCardGroup from './ToolCardGroup.vue';
import SearchBar from '@/components/misc/SearchBar.vue';
import Fuse from 'fuse.js';
import FancyText from '@/components/misc/FancyText.vue';
import TopBarButton from './TopBarButton.vue';
import { useFullscreen } from '@vueuse/core';
import { getSavedata } from '@/composables/savedata';
import { useSavedataStore } from '@/stores/savedata';
import { useSettingsStore } from '@/stores/settings';
import { formatText } from '@/composables/format';

const toolStore = useToolStore()
const savedataStore = useSavedataStore()
const settingsStore = useSettingsStore()

const visibleTools = computed(() =>
  settingsStore.hideBadGuys
    ? toolStore.tools.filter((t: Tool) => !t.categories.some((c: string) => c === formatText('CQ4bExYK')))
    : toolStore.tools
)

const iframeContainer = ref<HTMLElement | null>(null)
const { toggle: toggleFullscreen } = useFullscreen(iframeContainer)
const iframeEl = ref<HTMLIFrameElement | null>(null)

const imagesLoaded = ref(0)
const loading = computed(() => toolStore.loading || imagesLoaded.value < toolStore.tools.length)
const query = ref('')

async function onMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin) return
  const { type, toolId, data } = event.data ?? {}

  if (type === 'savedata:snapshot') {
    if (data && Object.keys(data).length > 0 && savedataStore.getCached(toolId) === null) savedataStore.setCached(toolId, data)
  } else if (type === 'savedata:request') {
    const saved = await getSavedata(toolId)
    iframeEl.value?.contentWindow?.postMessage({ type: 'savedata:load', data: saved ?? {} }, '*')
  } else if (type === 'savedata:save') {
    savedataStore.setCached(toolId, data)
  }
}

watch(() => toolStore.activeTool, (tool) => {
  if (!tool) return
  const cached = savedataStore.getCached(tool.id)
  if (!cached) return
  const prefix = `t${tool.id}:`
  for (const [key, value] of Object.entries(cached)) {
    localStorage.setItem(prefix + key, value)
  }
})

onMounted(() => {
  toolStore.fetchTools()
  window.addEventListener('message', onMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', onMessage)
})

function openExternal() {
  const w = window.open()!

  w.document.body.style.margin = "0";
  w.document.body.style.padding = "0";
  w.document.body.style.overflow = "hidden";

  const iframe = w.document.createElement('iframe')
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  iframe.src = `/api/res/${toolStore.activeTool!.id}/index.html`
  
  w.document.body.appendChild(iframe)
}

const fuse = computed(() => new Fuse(visibleTools.value, {
  keys: [
    { name: 'title', weight: 3 },
    { name: 'searchTerms', weight: 1 }
  ],
  threshold: 0.4
}))

const pinnedTools = computed(() =>
  visibleTools.value.filter((tool: Tool) => tool.id > -100 && tool.id < -50)
)

const searchResults = computed(() => {
  if (!query.value.trim()) return null

  const results = fuse.value.search(query.value).map(r => r.item)
  const pinnedIds = new Set(pinnedTools.value.map((t: Tool) => t.id))
  const merged = [...pinnedTools.value, ...results.filter((t: Tool) => !pinnedIds.has(t.id))]
  return merged
})

const oluStore = useOluStore()

const featuredTools = computed(() => visibleTools.value.filter((tool: Tool) => tool.isFeatured))
</script>

<template>
  <!-- Menu -->
  <BasePage v-if="!toolStore.activeTool" class="p-5" :loading="loading">
      <div name="search-area" class="flex gap-3 mb-3">
        <img src="/icons/search.svg" class="w-6">
        <SearchBar @textChanged="query = $event" />
      </div>

      <ToolCardGroup v-if="searchResults" :tools="searchResults" @loaded="imagesLoaded++" />
      <template v-else>
        <h1 class="tool-section">Featured</h1>
        <ToolCardGroup :tools="featuredTools" @loaded="imagesLoaded++" />

        <h1 class="tool-section">All Tools</h1>
        <ToolCardGroup :tools="visibleTools" @loaded="imagesLoaded++" />
        
        <p class="text-xl text-center">online users: {{ oluStore.onlineUsers }}</p>
      </template>
  </BasePage>

  <!-- Tool view -->
  <BasePage v-else class="flex flex-col">
    <div class="flex items-center gap-2 px-3 py-2 bg-base shrink-0 max-h-10">
      <TopBarButton iconPath="/icons/exit.svg" @click="() => {
        toolStore.openTool(null)
        imagesLoaded = 0
      }" />
      <FancyText :content="toolStore.activeTool.title" :size="20" />
      <TopBarButton iconPath="/icons/fullscreen.svg" @click="toggleFullscreen" />
      <TopBarButton iconPath="/icons/external.svg" @click="openExternal" />
    </div>
    <hr class="m-0">
    <div ref="iframeContainer" class="flex-1 min-h-0 flex items-center justify-center overflow-hidden bg-black">
      <iframe
        v-if="toolStore.activeTool"
        ref="iframeEl"
        :key="toolStore.activeTool.id"
        :src="`/api/res/${toolStore.activeTool.id}/index.html`"
        class="border-none w-full h-full"
        :style="{
          aspectRatio: toolStore.activeTool.aspectRatio,
          maxHeight: '100%',
          maxWidth: '100%',
          width: `min(100%, calc(100vh * ${toolStore.activeTool.aspectRatio}))`,
          height: `min(100%, calc(100vw / ${toolStore.activeTool.aspectRatio}))`
        }"
      />
    </div>
  </BasePage>
</template>

<style scoped>
  @reference "../../../main.css";

  .tool-section {
    @apply text-3xl font-bold mb-3 text-center;
  }
</style>