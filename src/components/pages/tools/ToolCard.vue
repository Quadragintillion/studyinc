<script setup lang="ts">
  const props = defineProps({
    toolId: Number
  })
</script>

<template>
  <div id="card-holder" class="m-5">
    <img class="w-40 rounded-xl drop-shadow-slate-950 shadow-md" :src="`https://dazzlbit.com/api/res/thumbs/${toolId}/vert.jpg`">
  </div>
</template>