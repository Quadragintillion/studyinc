<script setup lang="ts">
import { useToolStore } from '@/stores/tools';

const props = defineProps({ toolId: Number, externalLink: String })
const emit = defineEmits(['loaded'])

const toolStore = useToolStore()

function openExternal() {
  window.open(props.externalLink!)
}
</script>

<template>
  <img
    class="w-40 rounded-xl drop-shadow-slate-500 dark:drop-shadow-slate-900 drop-shadow-xl cursor-pointer transition-transform duration-200 hover:scale-103 hover:-translate-y-1"
    :src="`/api/res/thumbs/${toolId}/vert.jpg?cb=1`"
    @load="emit('loaded')"
    @error="emit('loaded')"
    @click="() => {
      if (externalLink) openExternal()
      else toolStore.openTool(toolId ?? null)
    }"
  >
</template>