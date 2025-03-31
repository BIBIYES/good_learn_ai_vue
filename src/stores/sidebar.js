import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    isOpen: false
  }),
  actions: {
    toggleSidebar() {
      this.isOpen = !this.isOpen
    }
  }
})