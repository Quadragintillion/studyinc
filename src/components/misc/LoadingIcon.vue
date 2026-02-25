<template>
  <div
    class="relative inline-block shrink-0"
    :style="containerStyle"
    role="img"
    :aria-label="alt"
  >
    <div class="absolute top-0 left-0 square-1" :style="squareStyle" />
    <div class="absolute top-0 left-0 square-2" :style="squareStyle" />
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

interface Props {
  /** Equivalent to <img alt="..."> */
  alt?: string
  /** Overall size of the animation in px (or any CSS unit as a string, e.g. "3rem") */
  size?: number | string
  /** Square color — any valid CSS color */
  color?: string
  /** Animation duration in ms */
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  alt: 'Loading...',
  size: 64,
  color: '#3b82f6',
  duration: 1600,
})

// Squares occupy 37.5% of the container; translate distance is the remaining 62.5%
const sizePx = computed<string>(() =>
  typeof props.size === 'number' ? `${props.size}px` : props.size
)

const squareSizePx = computed<string>(() =>
  typeof props.size === 'number'
    ? `${props.size * 0.375}px`
    : `calc(${props.size} * 0.375)`
)

const translatePx = computed<string>(() =>
  typeof props.size === 'number'
    ? `${props.size * 0.625}px`
    : `calc(${props.size} * 0.625)`
)

// CSS custom properties are passed via inline style so Tailwind arbitrary-value
// classes like bg-[var(--sq-color)] can reference them anywhere in the template.
const containerStyle = computed<CSSProperties>(() => ({
  width: sizePx.value,
  height: sizePx.value,
  '--sq-translate': translatePx.value,
  '--sq-duration': `${props.duration}ms`,
  '--sq-color': props.color
}))

const squareStyle = computed<CSSProperties>(() => ({
  width: squareSizePx.value,
  height: squareSizePx.value,
  background: 'var(--sq-color)'
}))
</script>

<style scoped>
@keyframes clockwise {
  0%   { transform: translate(0,                   0); }
  25%  { transform: translate(var(--sq-translate), 0); }
  50%  { transform: translate(var(--sq-translate), var(--sq-translate)); }
  75%  { transform: translate(0,                   var(--sq-translate)); }
  100% { transform: translate(0,                   0); }
}

.square-1 {
  animation: clockwise var(--sq-duration) cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

.square-2 {
  animation: clockwise var(--sq-duration) cubic-bezier(0.45, 0, 0.55, 1) infinite;
  animation-delay: calc(var(--sq-duration) * -0.5);
}
</style>
