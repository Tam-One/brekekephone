import { BackgroundTimer } from '../utils/BackgroundTimer'
import { getAuthStore } from './authStore'

export const reconnectAndWaitSip = (fn: Function) => {
  getAuthStore().reconnectSip()
  waitSip(fn)
}

export const waitSip = (fn: Function) => {
  const at = Date.now()
  const id = BackgroundTimer.setInterval(() => {
    const enoughTimePassed = Date.now() - at > 10000
    const isSipConnected = getAuthStore().sipState === 'success'
    if (enoughTimePassed || isSipConnected) {
      BackgroundTimer.clearInterval(id)
      fn(isSipConnected)
    }
  }, 500)
}
