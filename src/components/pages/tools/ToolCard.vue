<script setup lang="ts">
const props = defineProps({ toolId: Number })
const emit = defineEmits(['loaded'])
</script>

<template>
  <img class="w-40 rounded-xl drop-shadow-slate-900 drop-shadow-xl cursor-pointer transition-transform duration-200 hover:scale-105 hover:-translate-y-2" :src="`https://dazzlbit.com/api/res/thumbs/${toolId}/vert.jpg`" @load="emit('loaded')" @error="emit('loaded')">
</template>