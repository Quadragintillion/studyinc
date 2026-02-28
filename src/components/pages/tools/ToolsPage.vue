<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToolStore } from '@/stores/tools';
import BasePage from '../BasePage.vue';
import ToolCardGroup from './ToolCardGroup.vue';
import SearchBar from '@/components/misc/SearchBar.vue';

const toolStore = useToolStore()

const imagesLoaded = ref(0)
const loading = computed(() => toolStore.loading || imagesLoaded.value < toolStore.tools.length)

onMounted(() => toolStore.fetchTools())
</script>

<template>
  <!-- Menu -->
  <BasePage v-if="!toolStore.activeTool" class="p-5" :loading="loading">
      <div name="search-area" class="flex gap-3 mb-3">
        <img src="/icons/search.svg" class="w-6">
        <SearchBar />
      </div>

      <h1 class="tool-section">Featured</h1>
      <ToolCardGroup :tools="toolStore.tools.filter((tool: Tool) => tool.isFeatured)" @loaded="imagesLoaded++" />
      
      <h1 class="tool-section">All Tools</h1>
      <ToolCardGroup :tools="toolStore.tools" @loaded="imagesLoaded++" />
  </BasePage>

  <!-- Tool view -->
  <BasePage v-else class="flex flex-col">
    <div class="flex items-center gap-2 px-3 py-2 bg-base shrink-0">
      <img src="/icons/exit.svg" class="w-4 cursor-pointer" @click="toolStore.openTool(null)">
      <span class="text-sm font-semibold text-white/80">{{ toolStore.activeTool?.name }}</span>
    </div>
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