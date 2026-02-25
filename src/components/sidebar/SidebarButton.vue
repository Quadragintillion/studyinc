<script setup lang="ts">
  const props = defineProps({
    name: String,
    iconPath: String,
    pageId: String,
    selected: Boolean
  })
</script>

<template>
  <img :class="['p-1 w-14 cursor-pointer rounded-xl aspect-square', props.selected ? 'styled-btn-selected' : 'styled-icon-btn']" :src="iconPath">
</template>