import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', () => {
  const hideBadGuys = ref<boolean>(
    localStorage.getItem('settings_hideBadGuys') !== 'false'
  )

  watch(hideBadGuys, (val) => localStorage.setItem('settings_hideBadGuys', String(val)))

  return { hideBadGuys: hideBadGuys }
})
