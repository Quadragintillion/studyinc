<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToolStore } from '@/stores/tools';
import BasePage from '../BasePage.vue';
import ToolCardGroup from './ToolCardGroup.vue';
import SearchBar from '@/components/misc/SearchBar.vue';
import Fuse from 'fuse.js';
import FancyText from '@/components/misc/FancyText.vue';
import TopBarButton from './TopBarButton.vue';

const toolStore = useToolStore()

const imagesLoaded = ref(0)
const loading = computed(() => toolStore.loading || imagesLoaded.value < toolStore.tools.length)
const query = ref('')

onMounted(() => toolStore.fetchTools())

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
  </BasePage>

  <!-- Tool view -->
  <BasePage v-else class="flex flex-col">
    <div class="flex items-center gap-2 px-3 py-2 bg-base shrink-0 max-h-10">
      <TopBarButton iconPath="/icons/exit.svg" @click="() => {
        toolStore.openTool(null)
        imagesLoaded = 0
      }" />
      <FancyText content="test" :size="20" />
    </div>
    <hr class="m-0">
    <div class="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
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