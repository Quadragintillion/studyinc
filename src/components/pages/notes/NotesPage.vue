<script setup lang="ts">
import BasePage from '../BasePage.vue'
import FancyText from '@/components/misc/FancyText.vue'
import { formatText } from '@/composables/format'
</script>

<template>
  <BasePage class="flex items-center justify-center">
    <div class="flex flex-col items-center px-4">
      <div class="h-8 flex items-center">
        <FancyText :content="formatText('MAcGFUQfDgEBTwcHF08NAwEBTxIBAh8JFg4dDwgWTwINHA4ECAoLRhcGAQUBTwYSRAIOAgFPGw4BTxwPEApPMCE9NkYBDhwfRBsARgAKGwMHG0AECAAMDQ==')" :size="16" auto-width />
      </div>
      <div class="h-8 flex items-center">
        <FancyText :content="formatText('BQMcCUQJGghECQ4FEENPEgwGHEYNHAFBEE8dAwUDTxIBFxtHRBsdH0QcCgoBDBsPCghPDxBPVE8=')" auto-width />
      </div>
    </div>
  </BasePage>
</template>
