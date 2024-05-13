(async () => {
//

if (!location.pathname.startsWith('/watch')) return;

document.querySelectorAll('#chats-renderer-root').forEach(el => el.remove())

await new Promise(_ => setTimeout(_, 500))
console.log('--- chats-renderer ---')






class ChatsRenderer {

  log (...args) {
    let el = document.querySelector('#chats-log')
    el.innerText = `[${new Date().toLocaleTimeString()}] ` + args.join(' ')
    // clearTimeout(this.__timer)
    // this.__timer = setTimeout(() => el.innerText = '[no log]', 5000)
  }

  _getVideo () {
    return document.querySelector('#movie_player video')
  }

  _getChats () {
    let { document: doc } = document.querySelector('iframe#chatframe')?.contentWindow ?? {}
    if (!doc) {
      this.log('"iframe#chatframe" not matched.')
      return []
    }
    let chats = [...doc.querySelectorAll('yt-live-chat-text-message-renderer')]
      .map(el => ({
        id: el.id,
        authorPhoto: el.querySelector('#author-photo > img')?.src,
        authorName: el.querySelector('#author-name')?.innerText,
        timestamp: el.querySelector('#timestamp')?.innerText,
        message: el.querySelector('#message')?.innerText,
      }))
      // authorName: "煎餅おかき"
      // authorPhoto: "https://yt4.ggpht.com/ytc/AIf8zZRXXbrhW40HYjpVD2y0oKninyEqoFT-mcldyXNpcxN0zA=s32-c-k-c0x00ffffff-no-rj"
      // id: "ChwKGkNKMkUtcU9saklRREZlX0x3Z1FkN2prTHJB"
      // message: "ｴｴﾝﾔﾃﾞ"
      // timestamp: "-0:36"
      .map(({ timestamp, ...d }) => {
        // "-0:36" -> -36
        timestamp = timestamp.replace(/^(?<sign>\-)?((?<h>\d+):)?(?<m>\d+):(?<s>\d+)$/, (...args) => {
          let groups = args.slice(-1)[0]
          let { sign='+', h='0', m, s } = groups
          return Number(sign + (Number(h)*3600 + Number(m)*60 + Number(s)))
        })
        return { timestamp, ...d }
      })
      // .slice(0,5)
    return chats
  }

  _render (chats) {
    /** @type {HTMLCanvasElement} */
    const canvas = document.querySelector('#chats-renderer')
    const { clientWidth: W, clientHeight: H } = canvas
    // const { clientWidth: W, clientHeight: H } = canvas.parentElement
    canvas.setAttribute('width', W)
    canvas.setAttribute('height', H)
    const context = canvas.getContext('2d')

    // const LINES = 12
    const LINES = 15
    const LINE_HEIGHT = Math.floor(H/LINES)

    context.font = `bold ${LINE_HEIGHT}px sun-serif`
    // context.font = `bold ${30}px sun-serif`

    const { paused, currentTime } = this._getVideo()

    // 衝突しないなら上においてく
    // 衝突するなら１段下にトライする
    // 衝突せざるを得ないなら、衝突が最も弱い段におく

    const putText = ({ text, x, y, color='#fff' }) => {
      context.lineJoin = 'miter'
      context.miterLimit = '5'
      context.lineWidth = 2
      context.fillStyle = 'black'
      context.strokeText(text, x, y)
      context.lineWidth = 10
      context.fillStyle = color
      context.fillText(text, x, y)
    }
    let text = 'test', x = 0, y = 0+LINE_HEIGHT, color = '#fff'
    text = `dev ${W}x${H} c:${chats.length}`
    // putText({ text, x, y, color: 'red' })

    chats = chats
      // .filter(chat => chat.timestamp >= currentTime - 5)
      .slice(-10)
    for (let i in chats) {
      let chat = chats[i]
      let { message: text, timestamp } = chat
      let w = context.measureText(text).width
      // putText({ text: `#${i} ${timestamp}: ${text}`, x: 0, y: i*LINE_HEIGHT+LINE_HEIGHT })
      // putText({ text, x: 5, y: i*LINE_HEIGHT+LINE_HEIGHT })
      putText({ text, x: W - w - 5, y: i*LINE_HEIGHT+LINE_HEIGHT })
      if (i > LINES-1) break;
    }

  }

  start () {
    this.log('@start')
    document.body.classList.add('x-chatrendering')
    let count = 0
    this._timer = setInterval(() => {
      if (!document.body.classList.contains('x-chatrendering')) {
        clearInterval(this._timer)
        this._timer = null
        this.log('@stopped')
        return
      }
      let chats = this._getChats()
      this.log('[debug] chats.length:', chats.length)
      this._render(chats)
      // this.log(count)
      count++
    }, 100)
  }

  stop () {
    this.log('@stop')
    document.body.classList.remove('x-chatrendering')
    // clearInterval(this._timer)
    // this._timer = null
  }

  get active () { return !!this._timer }
  toggle () { this.active ? this.stop() : this.start() }

}



document.querySelector('#movie_player').insertAdjacentHTML('beforeend', `<div id="chats-renderer-root">
  <canvas id="chats-renderer"></canvas>
  <div id="chats-header">
    <span id="chats-start-stop">[start/stop]</span>
    <span style="margin: auto;"></span>
    <span id="chats-log">[no log]</span>
  </div>
</div>`)



let renderer = new ChatsRenderer()
renderer.log('test')
document.querySelector('#chats-start-stop').onclick = () => renderer.toggle()




}) ().catch(console.error)