<script setup lang="ts">
import { usePageStore } from '@/stores/page';

const props = defineProps({
  name: String,
  iconPath: String,
  pageId: String
})

const pageStore = usePageStore()
</script>

<template>
  <div class="group relative" @click="pageStore.changePage(name!)" >
    <div :class="['rounded-2xl', pageStore.page == name ? 'styled-btn-selected' : 'styled-icon-btn']">
      <img class="p-2 w-14 cursor-pointer aspect-square" :src="iconPath">
    </div>
    <div class="tooltip z-50 pointer-events-none absolute left-full top-1/2 ml-3 px-3 py-1.5 rounded-lg bg-slate-400 dark:bg-zinc-800 text-white text-sm whitespace-nowrap">
      {{ name }}
    </div>
  </div>
</template>

<style scoped>
.tooltip {
  opacity: 0;
  transform: translateY(-50%) translateX(-6px);
  transition: opacity 100ms ease-in, transform 100ms ease-in;
}

.group:hover .tooltip {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
  transition: opacity 150ms ease-out, transform 150ms ease-out;
}
</style>