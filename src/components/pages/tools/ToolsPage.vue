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
  <BasePage class="p-5" :loading="loading">
    <div name="search-area" class="flex gap-3 mb-3">
      <img src="/icons/search.svg" class="w-6">
      <SearchBar />
    </div>
    <h1 class="tool-section">Featured</h1>
    <ToolCardGroup :tools="toolStore.tools.filter((tool: Tool) => tool.isFeatured)" @loaded="imagesLoaded++" />
    <h1 class="tool-section">All Tools</h1>
    <ToolCardGroup :tools="toolStore.tools" @loaded="imagesLoaded++" />
  </BasePage>
</template>

<style scoped>
  @reference "../../../main.css";

  .tool-section {
    @apply text-3xl font-bold mb-3 text-center;
  }
</style>