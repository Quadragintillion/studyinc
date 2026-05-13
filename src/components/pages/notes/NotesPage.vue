<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import BasePage from '../BasePage.vue'
import LoadingIcon from '@/components/misc/LoadingIcon.vue'
import Popup from '@/components/popups/Popup.vue'
import { formatText } from '@/composables/format'

// injected by proxy scripts

declare const __uv$config: {
  prefix: string
  encodeUrl: (url: string) => string
  decodeUrl: (url: string) => string
}

declare namespace BareMux {
  class BareMuxConnection {
    constructor(workerPath: string)
    getTransport(): Promise<string | null>
    setTransport(path: string, args: unknown[]): Promise<void>
  }
}

interface ScramjetController {
  init(): void
  encodeUrl(url: string): string
  decodeUrl(url: string): string
}

declare function $scramjetLoadController(): { ScramjetController: new (config: object) => ScramjetController }



interface Tab {
  id: number
  title: string
  url: string
  selected: boolean
  loading: boolean
  ready: boolean
}

const bookmarks = [
  { title: 'Fixed YT', icon: '/icons/co/videos2.png', page: ['https://inv.thepixora.com/', 'https://yt.chocolatemoo53.com/'] },
  { title: 'Discord', icon: '/icons/co/tutorplusplus.webp', page: 'https://discord.com/' },
  { title: 'Movies', icon: '/icons/co/videos.png', page: 'https://www.cineby.sc/' },
  { title: 'Music', icon: '/icons/co/mashedpotatomelodies.svg', page: 'https://monochrome.tf/' },
]

const tabs = ref<Tab[]>([])
const searchBarValue = ref('')
const proxyReady = ref(false)

const wispUrl = (location.protocol === 'https:' ? 'wss' : 'ws') + '://' + location.host + '/wisp/'

let connection: InstanceType<typeof BareMux.BareMuxConnection> | null = null
let scramjet: ScramjetController | null = null
// tracks iframes being loaded, since if you open a new tab and one is already loading it'll get all confuzzled, this makes them cancelable
const loadAbortControllers = new Map<number, AbortController>()

const noteFrame = ref<HTMLDivElement | null>(null)
let noteFrameRoot: ShadowRoot | null = null
const noteFrames = new Map<number, HTMLIFrameElement>()

const activeTab = computed(() => tabs.value.find(t => t.selected) ?? null)

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Don't double-load scripts that are already present
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}



async function initProxy() {
  await loadScript('/uv/uv.bundle.js')
  await loadScript('/uv/uv.config.js')
  await loadScript('/baremux/index.js')
  await loadScript('/scram/scramjet.all.js')

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.error)
    // fallback
    navigator.serviceWorker.register('/uv/sw.js').catch(console.error)
  }

  try {
    const { ScramjetController } = $scramjetLoadController()
    scramjet = new ScramjetController({
      files: {
        wasm: '/scram/scramjet.wasm.wasm',
        all:  '/scram/scramjet.all.js',
        sync: '/scram/scramjet.sync.js',
      },
    })
    scramjet.init()
  } catch (e) {
    console.error('Scramjet init failed:', e)
  }

  try {
    connection = new BareMux.BareMuxConnection('/baremux/worker.js')
  } catch (e) {
    console.error('BareMux init failed:', e)
  }

  proxyReady.value = true
}



function nextId() {
  return tabs.value.length ? Math.max(...tabs.value.map(t => t.id)) + 1 : 1
}

function getIframe(tabId: number): HTMLIFrameElement | null {
  return noteFrames.get(tabId) ?? null
}

function syncNoteFrames() {
  if (!noteFrameRoot) return

  for (const [id, frame] of noteFrames) {
    if (!tabs.value.some(t => t.id === id)) {
      frame.remove()
      noteFrames.delete(id)
    }
  }

  for (const tab of tabs.value) {
    let frame = noteFrames.get(tab.id)
    if (!frame) {
      frame = document.createElement('iframe')
      frame.src = 'about:blank'
      frame.dataset.iframe = String(tab.id)
      frame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;'
      noteFrameRoot.appendChild(frame)
      noteFrames.set(tab.id, frame)
    }
    const visible = tab.selected && tab.ready
    frame.style.zIndex = visible ? '10' : '0'
    frame.style.opacity = visible ? '1' : '0'
    frame.style.pointerEvents = visible ? 'auto' : 'none'
  }
}

watch(tabs, syncNoteFrames, { deep: true, flush: 'sync' })

function createTab() {
  tabs.value.forEach(t => (t.selected = false))
  const id = nextId()
  tabs.value.push({ id, title: 'New note', url: '', selected: true, loading: false, ready: false })
  searchBarValue.value = ''
}

