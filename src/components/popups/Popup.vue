<script setup lang="ts">
withDefaults(defineProps<{ showX?: boolean }>(), { showX: true })
defineEmits<{ close: [] }>()
</script>

<template>
  <Transition name="popup">
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />
      <div class="popup-card relative styled-background rounded-2xl p-6 shadow-2xl max-w-lg w-full mx-4 z-10">
        <button
          v-if="showX"
          class="styled-icon-btn absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer"
          @click="$emit('close')"
        >
          <img src="/icons/x.svg" class="w-4 h-4" />
        </button>
        <slot />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.popup-enter-active {
  transition: opacity 200ms ease-out;
}
.popup-enter-active .popup-card {
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}
.popup-enter-from {
  opacity: 0;
}
.popup-enter-from .popup-card {
  opacity: 0;
  transform: scale(0.92);
}

.popup-leave-active {
  transition: opacity 150ms ease-in;
}
.popup-leave-active .popup-card {
  transition: opacity 150ms ease-in, transform 150ms ease-in;
}
.popup-leave-to {
  opacity: 0;
}
.popup-leave-to .popup-card {
  opacity: 0;
  transform: scale(0.92);
}
</style>
