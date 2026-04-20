<script setup lang="ts">
import BasePage from '../BasePage.vue';

</script>

<template>
  <BasePage>
    <iframe
      src="/api/mx/"
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    />
  </BasePage>
</template>