function selectTab(id: number) {
  tabs.value.forEach(t => (t.selected = false))
  const tab = tabs.value.find(t => t.id === id)
  if (!tab) return
  tab.selected = true
  searchBarValue.value = tab.url
}

function closeTab(id: number, e: MouseEvent) {
  e.stopPropagation()
  const wasSelected = tabs.value.find(t => t.id === id)?.selected
  loadAbortControllers.get(id)?.abort()
  loadAbortControllers.delete(id)
  tabs.value = tabs.value.filter(t => t.id !== id)
  if (tabs.value.length === 0) {
    createTab()
  } else if (wasSelected) {
    const last = tabs.value[tabs.value.length - 1]!
    last.selected = true
    searchBarValue.value = last.url
  }
}

async function navigateTo(raw: string) {
  const tab = activeTab.value
  if (!tab) return

  let url = raw.trim()
  if (!url) return

  if (!url.includes('.')) {
    url = 'https://duckduckgo.com/?ia=web&q=' + encodeURIComponent(url)
  } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  if (isBlocked(url)) {
    blockedPopupActive.value = true
    return
  }

  if (connection) {
    if (!await connection.getTransport()) {
      await connection.setTransport('/epoxy/index.mjs', [{ wisp: wispUrl }])
    }
  }

  const useUV = localStorage.getItem('poxy') === 'uv'
  let proxied: string
  if (useUV) {
    proxied = __uv$config.prefix + __uv$config.encodeUrl(url)
  } else {
    if (!scramjet) { console.error('Scramjet not ready'); return }
    proxied = scramjet.encodeUrl(url)
  }

  tab.url = url
  tab.loading = true
  tab.ready = false // need to hide till it fully loads otherwise it behaves really annoyingly
  searchBarValue.value = url

  // all iframes are loaded just not visible
  // wouldn't want the page reloading each time now would we
  await nextTick()
  const iframe = getIframe(tab.id)
  if (!iframe) return

  // cancel any other load listeners
  // we DON'T clone the iframe, bc that causes issues with the page becoming blank
  loadAbortControllers.get(tab.id)?.abort()
  const ac = new AbortController()
  loadAbortControllers.set(tab.id, ac)

  iframe.addEventListener('load', () => onIframeLoad(iframe, tab.id), { signal: ac.signal })
  iframe.src = proxied
}

function onIframeLoad(iframe: HTMLIFrameElement, tabId: number) {
  const tab = tabs.value.find(t => t.id === tabId)
  if (!tab) return
  tab.loading = false
  tab.ready = true

  try {
    const useUV = localStorage.getItem('poxy') === 'uv'
    const href = iframe.contentWindow?.location.href ?? ''
    let decoded: string
    if (useUV) {
      decoded = __uv$config.decodeUrl(href.replace(__uv$config.prefix, ''))
    } else {
      decoded = scramjet?.decodeUrl(href) ?? href
    }
    tab.url = decoded
    if (tab.selected) searchBarValue.value = decoded
    tab.title = iframe.contentDocument?.title || decoded
  } catch {
    // Cross-origin: can't read contentWindow, that's fine
    tab.loading = false
  }
}


function reloadActive() {
  const tab = activeTab.value
  if (!tab || !tab.url) return
  getIframe(tab.id)?.contentWindow?.location.reload()
  tab.loading = true
}

function goBack() {
  const tab = activeTab.value
  if (!tab) return
  getIframe(tab.id)?.contentWindow?.history.back()
}

function goForward() {
  const tab = activeTab.value
  if (!tab) return
  getIframe(tab.id)?.contentWindow?.history.forward()
}

function onSearchKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') navigateTo(searchBarValue.value)
}


const browserPopupActive = ref(false)
const blockedPopupActive = ref(false)

const blockedDomains = ['FAAdCAwaDUgHAAI=', 'HBkGAgEAHEgHAAI=', 'FhoDA1dbQR4cFw==', 'DgodDQkOGwNKDAAL', 'HAEXHkoMAAs=', 'HAcOCxcbChRKDAAL', 'FgoLEhENCkgHAAI=', 'HQAaFgsdAUgHAAI=', 'EBoNA1xBDAkJ', 'Fx8OCA8NDggDQQwJCQ==', 'AR8AFAoKHUgHAAI=', 'EAEOAAgGF0gHAAI=', 'Bh0OHB4KHRVKDAAL', 'Bg4BAQYdABVKDAAL', 'ChoNDwgKHEgKChs=', 'CwEDHwIOARVKDAAL', 'BwcOEhEdDQcQCkEFCwI=']

function isBlocked(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')
    return blockedDomains.some(d => hostname === formatText(d) || hostname.endsWith('.' + formatText(d)))
  } catch {
    return false
  }
}

