console.log('id:', chrome.runtime.id)



const reset = async (tab) => {
  let { id: tabId, url } = tab

  // https://www.youtube.com/watch?v=U4jOImFgZ-E
  let { hostname, protocol, pathname } = new URL(url)

  if (!url.startsWith('https://www.youtube.com/watch')) return;

  await chrome.scripting.removeCSS({ target: { tabId }, files: ['youtube.css'] })
  await chrome.scripting.insertCSS({ target: { tabId }, files: ['youtube.css'] })
  await chrome.scripting.executeScript({ target: { tabId }, files: ['youtube.js'] })

  return
}



chrome.runtime.onInstalled.addListener(async () => {
})



chrome.action.onClicked.addListener(async tab => {
  console.log('@ action.onClicked', tab)
  let { id: tabId } = tab

  await chrome.action.setBadgeText({ tabId: tab.id, text: '-_-' })
  setTimeout(() => chrome.action.setBadgeText({ tabId: tab.id, text: '' }), 1000)

  await reset(tab)
})



chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  console.log('@ tabs.onUpdated', tabId, info, tab)
  if (info.status === 'complete') { // "unloaded", "loading", or "complete"
    await reset(tab)
  }
})


