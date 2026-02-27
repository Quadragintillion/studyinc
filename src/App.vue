<script setup lang="ts">
import AccountPage from './components/pages/AccountPage.vue';
import NotesPage from './components/pages/NotesPage.vue';
import SettingsPage from './components/pages/SettingsPage.vue';
import ToolsPage from './components/pages/tools/ToolsPage.vue'
import TutoringPage from './components/pages/TutoringPage.vue';
import VideosPage from './components/pages/VideosPage.vue';
import Sidebar from './components/sidebar/Sidebar.vue'
import { usePageStore } from './stores/page';

const pageStore = usePageStore()
</script>

<template>
  <div class="flex m-3">
    <Sidebar class="mr-3" />

    <ToolsPage v-if="pageStore.page == 'Study Tools'" />
    <VideosPage v-if="pageStore.page == 'Videos'" />
    <NotesPage v-if="pageStore.page == 'Notes'" />
    <TutoringPage v-if="pageStore.page == 'Tutoring'" />
    <AccountPage v-if="pageStore.page == 'Account'" />
    <SettingsPage v-if="pageStore.page == 'Settings'" />
  </div>
</template>
