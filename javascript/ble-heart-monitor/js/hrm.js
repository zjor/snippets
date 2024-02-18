const HEART_RATE_SERVICE = 0x180d
const BATTERY_SERVICE = 0x180f

const HEART_RATE_CHARACTERISTIC = '00002a37-0000-1000-8000-00805f9b34fb'

const Status = {
  ready: 0,
  connecting: 1,
  notSupported: 2,
  cancelled: 3,
  failed: 4,
  connected: 5
}

const log = console.log

const HearRateMonitor = ({statusListener, pulseListener}) => {

  const _statusListener = statusListener
  const _pulseListener = pulseListener

  let _deviceId
  let _deviceName

  _statusListener(Status.ready)

  return {
    async connect() {
      const _ble = navigator.bluetooth
      _statusListener(Status.connecting)
      if (!await _ble.getAvailability()) {
        log('BLE is not available')
        _statusListener(Status.notSupported)
        return
      }

      try {
        const device = await _ble.requestDevice({
          filters: [{
            services: [HEART_RATE_SERVICE]
          }]
        })

        const {id, name} = device
        log(`Paired to (${name}; ID: ${id})`)
        _deviceId = id
        _deviceName = name

        const server = await device.gatt.connect()
        log('Connected', server)

        const heartRateService = await server.getPrimaryService('heart_rate')
        log('HR service', heartRateService)

        const hrCharacteristic = await heartRateService.getCharacteristic(HEART_RATE_CHARACTERISTIC)
        log('Connected to characteristics', hrCharacteristic)

        hrCharacteristic.oncharacteristicvaluechanged = (event) => {
          const data = event.target.value
          log(data)
          _pulseListener(data.getInt8(1))
        }
        (await hrCharacteristic.startNotifications())
        _statusListener(Status.connected)
      } catch (e) {
        console.error(e)
        _statusListener(Status.failed)
      }
    },
    getDeviceId() {
      return _deviceId
    },
    getDeviceName() {
      return _deviceName
    }
  }
}

export {Status, HearRateMonitor}
