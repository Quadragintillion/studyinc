<script setup lang="ts">
import BasePage from '../BasePage.vue'
import FancyText from '@/components/misc/FancyText.vue'
import { formatText } from '@/composables/format'
</script>

<template>
  <BasePage class="flex items-center justify-center">
    <div class="h-8 flex items-center px-4">
      <FancyText :content="formatText('MAcGFUQfDgEBTwcHF08NAwEBTxIBAh8JFg4dDwgWTwINHA4ECAoLRhcGAQUBTwYSRAIOAgFPGw4BTxwPEApPMCE9NkYBDhwfRBsARgAKGwMHG0AECAAMDQ==')" :size="16" auto-width />
    </div>
  </BasePage>
</template>
