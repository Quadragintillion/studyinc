<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Popup from '@/components/popups/Popup.vue'
import BasePage from '../BasePage.vue'
import LoadingIcon from '@/components/misc/LoadingIcon.vue'
import {
  isLoggedIn,
  loginWithPassword,
  registerWithPassword,
  getAccessToken,
  clearTokens,
} from '@/composables/amethyst'
import { useToolStore } from '@/stores/tools'
import { useSavedataStore } from '@/stores/savedata'

const toolStore = useToolStore()
const savedataStore = useSavedataStore()

const loggedIn = ref(false)
const showAdobePopup = ref(false)

const username = ref('')
const password = ref('')
const error = ref<string | null>(null)
const displayName = ref<string | null>(null)

const busy = computed(() => savedataStore.bulkOp !== null)
const confirmReset = ref(false)
const showImportDone = ref(false)
const importError = ref<string | null>(null)

function handleReset() {
  if (!confirmReset.value) {
    confirmReset.value = true
    setTimeout(() => { confirmReset.value = false }, 3000)
    return
  }
  confirmReset.value = false
  savedataStore.reset()
}

const progress = computed(() => {
  if (!busy.value) return null
  return {
    op: savedataStore.bulkOp,
    done: savedataStore.bulkDone,
    total: savedataStore.bulkTotal,
    pct: savedataStore.bulkTotal > 0
      ? Math.round((savedataStore.bulkDone / savedataStore.bulkTotal) * 100)
      : 0,
  }
})

async function getToolIds(): Promise<number[]> {
  if (toolStore.tools.length === 0) await toolStore.fetchTools()
  return toolStore.tools.map((t: Tool) => t.id)
}

onMounted(() => {
  if (isLoggedIn()) {
    const token = getAccessToken()
    displayName.value = (token?.userData as Record<string, unknown>)?.username as string ?? null
    loggedIn.value = true
  }
})

type AuthAction = 'login' | 'register'
const loadingAction = ref<AuthAction | null>(null)

async function submit(action: AuthAction) {
  if (!username.value.trim() || !password.value) return
  loadingAction.value = action
  error.value = null

  try {
    if (action === 'login') {
      await loginWithPassword(username.value.trim(), password.value)
    } else {
      await registerWithPassword(username.value.trim(), password.value)
    }
    const token = getAccessToken()
    displayName.value = (token?.userData as Record<string, unknown>)?.username as string ?? username.value.trim()
    loggedIn.value = true
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loadingAction.value = null
  }
}

function logout() {
  clearTokens()
  loggedIn.value = false
  displayName.value = null
  username.value = ''
  password.value = ''
}

async function handleSave() {
  const ids = await getToolIds()
  await savedataStore.saveAll(ids)
}

async function handleLoad() {
  const ids = await getToolIds()
  await savedataStore.loadAll(ids)
}

async function handleExport() {
  const ids = await getToolIds()
  savedataStore.exportToJson(ids)
}

function handleImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json,application/json'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    importError.value = null
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const ids = await getToolIds()
      savedataStore.importFromJson(ids, json)
      showImportDone.value = true
    } catch (err: unknown) {
      importError.value = err instanceof Error ? err.message : 'Failed to parse file'
    }
  }
  input.click()
}
</script>

