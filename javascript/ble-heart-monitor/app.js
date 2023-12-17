HEART_RATE_SERVICE = 0x180d
BATTERY_SERVICE = 0x180f

const log = console.log

async function main() {
  log('Connecting...')
  const ble = navigator.bluetooth
  if (!await ble.getAvailability()) {
    log('BLE is not available')
    return
  }

  const device = await ble.requestDevice({
    // acceptAllDevices: true
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
    log(data.getInt8(0, true))
    log(data.getInt8(1, true))
    log(data.getInt8(2, true))
    log(data.getInt8(3, true))
  }
  hrCharacteristic.startNotifications()
  log('Descriptor: ', await hrCharacteristic.getDescriptors())
  // log('Value: ', await hrCharacteristic.readValue())

// characteristing UUID: 00002902-0000-1000-8000-00805f9b34fb
}

window.addEventListener('click', main)
