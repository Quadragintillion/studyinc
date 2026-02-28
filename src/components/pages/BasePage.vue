<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import LoadingIcon from '../misc/LoadingIcon.vue'

const props = defineProps<{ loading?: boolean }>()

const pageReady = ref(props.loading === false)

onMounted(() => {
  if (props.loading === false) {
    pageReady.value = true
    return
  }
  if (document.readyState === 'complete') {
    pageReady.value = true
  } else {
    window.addEventListener('load', () => { pageReady.value = true }, { once: true })
  }
})

const loading = computed(() => !pageReady.value || (props.loading ?? false))
</script>

<template>
  <div id="page" class="styled-background full-height w-full rounded-3xl relative overflow-y-auto">
    <Transition name="fade">
      <div v-if="loading" class="absolute inset-0 z-40 flex items-center justify-center styled-background rounded-3xl">
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