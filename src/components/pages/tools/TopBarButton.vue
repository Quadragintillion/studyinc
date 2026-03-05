<script setup lang="ts">
  const props = defineProps({
    iconPath: String
  })
</script>

<template>
  <div class="rounded-md styled-icon-btn">
    <img class="w-4 m-1 cursor-pointer aspect-square" :src="iconPath">
  </div>
</template>