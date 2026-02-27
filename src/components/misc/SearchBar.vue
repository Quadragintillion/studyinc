<script setup lang="ts">
  import { ref } from 'vue';

  const emit = defineEmits({ textChanged: String })
  const text = ref('')
  function onInput() {
    emit('textChanged', text.value)
  }
</script>

<template>
  <div name="search-wrapper">
    <input v-model="text" @input="onInput" placeholder="Search..." class="bg-slate-900 w-50 h-10 p-5 rounded-full">
  </div>
</template>