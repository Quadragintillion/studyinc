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
const motdText = ref('')

let oluInterval: ReturnType<typeof setInterval>

onMounted(async () => {
  oluStore.fetchOnlineUsers()
  oluInterval = setInterval(oluStore.fetchOnlineUsers, 10000)

  try {
    const res = await fetch(`/api/motd?${Date.now()}`)
    if (res.ok) {
      motdText.value = await res.text()
      if (motdText.value.trim()) showMOTD.value = true
    }
  } catch {
    // no motd
  }
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
      <div class="mr-7" v-html="motdText"></div>
    </Popup>
  </div>
</template>