onMounted(async () => {
  if (navigator.vendor !== 'Google Inc.') {
    browserPopupActive.value = true
  }

  if (noteFrame.value) {
    noteFrameRoot = noteFrame.value.attachShadow({ mode: 'open' })
  }

  await initProxy()
  createTab()
})
</script>

<template>
  <BasePage class="flex flex-col overflow-hidden">

    <!-- Tab bar -->
    <div class="flex items-center gap-1 px-2 pt-2 bg-base shrink-0 overflow-x-auto">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-sm cursor-pointer shrink-0 max-w-[180px] transition-colors select-none"
        :class="tab.selected
          ? 'bg-slate-700 text-white'
          : 'bg-slate-800 text-slate-400 hover:bg-slate-700/60'"
        @click="selectTab(tab.id)"
      >
        <LoadingIcon v-if="tab.loading" :size="12" color="rgb(129 140 248)" class="shrink-0" />

        <span class="truncate flex-1">{{ tab.title }}</span>

        <button
          class="text-slate-500 hover:text-white transition-colors shrink-0"
          @click.stop="closeTab(tab.id, $event)"
        >
          <img src="/icons/x.svg" class="w-3 h-3" alt="Close" />
        </button>
      </div>

      <button
        class="px-2.5 py-1.5 rounded-t-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors shrink-0"
        @click="createTab"
      >
        <img src="/icons/plus.svg" class="w-4 h-4" alt="New tab" />
      </button>
    </div>

    <!-- Address bar -->
    <div class="flex items-center gap-2 px-3 py-2 bg-slate-700 border-b border-slate-600 shrink-0">
      <button
        class="flex items-center justify-center text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-600"
        title="Back"
        @click="goBack"
      >
        <img src="/icons/arrows/left.svg" class="w-4 h-4" alt="Back" />
      </button>

      <button
        class="flex items-center justify-center text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-600"
        title="Forward"
        @click="goForward"
      >
        <img src="/icons/arrows/right.svg" class="w-4 h-4" alt="Forward" />
      </button>

      <button
        class="flex items-center justify-center text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-600"
        title="Reload"
        @click="reloadActive"
      >
        <img src="/icons/arrows/spinny.svg" class="w-4 h-4" alt="Reload" />
      </button>

      <div class="flex items-center justify-center shrink-0">
        <LoadingIcon v-if="activeTab?.loading" :size="16" color="rgb(129 140 248)" />
        <img v-else src="/icons/lock.svg" class="w-4 h-4 opacity-60" alt="Secure" />
      </div>

      <input
        v-model="searchBarValue"
        type="text"
        placeholder="Search or enter address"
        spellcheck="false"
        class="search-bar flex-1 px-3 py-1.5 text-sm outline-none text-white placeholder-slate-400"
        @keydown="onSearchKeydown"
      />
    </div>

    <!-- Page area -->
    <div class="flex-1 min-h-0 relative">
      <template v-for="tab in tabs" :key="tab.id">
        <div
          v-show="tab.selected && !tab.url"
          class="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-slate-800 z-20"
        >
          <div class="flex items-center gap-2 w-full max-w-md px-4">
            <img src="/icons/co/quacker.png" class="w-8 h-8 object-contain shrink-0" alt="DuckDuckGo" />
            <input
              :id="`new-tab-search-${tab.id}`"
              type="text"
              placeholder="Search Notes"
              spellcheck="false"
              class="search-bar flex-1 px-4 py-2 outline-none text-white placeholder-slate-400"
              @keydown="(e) => { if (e.key === 'Enter') navigateTo((e.target as HTMLInputElement).value) }"
            />
          </div>

          <div class="flex gap-4 flex-wrap justify-center px-4">
            <button
              v-for="page in bookmarks"
              :key="page.title"
              class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-700/60 transition-colors group"
              @click="navigateTo(Array.isArray(page.page) ? page.page[Math.floor(Math.random() * page.page.length)]! : page.page)"
            >
              <img :src="page.icon" class="w-10 h-10 object-contain rounded-lg" :alt="page.title" />
              <span class="text-xs text-slate-400 group-hover:text-white transition-colors">{{ page.title }}</span>
            </button>
          </div>
        </div>
      </template>

      <div ref="noteFrame" class="absolute inset-0"></div>
    </div>

  </BasePage>
  <Popup :show="browserPopupActive" v-on:close="browserPopupActive = false">
    <p>ts page only works on chromium btw</p>
  </Popup>
  <Popup :show="blockedPopupActive" v-on:close="blockedPopupActive = false">
    <p>ok THAT i can't let you do</p>
  </Popup>
</template>

<style scoped>
@reference "../../../main.css";

.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  @apply bg-slate-600 rounded-full;
}
</style>