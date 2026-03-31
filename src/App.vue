<script setup lang="ts">
import AccountPage from './components/pages/accounts/AccountPage.vue';
import NotesPage from './components/pages/notes/NotesPage.vue';
import SettingsPage from './components/pages/settings/SettingsPage.vue';
import ToolsPage from './components/pages/tools/ToolsPage.vue'
import TutoringPage from './components/pages/tutoring/TutoringPage.vue';
import VideosPage from './components/pages/videos/VideosPage.vue';
import Sidebar from './components/sidebar/Sidebar.vue'
import { usePageStore } from './stores/page';
import { useOluStore } from './stores/olu';
import { onMounted, onUnmounted } from 'vue';

const pageStore = usePageStore()
const oluStore = useOluStore()

let oluInterval: ReturnType<typeof setInterval>

onMounted(() => {
  oluStore.fetchOnlineUsers()
  oluInterval = setInterval(oluStore.fetchOnlineUsers, 10000)
})

onUnmounted(() => clearInterval(oluInterval))
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
