<script setup lang="ts">
import ToolCard from './ToolCard.vue';

const props = defineProps<{
  tools: Tool[]
}>()

const emit = defineEmits(['loaded'])
</script>

<template>
  <div class="flex flex-wrap justify-center gap-5 mb-8">
    <ToolCard v-for="tool of tools" :key="tool.id" :tool-id="tool.id" @loaded="emit('loaded')" />
  </div>
</template>