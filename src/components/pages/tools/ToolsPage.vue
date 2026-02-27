<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToolStore } from '@/stores/tools';
import BasePage from '../BasePage.vue';
import ToolCard from './ToolCard.vue';

const tools = useToolStore()

const imagesLoaded = ref(0)
const loading = computed(() => tools.loading || imagesLoaded.value < tools.tools.length)

onMounted(() => tools.fetchTools())
</script>

<template>
  <BasePage :loading="loading">
    <ToolCard v-for="tool of tools.tools" :key="tool.id" :tool-id="tool.id" @loaded="imagesLoaded++" />
  </BasePage>
</template>