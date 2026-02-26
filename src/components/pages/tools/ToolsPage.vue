<script setup lang="ts">
import { onMounted } from 'vue';
import { useToolStore } from '@/stores/tools';
import BasePage from '../BasePage.vue';
import ToolCard from './ToolCard.vue';

const tools = useToolStore()

onMounted(() => tools.fetchTools())
</script>

<template>
  <BasePage>
    <ToolCard v-for="tool of tools.tools" :key="tool.id" :tool-id="tool.id" />
  </BasePage>
</template>