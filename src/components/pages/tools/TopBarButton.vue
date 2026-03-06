<script setup lang="ts">
  const props = defineProps({
    iconPath: String
  })
</script>

<template>
  <div class="cursor-pointer rounded-md styled-icon-btn">
    <img class="w-4 m-1 aspect-square" :src="iconPath">
  </div>
</template>