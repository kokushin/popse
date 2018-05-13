const { BrowserWindow, dialog } = require('electron').remote
const fs = require('fs')

const audioCtx = new (window.AudioContext || window.webkitAudioContext)()

const state = {
  src: '',
  loaded: false,
  played: false
}

window.addEventListener('load', init)

function init () {
  document.getElementById('load-sound').addEventListener('click', (e) => {
    e.preventDefault()
    openLoadFile()
  })

  document.getElementById('play-sound').addEventListener('click', (e) => {
    e.preventDefault()
    playSound()
  })
}

function openLoadFile () {
  const win = BrowserWindow.getFocusedWindow()

  dialog.showOpenDialog(
    win,
    {
      properties: ['openFile'],
      filters: [
        {
          name: 'Sounds',
          extensions: ['wav', 'mp3', 'm4a']
        }
      ]
    },
    (fileNames) => {
      if (fileNames) {
        readFile(fileNames[0])
      }
    }
  )
}

function toArrayBuffer (data) {
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
}

function readFile (path) {
  fs.readFile(path, (error, data) => {
    if (error !== null) {
      console.log(`Error: ${error}`)
      return
    }

    audioCtx.decodeAudioData(toArrayBuffer(data), (buffer) => {
      state.src = audioCtx.createBufferSource()
      state.src.buffer = buffer
      state.src.connect(audioCtx.destination)

      state.loaded = true
      console.log('Sound file ready.')
    })
  })
}

function playSound () {
  if (!state.loaded) {
    console.log('Error: Not file loaded.')
    return
  }

  if (!state.played) {
    soundControls('play')

    state.played = true
  } else {
    const currentBuffer = state.src.buffer

    state.src = audioCtx.createBufferSource()
    state.src.buffer = currentBuffer
    state.src.connect(audioCtx.destination)

    soundControls('play')
  }
}

function soundControls (control) {
  switch (control) {
    case 'play':
      state.src.start(0)
      console.log('出たぁ')
      break;
  }
}
