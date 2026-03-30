<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

const loggedIn = ref(false)
const showAdobePopup = ref(false)

const username = ref('')
const password = ref('')
const error = ref<string | null>(null)
const displayName = ref<string | null>(null)

onMounted(() => {
  if (isLoggedIn()) {
    const token = getAccessToken()
    displayName.value = token?.username as string ?? null
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
    displayName.value = token?.username as string ?? username.value.trim()
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
</script>

<template>
  <BasePage>
    <!-- Logged in view -->
    <div v-if="loggedIn" class="flex items-center justify-center h-full">
      <div class="flex flex-col items-center gap-4">
        <h1 class="text-3xl font-bold">Account</h1>
        <p class="text-slate-400">Signed in{{ displayName ? ` as ${displayName}` : '' }}.</p>
        <button class="styled-btn px-4 py-2 rounded-lg" @click="logout">Log out</button>
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

        <div class="flex items-center gap-3">
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
        </button>
      </div>
    </div>

    <!-- Adobe login popup -->
    <Popup v-if="showAdobePopup" @close="showAdobePopup = false">
      <h2 class="text-lg font-semibold mb-2">Adobe Sign In</h2>
      <p class="text-slate-400">Placeholder</p>
    </Popup>
  </BasePage>
</template>
