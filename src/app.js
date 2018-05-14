const { globalShortcut, BrowserWindow, dialog } = require('electron').remote
const fs = require('fs')

const audioCtx = new (window.AudioContext || window.webkitAudioContext)()

class App {
  constructor () {
    this.$el = {
      document: $(document),
      panel: $('#js-panel'),
      addBtn: $('#js-add'),
      removeBtn: $('#js-remove'),
      saveBtn: $('#js-save'),
      loadSoundBtn: $('.js-load-sound'),
      playSoundBtn: $('.js-play-sound'),
    }

    this.state = {
      data: [],
      loaded: [],
      played: [],
      index: 0,
    }

    this.init()
  }

  init () {
    this.$el.document.on('click', '.js-load-sound', (e) => {
      this.setIndex($(e.currentTarget))
      this.openLoadFile()
    })

    this.$el.document.on('click', '.js-play-sound', (e) => {
      this.setIndex($(e.currentTarget))
      this.playSound(this.state.index)
    })

    this.$el.addBtn.on('click', () => {
      this.addPanelItem()
    })

    this.$el.removeBtn.on('click', () => {
      this.removePanelItem()
    })

    this.$el.saveBtn.on('click', () => {
      this.applyCommand()
    })
  }

  addPanelItem () {
    this.$el.panel.append(`
      <div class="panel-item js-panel-item">
        <button class="js-load-sound">音源の読み込み</button>
        <button class="js-play-sound">プレビュー</button>
        <input class="js-command" type="text" value="Command+Control+D">
      </div>
    `)
  }

  removePanelItem () {
    if (this.$el.panel.children().length > 1) {
      this.$el.panel.children().last().remove()
    }
  }

  applyCommand () {
    if (!this.state.loaded[0]) {
      alert('エラー: 音声ファイルを読み込ませてください')
      return
    } else {
      globalShortcut.unregisterAll()
    }

    const $panelItem = $('.js-panel-item')

    for (let i = 0; i < $panelItem.length; i++) {
      const command = $panelItem.eq(i).find('.js-command')[0].value

      globalShortcut.register(command, () => {
        this.playSound(i)
      })
    }

    alert('コマンドを適用しました')
  }

  openLoadFile () {
    const win = BrowserWindow.getFocusedWindow()

    dialog.showOpenDialog(
      win,
      {
        properties: ['openFile'],
        filters: [
          {
            name: 'Sounds',
            extensions: ['wav', 'mp3', 'ogg', 'm4a'],
          }
        ]
      },
      (fileNames) => {
        if (fileNames) {
          this.readFile(fileNames[0])
        }
      }
    )
  }

  readFile (path) {
    fs.readFile(path, (error, data) => {
      if (error !== null) {
        alert(`エラー: ${error}`)
        return
      }

      audioCtx.decodeAudioData(this.arrayBuffer(data), (buffer) => {
        this.state.data[this.state.index] = {
          src: audioCtx.createBufferSource()
        }

        this.state.data[this.state.index].src.buffer = buffer
        this.state.data[this.state.index].src.connect(audioCtx.destination)

        this.state.loaded[this.state.index] = true

        $('.js-panel-item').eq(this.state.index).addClass('is-loaded')
      })
    })
  }

  playSound (index) {
    if (!this.state.loaded[index]) {
      alert('エラー: 音声ファイルを読み込ませてください')
      return
    }

    if (!this.state.played[index]) {
      this.soundControls('play', index)

      this.state.played[index] = true
    } else {
      const currentBuffer = this.state.data[index].src.buffer

      this.state.data[index].src = audioCtx.createBufferSource()
      this.state.data[index].src.buffer = currentBuffer
      this.state.data[index].src.connect(audioCtx.destination)

      this.soundControls('play', index)
    }
  }

  soundControls (control, index) {
    switch (control) {
      case 'play':
        this.state.data[index].src.start(0)
        break
    }
  }

  setIndex($el) {
    this.state.index = $el.closest('.panel-item').index()
  }

  arrayBuffer (data) {
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
  }
}

new App()
