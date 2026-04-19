<script setup lang="ts">
import BasePage from '../BasePage.vue';
import FancyText from '@/components/misc/FancyText.vue';
import { formatText } from '@/composables/format';
import { useSettingsStore } from '@/stores/settings';

const settingsStore = useSettingsStore()

function openExternal() {
  const w = window.open('about:blank', '_blank')!
  const iframe = w.document.createElement('iframe')
  iframe.src = window.location.href
  iframe.style.cssText = 'width:100%;height:100%;border:none;position:fixed;top:0;left:0;'
  w.document.body.style.margin = '0'
  w.document.body.appendChild(iframe)
}
</script>

<template>
  <BasePage>
    <div class="flex flex-col gap-5 p-8 max-w-sm">
      <h1 class="text-3xl font-bold text-white">Settings</h1>

      <button
        class="styled-btn px-4 py-2 rounded-lg font-semibold h-10 flex items-center gap-2 w-fit text-white"
        @click="openExternal"
      >
        <FancyText :content="formatText('BQ0AExBVDQoFAQQ=')" :size="14" auto-width />
      </button>

      <label class="flex items-center gap-4 cursor-pointer">
        <div class="h-5 shrink-0">
          <FancyText :content="formatText('LAYLA0QIDgsBHE8RDRsHRgkOGxMWCk8SDAoCAxc=')" :size="14" auto-width />
        </div>
        <button
          role="switch"
          :aria-checked="settingsStore.hideBadGuys"
          :class="['relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none', settingsStore.hideBadGuys ? 'bg-sky-500' : 'bg-slate-600']"
          @click="settingsStore.hideBadGuys = !settingsStore.hideBadGuys"
        >
          <span
            :class="['inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 self-center', settingsStore.hideBadGuys ? 'translate-x-5' : 'translate-x-0.5']"
          />
        </button>
      </label>
    </div>
  </BasePage>
</template>
