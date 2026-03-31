(() => {
  if (window.self === window.top) return

  const gameId = parseInt(window.location.pathname.split('/')[3], 10)
  if (isNaN(gameId)) return

  let debounceTimer = null

  function snapshot() {
    const data = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      data[key] = localStorage.getItem(key)
    }
    return data
  }

  function scheduleSave() {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      window.parent.postMessage({ type: 'savedata:save', gameId, data: snapshot() }, '*')
    }, 500)
  }

  const realStorage = window.localStorage
  const storageProxy = new Proxy(realStorage, {
    get(target, prop) {
      const value = target[prop]
      if (typeof value === 'function') {
        if (prop === 'setItem') {
          return (key, val) => {
            target.setItem(key, val)
            scheduleSave()
          }
        }
        if (prop === 'removeItem') {
          return (key) => {
            target.removeItem(key)
            scheduleSave()
          }
        }
        if (prop === 'clear') {
          return () => {
            target.clear()
            scheduleSave()
          }
        }
        return value.bind(target)
      }
      return value
    }
  })

  Object.defineProperty(window, 'localStorage', {
    get: () => storageProxy,
    configurable: true,
  })

  let loadResolved = false

  window.addEventListener('message', (event) => {
    if (event.source !== window.parent) return
    if (event.data?.type !== 'savedata:load') return
    if (loadResolved) return
    loadResolved = true

    const data = event.data.data
    if (data && typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        realStorage.setItem(key, value)
      }
    }
  })

  setTimeout(() => { loadResolved = true }, 3000)

  window.parent.postMessage({ type: 'savedata:request', gameId }, '*')
})()
