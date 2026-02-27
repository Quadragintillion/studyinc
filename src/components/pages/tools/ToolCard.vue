<script setup lang="ts">
  const props = defineProps({ toolId: Number })
  const emit = defineEmits(['loaded'])
</script>

<template>
  <div id="card-holder" class="m-5">
    <img class="w-40 rounded-xl drop-shadow-slate-900 drop-shadow-xl cursor-pointer" :src="`https://dazzlbit.com/api/res/thumbs/${toolId}/vert.jpg`" @load="emit('loaded')" @error="emit('loaded')">
  </div>
</template>