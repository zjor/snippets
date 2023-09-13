const playButton = document.querySelector('#play')
const messageInput = document.querySelector('#message')

const frequencies = {
  vertical: [697, 770, 852, 941],
  horizontal: [1209, 1336, 1477, 1633]
}

const {vertical: vf, horizontal: hf} = frequencies

const fMapping = {
  '0': [hf[1], vf[3]], '1': [hf[0], vf[0]], '2': [hf[1], vf[0]], '3': [hf[2], vf[0]],
  '4': [hf[0], vf[1]], '5': [hf[1], vf[1]], '6': [hf[2], vf[1]], '7': [hf[0], vf[2]],
  '8': [hf[1], vf[2]], '9': [hf[2], vf[2]], 'a': [hf[3], vf[0]], 'b': [hf[3], vf[1]],
  'c': [hf[3], vf[2]], 'd': [hf[3], vf[3]], '*': [hf[0], vf[3]], '#': [hf[2], vf[3]]
}

playButton.addEventListener('click', () => {
  const message = stringToHex(messageInput.value)
    .replaceAll('e', '*')
    .replaceAll('f', '#')
  console.log(`Playing: ${message}`)

  const play = (head, tail) => {
    if (head) {
      playFrequency(fMapping[head], 150)
      setTimeout(() => {
        play(tail.slice(0, 1), tail.slice(1))
      }, 200)
    }
  }
  play(message.slice(0, 1), message.slice(1))
})

function stringToHex(inputString) {
  let hexString = '';
  for (let i = 0; i < inputString.length; i++) {
    const hexCharCode = inputString.charCodeAt(i).toString(16);
    hexString += hexCharCode.length === 1 ? '0' + hexCharCode : hexCharCode;
  }
  return hexString;
}

function playFrequency(frequencies, durationMillis) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillators = []
  const now = audioContext.currentTime

  frequencies.forEach(f => {
    const oscillator = audioContext.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(f, now)

    const volumeNode = audioContext.createGain()
    volumeNode.gain.value = 0.4
    oscillator.connect(volumeNode)
    volumeNode.connect(audioContext.destination)

    oscillators.push(oscillator)
  })

  const start = () => {
    oscillators.forEach(o => o.start())
  }

  const stop = () => {
    setTimeout(() => {
      oscillators.forEach(o => o.stop())
    }, durationMillis)
  }

  start()
  stop()
}
