<script setup lang="ts">
import SidebarButton from './SidebarButton.vue';

</script>

<template>
  <nav id="sidebar" class="styled-background full-height flex flex-col items-start p-2 gap-3 w-max rounded-3xl">
    <img src="/favicon.ico" class="w-14 mb-4 aspect-square" />
    <SidebarButton name="Tools" pageName="Study Tools" icon-path="/icons/nav/tools.svg" />
    <SidebarButton name="Calculator" pageName="Calculator" icon-path="/icons/nav/calculator.svg" />
    <SidebarButton name="Notes" pageName="Notes" icon-path="/icons/nav/notes.svg" />
    <SidebarButton name="Tutoring" pageName="Tutoring" icon-path="/icons/nav/tutoring.svg" />

    <SidebarButton name="Account" pageName="Account" icon-path="/icons/nav/account.svg" class="mt-auto" />
    <SidebarButton name="Settings" pageName="Settings" icon-path="/icons/nav/settings.svg" />
  </nav>
</template>