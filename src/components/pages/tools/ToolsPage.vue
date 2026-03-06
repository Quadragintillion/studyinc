<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToolStore } from '@/stores/tools';
import BasePage from '../BasePage.vue';
import ToolCardGroup from './ToolCardGroup.vue';
import SearchBar from '@/components/misc/SearchBar.vue';
import Fuse from 'fuse.js';
import FancyText from '@/components/misc/FancyText.vue';
import TopBarButton from './TopBarButton.vue';
import { useFullscreen } from '@vueuse/core';

const toolStore = useToolStore()

const iframeContainer = ref<HTMLElement | null>(null)
const { toggle: toggleFullscreen } = useFullscreen(iframeContainer)

const imagesLoaded = ref(0)
const loading = computed(() => toolStore.loading || imagesLoaded.value < toolStore.tools.length)
const query = ref('')

onMounted(() => toolStore.fetchTools())

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

const fuse = computed(() => new Fuse(toolStore.tools, {
  keys: [
    { name: 'title', weight: 2 },
    { name: 'category', weight: 1 },
    { name: 'searchTerms', weight: 1.5 }
  ],
  threshold: 0.4
}))

const searchResults = computed(() =>
  query.value.trim()
    ? fuse.value.search(query.value).map(r => r.item)
    : null
)

const onlineUsers = ref('loading...')

onMounted(async () => {
  try {
    const response = await fetch('/api/olu')
    onlineUsers.value = await response.text()
  } catch (error) {
    onlineUsers.value = 'unknown'
  }
})

const featuredTools = computed(() => toolStore.tools.filter((tool: Tool) => tool.isFeatured))
</script>

<template>
  <!-- Menu -->
  <BasePage v-if="!toolStore.activeTool" class="p-5" :loading="loading">
      <div name="search-area" class="flex gap-3 mb-3">
        <img src="/icons/search.svg" class="w-6">
        <SearchBar @textChanged="query = $event" />
      </div>

      <template v-if="searchResults">
        <ToolCardGroup :tools="searchResults" @loaded="imagesLoaded++" />
      </template>
      <template v-else>
        <h1 class="tool-section">Featured</h1>
        <ToolCardGroup :tools="featuredTools" @loaded="imagesLoaded++" />

        <h1 class="tool-section">All Tools</h1>
        <ToolCardGroup :tools="toolStore.tools" @loaded="imagesLoaded++" />
      </template>

      <p class="text-xl text-center">online users: {{ onlineUsers }}</p>
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