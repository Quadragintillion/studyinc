<script setup lang="ts">
import ToolsPage from './components/pages/tools/ToolsPage.vue'
import Sidebar from './components/sidebar/Sidebar.vue'
import { usePageStore } from './stores/page';

const pageStore = usePageStore()
</script>

<template>
  <div class="flex m-3">
    <Sidebar class="mr-3" />
    <ToolsPage v-if="pageStore.page == 'Study Tools'" />
  </div>
</template>
