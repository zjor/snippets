HEART_RATE_SERVICE = 0x180d
BATTERY_SERVICE = 0x180f

const log = console.log

const initMessage = document.querySelector('#init-message')
const heartContainer = document.querySelector('#heart-container')
const pulseDiv = document.querySelector('#pulse')
const heartDiv = document.querySelector('.heart')

async function main() {
  log('Connecting...')
  initMessage.innerText = "Connecting..."
  const ble = navigator.bluetooth
  if (!await ble.getAvailability()) {
    log('BLE is not available')
    initMessage.innerText = "BLE is not available"
    return
  }

  try {
    const device = await ble.requestDevice({
      filters: [{
        services: [0x180d]
      }]
    })

    const {id, name} = device
    log(`Paired to (${name}; ID: ${id})`)

    const server = await device.gatt.connect()
    log('Connected', server)

    const heartRateService = await server.getPrimaryService('heart_rate')
    log('HR service', heartRateService)

    const hrCharacteristic = await heartRateService.getCharacteristic('00002a37-0000-1000-8000-00805f9b34fb')
    log('Ch connected', hrCharacteristic)
    hrCharacteristic.oncharacteristicvaluechanged = (event) => {
      const data = event.target.value
      log(data)
      const pulse = data.getInt8(1)
      pulseDiv.innerText = pulse

      const duration = 60 / pulse
      heartDiv.style.animation = `pulse ${duration}s infinite`
    }
    hrCharacteristic.startNotifications()
    log('Descriptor: ', await hrCharacteristic.getDescriptors())
    initMessage.style.display = 'none'
    heartContainer.style.display = 'flex'

// characteristing UUID: 00002902-0000-1000-8000-00805f9b34fb
  } catch (e) {
    initMessage.innerText = `Failed to connect: ${e}`
  }
}

window.addEventListener('click', main)

// deployed at: ble-heart-monitor.surge.sh
