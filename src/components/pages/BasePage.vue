<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LoadingIcon from '../misc/LoadingIcon.vue'

const loading = ref(true)

onMounted(() => {
  if (document.readyState === 'complete') {
    loading.value = false
  } else {
    window.addEventListener('load', () => { loading.value = false }, { once: true })
  }
})
</script>

<template>
  <div id="page" class="styled-background full-height w-full rounded-3xl relative overflow-hidden">
    <Transition name="fade">
      <div v-if="loading" class="absolute inset-0 z-50 flex items-center justify-center styled-background rounded-3xl">
        <LoadingIcon />
      </div>
    </Transition>
    <slot />
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