<template>
  <BasePage>
    <!-- Logged in view -->
    <div v-if="loggedIn" class="flex items-center justify-center h-full">
      <div class="flex flex-col items-center gap-5 w-full max-w-sm px-4">
        <h1 class="text-3xl font-bold">Account</h1>
        <p class="text-slate-400">Signed in{{ displayName ? ` as ${displayName}` : '' }}.</p>

        <!-- Save data actions -->
        <div class="flex items-center gap-3 w-full">
          <hr class="flex-1" />
          <span class="text-slate-400 text-sm">Data</span>
          <hr class="flex-1" />
        </div>
        <div class="w-full flex flex-col gap-3">
          <div class="grid grid-cols-2 gap-2">
            <button
              class="styled-btn px-4 py-2 rounded-lg font-semibold h-10 flex items-center justify-center"
              :disabled="busy"
              @click="handleExport"
            >
              <img src="/icons/savedata/file-up.svg" class="w-4 h-4 mr-2 brightness-0 invert" />
              Export
            </button>
            <button
              class="styled-btn px-4 py-2 rounded-lg font-semibold h-10 flex items-center justify-center"
              :disabled="busy"
              @click="handleImport"
            >
              <img src="/icons/savedata/file-down.svg" class="w-4 h-4 mr-2 brightness-0 invert" />
              Import
            </button>
            <button
              class="styled-btn px-4 py-2 rounded-lg font-semibold h-10 flex items-center justify-center"
              :disabled="busy"
              @click="handleSave"
            >
              <LoadingIcon v-if="progress?.op === 'save'" :size="22" />
              <template v-else>
                <img src="/icons/savedata/cloud-up.svg" class="w-4 h-4 mr-2 brightness-0 invert" />
                Save
              </template>
            </button>
            <button
              class="styled-btn px-4 py-2 rounded-lg font-semibold h-10 flex items-center justify-center"
              :disabled="busy"
              @click="handleLoad"
            >
              <LoadingIcon v-if="progress?.op === 'load'" :size="22" />
              <template v-else>
                <img src="/icons/savedata/cloud-down.svg" class="w-4 h-4 mr-2 brightness-0 invert" />
                Load
              </template>
            </button>
          </div>

          <button
            class="styled-btn px-4 py-2 rounded-lg font-semibold h-10 flex items-center justify-center col-span-2 w-full"
            :disabled="busy"
            @click="handleReset"
          >
            <img src="/icons/x.svg" class="w-4 h-4 mr-2 brightness-0 invert" />
            {{ confirmReset ? 'Are you sure?' : 'Reset All Data' }}
          </button>

          <p v-if="importError" class="text-red-400 text-sm text-center">{{ importError }}</p>

          <!-- Progress bar -->
          <div v-if="progress" class="w-full flex flex-col gap-1">
            <div class="flex justify-between text-sm text-slate-400">
              <span>{{ progress.op === 'save' ? 'Saving...' : 'Loading...' }}</span>
              <span>{{ progress.done }}/{{ progress.total }}</span>
            </div>
            <div class="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                class="bg-indigo-500 h-2 rounded-full"
                :style="{ width: `${progress.pct}%` }"
              />
            </div>
          </div>
        </div>

        <button class="styled-btn px-4 py-2 rounded-lg" :disabled="busy" @click="logout">
          Log out
        </button>
      </div>
    </div>

    <!-- Login view -->
    <div v-else class="flex items-center justify-center h-full">
      <div class="flex flex-col gap-5 w-full max-w-sm px-4">
        <h1 class="text-3xl font-bold text-center">Account</h1>

        <form class="flex flex-col gap-3" @submit.prevent>
          <input
            v-model="username"
            type="text"
            placeholder="Username"
            class="styled-input px-4 py-2 rounded-lg bg-slate-700 outline-none w-full placeholder-slate-400"
            :disabled="loadingAction !== null"
          />
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="styled-input px-4 py-2 rounded-lg bg-slate-700 outline-none w-full placeholder-slate-400"
            :disabled="loadingAction !== null"
          />
          <p v-if="error" class="text-red-400 text-sm text-center">{{ error }}</p>
          <div class="flex gap-2">
            <button
              type="button"
              class="styled-btn px-4 py-2 font-semibold rounded-lg flex items-center justify-center h-10 flex-1"
              :disabled="loadingAction !== null"
              @click="submit('login')"
            >
              <LoadingIcon v-if="loadingAction === 'login'" :size="22" />
              <span v-else>Log in</span>
            </button>
            <button
              type="button"
              class="styled-btn px-4 py-2 font-semibold rounded-lg flex items-center justify-center h-10 flex-1"
              :disabled="loadingAction !== null"
              @click="submit('register')"
            >
              <LoadingIcon v-if="loadingAction === 'register'" :size="22" />
              <span v-else>Register</span>
            </button>
          </div>
        </form>

        <!-- <div class="flex items-center gap-3">
          <hr class="flex-1" />
          <span class="text-slate-400 text-sm">OR</span>
          <hr class="flex-1" />
        </div>

        <button
          class="styled-btn px-4 py-2 rounded-lg flex items-center justify-center h-10"
          :disabled="loadingAction !== null"
          @click="showAdobePopup = true"
        >
          <span class="font-semibold mr-2">Log in with</span>
          <img src="/icons/adobe.svg" class="h-5 brightness-0 invert" />
        </button> -->
      </div>
    </div>

    <!-- Import done popup -->
    <Popup :show="showImportDone" @close="showImportDone = false">
      <h2 class="text-lg font-semibold mb-2">Data loaded</h2>
      <p class="text-slate-400">Save data was successfully imported.</p>
    </Popup>

    <!-- Adobe login popup -->
    <Popup :show="showAdobePopup" @close="showAdobePopup = false">
      <h2 class="text-lg font-semibold mb-2">Adobe Sign In</h2>
      <p class="text-slate-400">Accounts aren't fully done yet, since you can't really use emails for accounts (for obvious reasons) they can be verified via Adobe in a kinda weird way. But ya verifying with Adobe will give you Al stuff and allat.</p>
    </Popup>
  </BasePage>
</template>
