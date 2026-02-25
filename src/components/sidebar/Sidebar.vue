<script setup lang="ts">
import SidebarButton from './SidebarButton.vue';

</script>

<template>
  <nav id="sidebar" class="styled-background full-height flex flex-col items-start p-2 gap-3 w-max rounded-3xl">
    <img src="/favicon.ico" class="w-14 mb-4 aspect-square" />
    <SidebarButton name="Study Tools" icon-path="/icons/nav/tools.svg" />
    <SidebarButton name="Videos" icon-path="/icons/nav/videos.svg" />
    <SidebarButton name="Notes" icon-path="/icons/nav/notes.svg" />
    <SidebarButton name="Tutoring" icon-path="/icons/nav/tutoring.svg" />

    <SidebarButton name="Account" icon-path="/icons/nav/account.svg" class="mt-auto" />
    <SidebarButton name="Settings" icon-path="/icons/nav/settings.svg" />
  </nav>
</template>