<script setup lang="ts">
import SidebarButton from './SidebarButton.vue';

</script>

<template>
  <nav id="sidebar" class="styled-background full-height flex flex-col items-start p-2 gap-3 w-max rounded-full">
    <img src="/favicon.ico" class="w-14 mb-4 aspect-square" />
    <SidebarButton name="Study Tools" icon-path="/icons/tools.svg" selected />
    <SidebarButton name="Notes" icon-path="/icons/notes.svg" />
    <SidebarButton name="Videos" icon-path="/icons/videos.svg" />
    <SidebarButton name="Tutoring" icon-path="/icons/tutoring.svg" />
  </nav>
</template>