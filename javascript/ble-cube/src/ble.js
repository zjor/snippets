const log = console.log

const arrayBufferToString = (buffer) => String.fromCharCode.apply(null, new Uint8Array(buffer))

const parseRollPitch = (str) => {
  const [roll, pitch] = str.split('\t').map(v => Number.parseFloat(v))
  return {roll, pitch}
}

const rollSpan = document.querySelector('#roll')
const pitchSpan = document.querySelector('#pitch')

const updateRollPitch = (r, p) => {
  window.state.pitch = p
  window.state.roll = r

  rollSpan.textContent = r
  pitchSpan.textContent = p
}

updateRollPitch(0, 0)

async function main() {
  log('Connecting...')
  const ble = navigator.bluetooth
  if (!await ble.getAvailability()) {
    log('BLE is not available')
    return
  }
  const serviceUUID = 'B93C75B9-F52B-4C4B-8F4B-C48FD6A42CD1'.toLowerCase()
  const device = await ble.requestDevice({
    filters: [
      {
        services: [serviceUUID]
      }
    ]
  })
  const {id, name} = device
  log(`Paired to (${name}; ID: ${id})`)

  const server = await device.gatt.connect()
  log(server)

  const service = await server.getPrimaryService(serviceUUID)
  log(service)

  const characteristic = await service.getCharacteristic(serviceUUID)
  log(characteristic)

  const value = await characteristic.readValue()
  log(value.buffer)

  const {roll, pitch} = parseRollPitch(arrayBufferToString(value.buffer))
  console.log(roll, pitch)
  updateRollPitch(roll, pitch)

  await characteristic.startNotifications()
  characteristic.addEventListener('characteristicvaluechanged', e => {
    const val = arrayBufferToString(e.target.value.buffer)
    const {roll, pitch} = parseRollPitch(val)
    updateRollPitch(roll, pitch)
  })
}

function bleStub() {
  const frame = window.state.frame || 0
  window.state.frame = frame + 1
  const w = frame / 75
  const [roll, pitch] = [0.2 * Math.sin(3 * w), 0.2 * Math.cos(5 * w)]
  updateRollPitch(roll, pitch)
  requestAnimationFrame(bleStub)
}

// document.querySelector('#connect').addEventListener('click', main)

export {bleStub}
