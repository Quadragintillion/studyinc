<script setup lang="ts">
import Popup from './Popup.vue'
defineProps<{ show: boolean; message: string }>()
defineEmits<{ confirm: []; close: [] }>()
</script>

<template>
  <Popup :show="show" @close="$emit('close')">
    <p class="text-center mb-5 pr-4">{{ message }}</p>
    <div class="flex gap-2">
      <button
        class="styled-btn px-4 py-2 rounded-lg font-semibold h-10 flex-1"
        @click="$emit('confirm')"
      >
        Yes
      </button>
      <button
        class="styled-btn px-4 py-2 rounded-lg font-semibold h-10 flex-1"
        @click="$emit('close')"
      >
        No
      </button>
    </div>
  </Popup>
</template>
