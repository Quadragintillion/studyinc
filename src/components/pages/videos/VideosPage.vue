<script setup lang="ts">
import BasePage from '../BasePage.vue';

</script>

<template>
  <BasePage>
    <video class="h-full w-full" controls>
      <source :src="`videos/${Math.round(Math.random() * 9) + 1}.mp4`" type="video/mp4">
      Your browser has the video tag disabled :(
    </video>
  </BasePage>
</template>