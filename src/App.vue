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
import { onMounted, onUnmounted, ref } from 'vue';
import Popup from './components/popups/Popup.vue';

const pageStore = usePageStore()
const oluStore = useOluStore()

const showMOTD = ref(false)

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

    <Popup :show="showMOTD" v-on:close="showMOTD = false">
      <p class="mr-5">due to some stuff my hosting provider is doing, the site will temporarily be down in the morning on april 10 (friday) from 2am-10am CDT. just letting y'all know in advance kuz ik you guys are most active at like 7am</p>
    </Popup>
  </div>
</template>
