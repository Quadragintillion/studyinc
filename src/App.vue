<script setup lang="ts">
import AccountPage from './components/pages/accounts/AccountPage.vue';
import NotesPage from './components/pages/notes/NotesPage.vue';
import SettingsPage from './components/pages/settings/SettingsPage.vue';
import ToolsPage from './components/pages/tools/ToolsPage.vue'
import CalculatorPage from './components/pages/calculator/CalculatorPage.vue';
import TutoringPage from './components/pages/tutoring/TutoringPage.vue';
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
    <CalculatorPage v-if="pageStore.page == 'Calculator'" />
    <NotesPage v-if="pageStore.page == 'Notes'" />
    <TutoringPage v-if="pageStore.page == 'Tutoring'" />
    <AccountPage v-if="pageStore.page == 'Account'" />
    <SettingsPage v-if="pageStore.page == 'Settings'" />

    <Popup :show="showMOTD" v-on:close="showMOTD = false">
      <h2 class="text-lg mr-7 mb-2"><b>Notes tab temporarily disabled</b></h2>
      <p class="mr-7 mb-2">Y'all are currently using so much data that the site will literally be forced to shut down in a week unless I disable the notes tab.</p>
      <img src="/network.png" class="w-96 mb-2">
      <p class="mr-7 mb-2">I can upgrade the server and have unlimited data, however that costs $60 and I currently don't make any money off this site so please donate if you can (<a href="https://ko-fi.com/dragin" class="text-sky-500 dark:text-sky-500 underline">ko-fi.com/dragin</a>)</p>
      <p class="mr-7">I'll turn the notes tab back on either on May 4 (when the usage limit resets) or when I raise enough to upgrade the server</p>
    </Popup>
  </div>
</template>
