import '@/utils/captureConsoleOutput'
import './polyfill'
import '@/utils/validator'
import '@/stores/Nav2' // Fix circular dependencies
import '@/stores/authStore2' // Fix circular dependencies
import '@/api/syncPnToken2' // Fix circular dependencies

import { AppRegistry, Platform } from 'react-native'

import App from '@/components/App'
import callStore from '@/stores/callStore'
import { setCallStore } from '@/stores/cancelRecentPn'

setCallStore(callStore)
AppRegistry.registerComponent('QooqiePhone', () => App)

if (Platform.OS === 'web') {
  AppRegistry.runApplication('QooqiePhone', {
    rootTag: document.getElementById('root'),
  })
}
