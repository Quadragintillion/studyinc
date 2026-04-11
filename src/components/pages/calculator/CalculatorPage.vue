<script setup lang="ts">
import { ref, nextTick, useTemplateRef } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import BasePage from '../BasePage.vue'
import LoadingIcon from '@/components/misc/LoadingIcon.vue'

type Role = 'user' | 'assistant'
interface Message {
  role: Role
  content: string
}

const messages = ref<Message[]>([])
const input = ref('')
const sending = ref(false)
const error = ref<string | null>(null)
const scrollEl = useTemplateRef<HTMLDivElement>('scrollEl')

async function scrollToBottom() {
  await nextTick()
  if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
}

async function send() {
  const text = input.value.trim()
  if (!text || sending.value) return

  messages.value.push({ role: 'user', content: text })
  input.value = ''
  error.value = null
  sending.value = true
  scrollToBottom()

  try {
    const res = await fetch('/api/calculator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: messages.value.map(m => ({ role: m.role, content: m.content })),
      }),
    })

    if (!res.ok) throw new Error(`Request failed: ${res.status}`)

    const data = await res.json()
    const reply: string = data?.response ?? ''

    if (!reply) throw new Error('Empty response')

    messages.value.push({ role: 'assistant', content: reply })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Something went wrong'
  } finally {
    sending.value = false
    scrollToBottom()
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

function clearChat() {
  messages.value = []
  error.value = null
}
</script>

<template>
  <BasePage>
    <div class="flex flex-col h-full">
      <header class="flex items-center justify-between p-4 border-b border-slate-300 dark:border-slate-700">
        <h1 class="text-xl font-semibold">Calculator</h1>
        <button
          v-if="messages.length"
          class="styled-btn rounded-full px-3 py-1 text-sm"
          @click="clearChat"
        >
          Clear
        </button>
      </header>

      <div ref="scrollEl" class="flex-1 overflow-y-auto p-4 space-y-3">
        <div
          v-for="(msg, i) of messages"
          :key="i"
          :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']"
        >
          <div
            v-if="msg.role === 'user'"
            class="max-w-[80%] px-4 py-2 rounded-2xl whitespace-pre-wrap wrap-break-word bg-blue-500 text-white rounded-br-sm"
          >{{ msg.content }}</div>
          <div
            v-else
            class="max-w-[80%] px-4 py-2 rounded-2xl wrap-break-word bg-slate-300 dark:bg-slate-700 rounded-bl-sm markdown-body"
            v-html="DOMPurify.sanitize(marked.parse(msg.content, { async: false }) as string)"
          ></div>
        </div>

        <div v-if="sending" class="flex justify-start">
          <div class="px-4 py-2 rounded-2xl bg-slate-300 dark:bg-slate-700 rounded-bl-sm flex items-center">
            <LoadingIcon :size="20" />
          </div>
        </div>

        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
      </div>

      <div class="p-4 border-t border-slate-300 dark:border-slate-700">
        <div class="flex gap-2 items-end">
          <textarea
            v-model="input"
            rows="1"
            placeholder="Type an equation..."
            class="flex-1 resize-none search-bar px-4 py-2 outline-none text-white placeholder-slate-400"
            :disabled="sending"
            @keydown="onKeydown"
          />
          <button
            class="styled-btn rounded-full px-4 py-2"
            :disabled="sending || !input.trim()"
            @click="send"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  </BasePage>
</template>
