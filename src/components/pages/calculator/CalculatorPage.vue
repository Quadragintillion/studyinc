<script setup lang="ts">
import { ref, nextTick, onMounted, useTemplateRef } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import katex from 'katex'
import 'katex/dist/katex.min.css'
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
const inputEl = useTemplateRef<HTMLTextAreaElement>('inputEl')

function autosize() {
  const el = inputEl.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 200)}px`
}

function renderMath(src: string): string {
  const placeholders: string[] = []
  const stash = (tex: string, display: boolean) => {
    try {
      const html = katex.renderToString(tex, {
        displayMode: display,
        throwOnError: false,
        output: 'html',
      })
      placeholders.push(html)
      return `@@KMATH${placeholders.length - 1}KMATH@@`
    } catch {
      return display ? `[${tex}]` : `(${tex})`
    }
  }

  let s = src

  s = s.replace(/\\\[([\s\S]+?)\\\]/g, (_, tex) => stash(tex, true))
  s = s.replace(/\\\(([\s\S]+?)\\\)/g, (_, tex) => stash(tex, false))
  s = s.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => stash(tex, true))

  s = s.replace(/^[ \t]*\[[ \t]*\n?([\s\S]+?)\n?[ \t]*\][ \t]*$/gm, (m, tex) => {
    if (!/\\/.test(tex)) return m
    return stash(tex, true)
  })

  s = s.replace(/\(([^()\n]*\\[^()\n]*)\)/g, (_, tex) => stash(tex, false))

  let html = DOMPurify.sanitize(marked.parse(s, { async: false }) as string, {
    ADD_TAGS: ['semantics', 'annotation', 'math', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'msqrt', 'mtext'],
    ADD_ATTR: ['encoding', 'mathvariant'],
  })
  html = html.replace(/@@KMATH(\d+)KMATH@@/g, (_, i) => placeholders[Number(i)] ?? '')
  return html
}

async function scrollToBottom() {
  await nextTick()
  if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
}

async function send() {
  const text = input.value.trim()
  if (!text || sending.value) return

  messages.value.push({ role: 'user', content: text })
  input.value = ''
  nextTick(autosize)
  error.value = null
  sending.value = true
  scrollToBottom()

  try {
    const res = await fetch('/api/calculator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          {
            role: 'system',
            content: 'You are an AI chatbot named ChudGPT based off of OpenAI\'s GPT-OSS-20b, for the game site StudyInc (the name is that so that it doesn\'t get auto-blocked), owned by "John StudyInc."\n'
              + 'The site has 6 tabs: Tools (games), Calculator (you), Notes (proxy, temporarily disabled due to people using too much network data), Tutoring (a Matrix chat client based on Cinny), Account (used to save and load game data and access Cinny, no email needed) and Settings (has a button to open the site in about:blank and has a setting to hide games with mature themes, which is on by default)\n'
              + 'If and only if the user asks you to give them a new link to this site you can give them the link \'petstroy.com\'.\n'
              + 'Unless prompted with something that justifies a long response, you should tend to keep your responses short - this is an iMessage-like interface, so it doesn\'t make sense to flood it with a lot of text unless it\'s necessary.\n'
              + 'If the user asks a question you don\'t know the answer to about the site or asks to contact the owner, you can tell them to join the Discord (2nd card on the Tools tab) or join the Matrix chat on the Tutoring tab.\n'
              + 'People who were previously on the original link, mnm.business, are kinda frustrated right now because it originally had a lot more games. If they ask you about it, explain that this site was originally a gn-math (another game site the developer put on there temporarily, but she didn\'t control the games) instance run on the domain mnm.business. The site broke entirely after gn-math got copyright striked, so she changed it to the main StudyInc site she was developing, however their games are extremely easy to be moved here, so please tell the user they can suggest any games they want using the first tool card.\n'
              + 'If the user sends a math equation or something similar (something that seems to be from homework), please show your work instead of the answer - it is important they understand how to GET to the solution.\n'
              + 'Also, if the user starts the conversation saying brainrot, just become crazy and start spamming it like a lunatic. Some nonsense brainrot terms are 67 (SIX SEVENNNN), diddy blud, dih, sigma, skibidi, rizz, ts (used as an unnecessary shortening of the word \'this\'), tuff (meaning really cool/good), tung tung tung sahur (the amount of \'tung\'s can vary from 3 all the way up to 1000), tralalero tralala.\n'},
          ...messages.value.map(m => ({ role: m.role, content: m.content })),
        ],
      }),
    })

    if (!res.ok) throw new Error(`Request failed: ${res.status}`)

    const data = await res.json()
    const reply: string = data?.choices?.[0]?.message?.content ?? ''

    if (!reply) throw new Error('Empty response')

    messages.value.push({ role: 'assistant', content: reply })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Something went wrong'
  } finally {
    sending.value = false
    scrollToBottom()
    nextTick(() => inputEl.value?.focus())
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

onMounted(() => {
  nextTick(() => inputEl.value?.focus())
})
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
            v-html="renderMath(msg.content)"
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
            ref="inputEl"
            v-model="input"
            rows="1"
            placeholder="Type an equation..."
            class="flex-1 resize-none search-bar px-4 py-2 outline-none text-white placeholder-slate-400"
            :disabled="sending"
            @keydown="onKeydown"
            @input="autosize"
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
