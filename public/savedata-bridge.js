(() => {
  if (window.self === window.top) return

  const toolId = parseInt(window.location.pathname.split('/')[3], 10)
  if (isNaN(toolId)) return

  const PREFIX = `t${toolId}:`

  const realStorage = window.localStorage


  function prefixedKey(key) { return PREFIX + key }

  function snapshot() {
    const data = {}
    for (let i = 0; i < realStorage.length; i++) {
      const raw = realStorage.key(i)
      if (!raw.startsWith(PREFIX)) continue
      const key = raw.slice(PREFIX.length)
      data[key] = realStorage.getItem(raw)
    }
    return data
  }

  let debounceTimer = null
  function scheduleSave() {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      window.parent.postMessage({ type: 'savedata:save', toolId, data: snapshot() }, '*')
    }, 500)
  }

  const storageProxy = new Proxy(realStorage, {
    get(target, prop) {
      const value = target[prop]
      if (typeof value === 'function') {
        if (prop === 'setItem') {
          return (key, val) => {
            target.setItem(prefixedKey(key), val)
            scheduleSave()
          }
        }
        if (prop === 'removeItem') {
          return (key) => {
            target.removeItem(prefixedKey(key))
            scheduleSave()
          }
        }
        if (prop === 'getItem') {
          return (key) => target.getItem(prefixedKey(key))
        }
        if (prop === 'key') {
          return (index) => {
            // Expose only this tool's keys, re-indexed
            const keys = []
            for (let i = 0; i < target.length; i++) {
              const k = target.key(i)
              if (k.startsWith(PREFIX)) keys.push(k.slice(PREFIX.length))
            }
            return keys[index] ?? null
          }
        }
        if (prop === 'clear') {
          return () => {
            const toRemove = []
            for (let i = 0; i < target.length; i++) {
              const k = target.key(i)
              if (k.startsWith(PREFIX)) toRemove.push(k)
            }
            for (const k of toRemove) target.removeItem(k)
            scheduleSave()
          }
        }
        return value.bind(target)
      }
      if (prop === 'length') {
        let count = 0
        for (let i = 0; i < target.length; i++) {
          if (target.key(i).startsWith(PREFIX)) count++
        }
        return count
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
        realStorage.setItem(prefixedKey(key), value)
      }
    }
  })

  setTimeout(() => { loadResolved = true }, 3000)

  window.parent.postMessage({ type: 'savedata:snapshot', toolId, data: snapshot() }, '*')
  window.parent.postMessage({ type: 'savedata:request', toolId }, '*')
})()
