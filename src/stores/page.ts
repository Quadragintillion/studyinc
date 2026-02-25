import { defineStore } from "pinia";
import { ref } from "vue";

export const usePageStore = defineStore('page', () => {
  const page = ref('Study Tools') // Can be any of the names on the sidebar

  function changePage(newPage: string) {
    page.value = newPage
  }

  return { page, changePage }
})