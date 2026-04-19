<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps({
  content: String!,
  size: Number,
  autoWidth: Boolean,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  const canvas = canvasRef.value!
  const dpr = window.devicePixelRatio || 1
  const cssH = canvas.parentElement!.clientHeight

  const probe = document.createElement('canvas').getContext('2d')!
  probe.font = `${props.size || 15}px sans`
  const measured = probe.measureText(props.content!)

  const cssW = props.autoWidth
    ? Math.ceil(measured.width) + 2
    : canvas.parentElement!.clientWidth

  canvas.width = cssW * dpr
  canvas.height = cssH * dpr
  canvas.style.width = `${cssW}px`
  canvas.style.height = `${cssH}px`

  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)
  ctx.font = `${props.size || 15}px sans`
  ctx.fillStyle = 'white'
  ctx.textBaseline = 'alphabetic'

  // Center vertically on actual glyph bounds
  const m = ctx.measureText(props.content!)
  const glyphH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
  const y = (cssH - glyphH) / 2 + m.actualBoundingBoxAscent

  if (props.autoWidth) {
    ctx.fillText(props.content!, 0, y)
  } else {
    ctx.textAlign = 'center'
    ctx.fillText(props.content!, cssW / 2, y)
  }
})
</script>
<template>
  <canvas ref="canvasRef" :class="autoWidth ? 'block' : 'flex-1 min-w-0'" />
</template>
