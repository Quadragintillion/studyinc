<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ToolsPage from './components/pages/tools/ToolsPage.vue'
import Sidebar from './components/sidebar/Sidebar.vue'
import LoadingIcon from './components/misc/LoadingIcon.vue'

const loading = ref(true);

onMounted(() => {
  if (document.readyState === 'complete') {
    loading.value = false
  } else {
    window.addEventListener('load', () => { loading.value = false; }, { once: true })
  }
})
</script>

<template>
  <Transition name="fade">
    <div v-if="loading" class="fixed inset-0 z-50 flex items-center justify-center styled-background">
      <LoadingIcon />
    </div>
  </Transition>
  <div class="flex m-3">
    <Sidebar class="mr-3" />
    <ToolsPage />
  </div>
</template>

<style scoped>
.fade-leave-active {
  transition: opacity 300ms ease-out;
}
.fade-leave-to {
  opacity: 0;
}
</style>
