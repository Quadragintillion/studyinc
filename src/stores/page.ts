import { defineStore } from "pinia";
import { ref } from "vue";
import { useToolStore } from "./tools";

export const usePageStore = defineStore('page', () => {
  const page = ref('Study Tools') // Can be any of the names on the sidebar

  function changePage(newPage: string) {
    if (newPage == 'Study Tools') useToolStore().openTool(null)
    page.value = newPage
  }

  return { page, changePage }
})