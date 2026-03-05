<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps({
  content: String!,
  size: Number
})

const canvasRef = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  const canvas = canvasRef.value!
  canvas.width = canvas.parentElement!.clientWidth
  canvas.height = canvas.parentElement!.clientHeight

  var ctx = canvas.getContext('2d')!
  ctx.font = `${props.size || 15}px sans`;
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'white'
  ctx.fillText(props.content!, canvas.width / 2, canvas.height / 2)
})
</script>
<template>
  <canvas ref="canvasRef" class="flex-1 min-w-0" />
</template>